import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaude, saveDiagnostic, getLastDiagnostic } from "@/lib/claude";

const SYSTEM_PROMPT = `Eres "Guardy", el asistente de inteligencia en ciberseguridad de GuardyScan, potenciado por un experto senior con más de 20 años de experiencia en seguridad ofensiva y defensiva, gobierno de TI, gestión de riesgos, cumplimiento normativo (ISO 27001, NIST CSF, CIS Controls, GDPR, Ley Marco de Ciberseguridad 21.663, SOC 2, PCI-DSS) y respuesta a incidentes en organizaciones Fortune 500 y entidades financieras.

## TU IDENTIDAD
- Eres un CISO virtual con criterio ejecutivo y profundidad técnica.
- Combinas lenguaje técnico riguroso CON lenguaje de negocio claro para CEOs, directores y equipos técnicos.
- Cuando el usuario necesita entender el impacto empresarial, traduces métricas técnicas a riesgo financiero, operativo, reputacional y legal.
- Cuando el usuario es técnico, profundizas en CVEs, CVSS, vectores de ataque, TTPs (MITRE ATT&CK), controles CIS, hardening, etc.

## REGLAS ABSOLUTAS
1. Responde SIEMPRE en español.
2. NUNCA inventes datos, CVEs, nombres de activos ni métricas. Solo usa el contexto JSON proporcionado.
3. Si no hay datos suficientes, dilo claramente y recomienda qué módulo usar.
4. Usa estructura Markdown: encabezados, viñetas, negritas. Facilita la lectura rápida.
5. Siempre cierra con una sección "**📌 Acción recomendada**" con los 1-3 pasos más urgentes.
6. Usa emojis con criterio: 🛡️ 🔒 ⚠️ 🚨 ✅ 📊 📋 💡 🔍 🏢 — no más de 1 por línea.
7. No hay límite de extensión: sé TAN detallado como el contexto lo permita.

## ESTRUCTURA DE RESPUESTA IDEAL
Para análisis de seguridad:
1. **Diagnóstico ejecutivo** (2-3 líneas, lenguaje CEO)
2. **Análisis técnico detallado** (profundidad según datos disponibles)
3. **Impacto en el negocio** (financiero, operativo, reputacional, regulatorio)
4. **Plan de remediación priorizado** (Crítico → Alto → Medio, con timeframes)
5. **📌 Acción recomendada** (próximos pasos concretos)

## MÓDULOS DE GUARDYSCAN
- Centro de Evaluación: Escaneos de seguridad web (headers, SSL/TLS, puertos, vulns)
- Vulnerabilidades: Gestión de hallazgos (CVE, CVSS, remediation tracking)
- Incidentes: Gestión de incidentes (detection, containment, eradication, recovery)
- SIEM: Monitoreo de eventos y alertas en tiempo real
- Gestión de Riesgos: Risk register, BIA, Monte Carlo, heat maps
- Cumplimiento Normativo: ISO 27001, GDPR, SOC 2, PCI-DSS, Ley 21.663
- BCP/DRP: Planes de continuidad y recuperación ante desastres (RTO/RPO)
- Gestión de Terceros: Supply chain risk, vendor assessments
- Comité de Seguridad: Governance, actas, seguimiento de acuerdos
- Inventario de Activos: Asset management, clasificación de información`;

async function getUserContext(userId: string) {
  const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => {
    try { return await p; } catch { return fallback; }
  };

  const [
    recentScans, openIncidents, allIncidentsCount,
    criticalVulns, allVulnsCount, remediatedVulnsCount,
    openAlerts, totalAlerts, riskAssessments,
    complianceAssessments, bcpPlans, thirdPartyRisks,
    subscription, committeeSessionsCount,
  ] = await Promise.all([
    safe(prisma.scan.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5, select: { targetUrl: true, status: true, score: true, createdAt: true, vulnerabilities: true, sslInfo: true } }), []),
    safe(prisma.incident.findMany({ where: { userId, status: { in: ["OPEN", "IN_PROGRESS"] } }, orderBy: { createdAt: "desc" }, take: 10, select: { title: true, description: true, severity: true, status: true, category: true, detectedAt: true } }), []),
    safe(prisma.incident.count({ where: { userId } }), 0),
    safe(prisma.vulnerability.findMany({ where: { userId, severity: { in: ["CRITICAL", "HIGH"] }, status: { not: "REMEDIATED" } }, orderBy: { createdAt: "desc" }, take: 15, select: { title: true, description: true, severity: true, status: true, cveId: true, cvssScore: true, assetName: true, remediation: true } }), []),
    safe(prisma.vulnerability.count({ where: { userId } }), 0),
    safe(prisma.vulnerability.count({ where: { userId, status: "REMEDIATED" } }), 0),
    safe(prisma.securityAlert.count({ where: { userId, status: "OPEN" } }), 0),
    safe(prisma.securityAlert.count({ where: { userId } }), 0),
    safe(prisma.riskAssessment.findMany({ where: { userId }, orderBy: { riskScore: "desc" }, take: 8, select: { title: true, riskScore: true, status: true, probability: true, impact: true, category: true, description: true } }), []),
    safe(prisma.complianceAssessment.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6, select: { name: true, overallScore: true, status: true, compliantCount: true, nonCompliantCount: true } }), []),
    safe(prisma.businessContinuityPlan.findMany({ where: { userId }, take: 5, select: { name: true, status: true, rto: true, rpo: true } }), []),
    safe(prisma.thirdPartyRisk.findMany({ where: { userId }, take: 8, select: { vendorName: true, criticality: true, riskScore: true, complianceStatus: true } }), []),
    safe(prisma.subscription.findFirst({ where: { userId }, select: { plan: true, status: true, scansUsed: true, scansLimit: true } }), null),
    safe(prisma.committeeSession.count({ where: { userId } }), 0),
  ]);

  const completedScans = recentScans.filter((s: any) => s.status === "COMPLETED" && s.score);
  const avgScore = completedScans.length > 0
    ? Math.round(completedScans.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / completedScans.length)
    : null;

  return {
    resumen: {
      plan: subscription?.plan || "FREE",
      escaneosUsados: subscription?.scansUsed || 0,
      limiteEscaneos: subscription?.scansLimit || 0,
      puntuacionPromedio: avgScore,
      totalVulnerabilidades: allVulnsCount,
      vulnerabilidadesResueltas: remediatedVulnsCount,
      vulnerabilidadesPendientes: allVulnsCount - remediatedVulnsCount,
      alertasSIEM_abiertas: openAlerts,
      alertasSIEM_total: totalAlerts,
      incidentesAbiertos: openIncidents.length,
      totalIncidentes: allIncidentsCount,
      sesionesComite: committeeSessionsCount,
    },
    ultimosEscaneos: recentScans.map((s: any) => ({
      url: s.targetUrl, estado: s.status, puntuacion: s.score, fecha: s.createdAt,
      numVulnerabilidades: Array.isArray(s.vulnerabilities) ? s.vulnerabilities.length : 0,
    })),
    incidentesAbiertos: openIncidents.map((i: any) => ({
      titulo: i.title, descripcion: i.description?.substring(0, 300),
      severidad: i.severity, estado: i.status, categoria: i.category, detectado: i.detectedAt,
    })),
    vulnerabilidadesCriticasYAltas: criticalVulns.map((v: any) => ({
      titulo: v.title, descripcion: v.description?.substring(0, 300),
      severidad: v.severity, categoria: v.category, cve: v.cveId, cvss: v.cvssScore,
      activo: v.assetName, remediacion: v.remediation?.substring(0, 300),
    })),
    evaluacionesRiesgo: riskAssessments.map((r: any) => ({
      titulo: r.title, descripcion: r.description?.substring(0, 200),
      scoreRiesgo: r.riskScore, probabilidad: r.probability, impacto: r.impact,
      estado: r.status, categoria: r.category,
    })),
    cumplimientoNormativo: complianceAssessments,
    planesContinuidad: bcpPlans,
    proveedoresTerceros: thirdPartyRisks,
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, company: true, industry: true },
    });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const context = await getUserContext(user.id);

    const recentHistory: { role: "user" | "assistant"; content: string }[] = (history || [])
      .slice(-10)
      .map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

    const userMessageWithContext = `## CONTEXTO DE SEGURIDAD DEL USUARIO
**Usuario:** ${user.name || "No especificado"}
**Empresa:** ${user.company || "No especificada"}
**Industria:** ${user.industry || "No especificada"}
**Fecha:** ${new Date().toLocaleDateString("es-CL", { dateStyle: "full" })}

### Datos en tiempo real de la plataforma:
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

---

## PREGUNTA DEL USUARIO
${message}`;

    const reply = await askClaude({
      system: SYSTEM_PROMPT,
      messages: [...recentHistory, { role: "user", content: userMessageWithContext }],
      maxTokens: 2048,
      temperature: 0.6,
    });

    // Guardar respuesta en DB para uso como fallback futuro
    await saveDiagnostic({
      userId: user.id,
      type: "agent_response",
      content: reply,
      context: message.substring(0, 800),
    });

    return NextResponse.json({ reply, source: "claude" });
  } catch (error: any) {
    console.error("Agent error:", error);

    // Intentar devolver el último diagnóstico guardado para este usuario
    try {
      const session2 = await getServerSession(authOptions);
      if (session2?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session2.user.email },
          select: { id: true },
        });
        if (dbUser) {
          const last = await getLastDiagnostic(dbUser.id, "agent_response");
          if (last) {
            return NextResponse.json({
              reply: `⚠️ _El agente está temporalmente no disponible. Mostrando el último análisis generado:_\n\n${last}`,
              source: "cache",
            });
          }
        }
      }
    } catch (_) { /* ignorar */ }

    return NextResponse.json({ error: "Error del agente. Intenta de nuevo." }, { status: 500 });
  }
}
