import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Models to try in order (fallback chain)
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
];

const SYSTEM_PROMPT = `Eres "Guardy", el asistente virtual de ciberseguridad de GuardyScan. Tu rol es ayudar a los usuarios a entender su postura de seguridad en lenguaje de negocio simple y claro.

REGLAS:
- Responde SIEMPRE en español, con lenguaje de negocio (no técnico).
- Traduce vulnerabilidades e incidentes a impacto empresarial (pérdida financiera, reputacional, operativa, legal).
- Sé conciso pero completo. Usa viñetas y estructura clara.
- Usa emojis moderadamente (🛡️ 🔒 ⚠️ ✅ 📊 🚨 📈).
- Prioriza recomendaciones por impacto al negocio.
- NUNCA inventes datos. Solo usa la información del contexto proporcionado.
- Si no hay datos, sugiere al usuario que realice un escaneo o revise el módulo correspondiente.
- Máximo 400 palabras por respuesta.
- Si el usuario saluda, preséntate brevemente y muestra qué puedes hacer.
- Si preguntan algo fuera de ciberseguridad, redirige amablemente al tema.

Módulos disponibles en GuardyScan:
1. Centro de Evaluación (Escaneos de seguridad web)
2. Vulnerabilidades (Gestión de hallazgos de seguridad)
3. Incidentes (Gestión de incidentes de seguridad)
4. SIEM (Monitoreo de eventos y alertas)
5. Gestión de Riesgos (Evaluaciones y controles de riesgo)
6. Cumplimiento Normativo (ISO 27001, GDPR, SOC 2, PCI-DSS)
7. BCP/DRP (Planes de continuidad y recuperación)
8. Gestión de Terceros (Riesgo de proveedores)
9. Comité de Seguridad (Sesiones y seguimiento)
10. Inventario de Activos`;

// ── Fetch user context from all modules ──
async function getUserContext(userId: string) {
  const safeQuery = async <T>(promise: Promise<T>, fallback: T): Promise<T> => {
    try { return await promise; } catch { return fallback; }
  };

  const [
    recentScans,
    openIncidents,
    allIncidentsCount,
    criticalVulns,
    allVulnsCount,
    remediatedVulnsCount,
    openAlerts,
    riskAssessments,
    complianceAssessments,
    bcpPlans,
    thirdPartyRisks,
    subscription,
    committeeSessionsCount,
  ] = await Promise.all([
    safeQuery(prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { targetUrl: true, status: true, score: true, createdAt: true, vulnerabilities: true, sslInfo: true },
    }), []),
    safeQuery(prisma.incident.findMany({
      where: { userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { title: true, description: true, severity: true, status: true, category: true, detectedAt: true },
    }), []),
    safeQuery(prisma.incident.count({ where: { userId } }), 0),
    safeQuery(prisma.vulnerability.findMany({
      where: { userId, severity: { in: ["CRITICAL", "HIGH"] }, status: { not: "REMEDIATED" } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { title: true, description: true, severity: true, status: true, cveId: true, cvssScore: true, assetName: true, remediation: true },
    }), []),
    safeQuery(prisma.vulnerability.count({ where: { userId } }), 0),
    safeQuery(prisma.vulnerability.count({ where: { userId, status: "REMEDIATED" } }), 0),
    safeQuery(prisma.securityAlert.count({ where: { userId, status: "OPEN" } }), 0),
    safeQuery(prisma.riskAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, riskScore: true, status: true, probability: true, impact: true, category: true },
    }), []),
    safeQuery(prisma.complianceAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { name: true, overallScore: true, status: true, compliantCount: true, nonCompliantCount: true },
    }), []),
    safeQuery(prisma.businessContinuityPlan.findMany({
      where: { userId },
      take: 3,
      select: { name: true, status: true, rto: true, rpo: true },
    }), []),
    safeQuery(prisma.thirdPartyRisk.findMany({
      where: { userId },
      take: 5,
      select: { vendorName: true, criticality: true, riskScore: true, complianceStatus: true },
    }), []),
    safeQuery(prisma.subscription.findFirst({
      where: { userId },
      select: { plan: true, status: true, scansUsed: true, scansLimit: true },
    }), null),
    safeQuery(prisma.committeeSession.count({ where: { userId } }), 0),
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
      vulnerabilidadesAbiertas: allVulnsCount - remediatedVulnsCount,
      alertasSIEM: openAlerts,
      incidentesAbiertos: openIncidents.length,
      totalIncidentes: allIncidentsCount,
      sesionesComite: committeeSessionsCount,
    },
    ultimosEscaneos: recentScans.map((s: any) => ({
      url: s.targetUrl,
      estado: s.status,
      puntuacion: s.score,
      fecha: s.createdAt,
      vulnerabilidades: Array.isArray(s.vulnerabilities) ? s.vulnerabilities.length : 0,
    })),
    incidentesAbiertos: openIncidents.map((i: any) => ({
      titulo: i.title,
      descripcion: i.description?.substring(0, 200),
      severidad: i.severity,
      estado: i.status,
      categoria: i.category,
      detectado: i.detectedAt,
    })),
    vulnerabilidadesCriticas: criticalVulns.map((v: any) => ({
      titulo: v.title,
      descripcion: v.description?.substring(0, 200),
      severidad: v.severity,
      cve: v.cveId,
      cvss: v.cvssScore,
      activo: v.assetName,
      remediacion: v.remediation?.substring(0, 200),
    })),
    evaluacionesRiesgo: riskAssessments,
    cumplimiento: complianceAssessments,
    planesContinuidad: bcpPlans,
    proveedores: thirdPartyRisks,
  };
}

// ── Call Gemini with retry across models ──
async function callGemini(apiKey: string, contents: any[]): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 1024 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }

      if (res.status === 429) {
        console.warn(`Gemini ${model}: rate limited, trying next...`);
        continue;
      }

      const errText = await res.text().catch(() => "unknown");
      console.error(`Gemini ${model} error (${res.status}):`, errText);
    } catch (err) {
      console.error(`Gemini ${model} fetch error:`, err);
    }
  }
  return null;
}

// ── POST handler ──
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, company: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const context = await getUserContext(user.id);

    // Build conversation for Gemini
    const contents: any[] = [];
    const recentHistory = (history || []).slice(-10);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    const userMessage = `CONTEXTO DEL USUARIO (${user.name || "Usuario"}, empresa: ${user.company || "No especificada"}):
${JSON.stringify(context, null, 2)}

PREGUNTA DEL USUARIO: ${message}`;
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    // Try Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    let reply: string | null = null;
    let source = "guardy";

    if (apiKey) {
      reply = await callGemini(apiKey, contents);
      if (reply) source = "gemini";
    }

    // Smart fallback if Gemini unavailable
    if (!reply) {
      reply = getSmartResponse(message, context, user.name || "Usuario");
    }

    return NextResponse.json({ reply, source });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Error del agente. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

// ── Intelligent fallback (works without Gemini) ──
function getSmartResponse(message: string, context: any, userName: string): string {
  const msg = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const r = context?.resumen;

  // ─ Greeting ─
  if (/^(hola|hey|buenas|buenos|hi|hello|que tal|saludos|ayuda|help|menu)/.test(msg)) {
    const hora = new Date().getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    return `🛡️ ${saludo}, **${userName}**! Soy **Guardy**, tu asistente de ciberseguridad.

Estoy conectado a todos los módulos de tu plataforma y puedo ayudarte con:

• 📊 **"¿Cuál es mi estado de seguridad?"** — Resumen ejecutivo
• ⚠️ **"¿Qué vulnerabilidades tengo?"** — Hallazgos críticos
• 🚨 **"¿Hay incidentes abiertos?"** — Incidentes activos
• 📈 **"¿Cómo van mis escaneos?"** — Resultados de análisis
• 🔒 **"¿Cómo está mi cumplimiento?"** — Estado normativo
• 🏢 **"¿Cómo están mis proveedores?"** — Riesgo de terceros
• 📋 **"¿Qué riesgos tengo?"** — Evaluaciones de riesgo
• 🔄 **"Estado de mi BCP"** — Continuidad de negocio

¡Pregúntame lo que necesites! 💬`;
  }

  // ─ Security Status / Summary ─
  if (/estado|resumen|como estoy|postura|dashboard|general|panorama/.test(msg)) {
    const score = r?.puntuacionPromedio;
    let nivel = "Sin datos";
    let emoji = "❓";
    if (score !== null && score !== undefined) {
      if (score >= 80) { nivel = "Buena"; emoji = "✅"; }
      else if (score >= 60) { nivel = "Moderada"; emoji = "⚠️"; }
      else { nivel = "Requiere atención"; emoji = "🚨"; }
    }

    let resp = `🛡️ **Resumen Ejecutivo de Seguridad — ${userName}**\n\n`;
    resp += `${emoji} **Postura general:** ${nivel}${score ? ` (${score}/100)` : ""}\n\n`;
    resp += `📊 **Indicadores clave:**\n`;
    resp += `• Vulnerabilidades: **${r?.totalVulnerabilidades ?? 0}** totales (${r?.vulnerabilidadesResueltas ?? 0} resueltas, ${r?.vulnerabilidadesAbiertas ?? 0} pendientes)\n`;
    resp += `• Incidentes abiertos: **${r?.incidentesAbiertos ?? 0}** de ${r?.totalIncidentes ?? 0} totales\n`;
    resp += `• Alertas SIEM activas: **${r?.alertasSIEM ?? 0}**\n`;
    resp += `• Plan actual: **${r?.plan ?? "FREE"}**\n`;
    resp += `• Escaneos: **${r?.escaneosUsados ?? 0}** / ${r?.limiteEscaneos ?? 0}\n\n`;

    if ((r?.vulnerabilidadesAbiertas ?? 0) > 0) {
      resp += `⚠️ **Recomendación:** Tiene ${r.vulnerabilidadesAbiertas} vulnerabilidad(es) pendiente(s). Priorice la remediación de las críticas y altas desde el módulo de Vulnerabilidades.\n`;
    }
    if ((r?.incidentesAbiertos ?? 0) > 0) {
      resp += `🚨 Tiene ${r.incidentesAbiertos} incidente(s) abierto(s) que requieren seguimiento.\n`;
    }
    if ((r?.vulnerabilidadesAbiertas ?? 0) === 0 && (r?.incidentesAbiertos ?? 0) === 0) {
      resp += `✅ ¡Excelente! No tiene hallazgos críticos pendientes. Su postura de seguridad está en buen estado.\n`;
    }
    return resp;
  }

  // ─ Vulnerabilities ─
  if (/vulnerabilidad|vuln|critica|hallazgo|cve|cvss|parche/.test(msg)) {
    const vulns = context?.vulnerabilidadesCriticas || [];
    const total = r?.totalVulnerabilidades ?? 0;
    const resueltas = r?.vulnerabilidadesResueltas ?? 0;

    if (total === 0) return `✅ **No se encontraron vulnerabilidades registradas.**\n\nRealice un escaneo de seguridad desde el Centro de Evaluación para identificar posibles hallazgos en su infraestructura.`;
    if (vulns.length === 0) return `✅ **No hay vulnerabilidades críticas o altas pendientes.**\n\n📊 Total: ${total} vulnerabilidades registradas, ${resueltas} ya remediadas.\n\n¡Buen trabajo manteniendo su infraestructura segura!`;

    let resp = `⚠️ **Vulnerabilidades Críticas/Altas Pendientes** (${vulns.length} de ${total} totales)\n\n`;
    vulns.slice(0, 5).forEach((v: any, i: number) => {
      resp += `**${i + 1}. ${v.titulo || v.cve || "Sin título"}**\n`;
      resp += `   • Severidad: **${v.severidad}**${v.cvss ? ` (CVSS: ${v.cvss})` : ""}\n`;
      if (v.activo) resp += `   • Activo afectado: ${v.activo}\n`;
      if (v.descripcion) resp += `   • ${v.descripcion}\n`;
      if (v.remediacion) resp += `   • 💡 Remediación: ${v.remediacion}\n`;
      resp += `\n`;
    });

    resp += `📌 **Impacto en su negocio:** Las vulnerabilidades críticas pueden ser explotadas por atacantes para acceder a datos sensibles, interrumpir operaciones o causar daño reputacional. Se recomienda remediar las críticas dentro de las próximas 24-72 horas.`;
    return resp;
  }

  // ─ Incidents ─
  if (/incidente|alerta|brecha|ataque|evento de seguridad|amenaza/.test(msg)) {
    const incs = context?.incidentesAbiertos || [];
    const total = r?.totalIncidentes ?? 0;

    if (total === 0 && incs.length === 0) return `✅ **No hay incidentes de seguridad registrados.**\n\nSu organización no tiene incidentes reportados. Recuerde que puede registrar incidentes manualmente desde el módulo de Incidentes.`;
    if (incs.length === 0) return `✅ **Todos los incidentes están resueltos.**\n\n📊 Se han gestionado ${total} incidente(s) en total. No hay incidentes abiertos que requieran atención inmediata.`;

    let resp = `🚨 **Incidentes Abiertos (${incs.length})**\n\n`;
    incs.slice(0, 5).forEach((inc: any, i: number) => {
      resp += `**${i + 1}. ${inc.titulo}**\n`;
      resp += `   • Severidad: **${inc.severidad}** | Estado: ${inc.estado}\n`;
      if (inc.categoria) resp += `   • Categoría: ${inc.categoria}\n`;
      if (inc.descripcion) resp += `   • ${inc.descripcion}\n`;
      if (inc.detectado) resp += `   • Detectado: ${new Date(inc.detectado).toLocaleDateString("es")}\n`;
      resp += `\n`;
    });

    const critical = incs.filter((i: any) => i.severidad === "CRITICAL" || i.severidad === "HIGH").length;
    if (critical > 0) {
      resp += `⚠️ **${critical} incidente(s) de severidad alta/crítica** requieren atención prioritaria.`;
    }
    return resp;
  }

  // ─ Scans ─
  if (/escaneo|scan|analisis|evaluacion|test|prueba/.test(msg)) {
    const scans = context?.ultimosEscaneos || [];

    if (scans.length === 0) return `📊 **No tiene escaneos registrados.**\n\nVaya al **Centro de Evaluación de Seguridad** para realizar su primer análisis.`;

    let resp = `📊 **Últimos Escaneos de Seguridad**\n\n`;
    scans.forEach((s: any, i: number) => {
      const scoreEmoji = !s.puntuacion ? "⏳" : s.puntuacion >= 80 ? "✅" : s.puntuacion >= 60 ? "⚠️" : "🚨";
      resp += `**${i + 1}. ${s.url}**\n`;
      resp += `   ${scoreEmoji} Puntuación: **${s.puntuacion ?? "En proceso"}**/100 | Estado: ${s.estado}\n`;
      if (s.vulnerabilidades > 0) resp += `   ⚠️ ${s.vulnerabilidades} vulnerabilidad(es) detectada(s)\n`;
      resp += `   📅 ${new Date(s.fecha).toLocaleDateString("es")}\n\n`;
    });

    const avg = r?.puntuacionPromedio;
    if (avg) {
      resp += avg >= 80
        ? `✅ **Puntuación promedio: ${avg}/100** — Buena postura de seguridad.`
        : `⚠️ **Puntuación promedio: ${avg}/100** — Se recomienda revisar y corregir los hallazgos.`;
    }
    return resp;
  }

  // ─ Compliance ─
  if (/cumplimiento|normativ|iso|gdpr|soc|pci|hipaa|regulacion|auditoria|compliance/.test(msg)) {
    const comp = context?.cumplimiento || [];

    if (comp.length === 0) return `🔒 **No tiene evaluaciones de cumplimiento registradas.**\n\nVaya al módulo de **Cumplimiento Normativo** para iniciar una evaluación contra ISO 27001, GDPR, SOC 2 o PCI-DSS.`;

    let resp = `🔒 **Estado de Cumplimiento Normativo**\n\n`;
    comp.forEach((c: any, i: number) => {
      const scoreEmoji = !c.overallScore ? "📋" : c.overallScore >= 80 ? "✅" : c.overallScore >= 60 ? "⚠️" : "🚨";
      resp += `**${i + 1}. ${c.name}**\n`;
      resp += `   ${scoreEmoji} Score: **${c.overallScore ?? "Pendiente"}**/100 | Estado: ${c.status}\n`;
      if (c.compliantCount || c.nonCompliantCount) {
        resp += `   ✅ Cumple: ${c.compliantCount ?? 0} | ❌ No cumple: ${c.nonCompliantCount ?? 0}\n`;
      }
      resp += `\n`;
    });
    return resp;
  }

  // ─ Risk Management ─
  if (/riesgo|risk|probabilidad|impacto|mitig/.test(msg)) {
    const risks = context?.evaluacionesRiesgo || [];

    if (risks.length === 0) return `📋 **No tiene evaluaciones de riesgo registradas.**\n\nVaya al módulo de **Gestión de Riesgos** para crear evaluaciones y definir controles.`;

    let resp = `📋 **Evaluaciones de Riesgo**\n\n`;
    risks.forEach((risk: any, i: number) => {
      const riskEmoji = risk.riskScore >= 8 ? "🚨" : risk.riskScore >= 5 ? "⚠️" : "✅";
      resp += `**${i + 1}. ${risk.title}**\n`;
      resp += `   ${riskEmoji} Score: **${risk.riskScore?.toFixed(1)}** | Prob: ${(risk.probability * 100).toFixed(0)}% | Impacto: ${risk.impact}\n`;
      resp += `   Estado: ${risk.status} | Categoría: ${risk.category}\n\n`;
    });
    return resp;
  }

  // ─ BCP ─
  if (/bcp|continuidad|drp|recuperacion|contingencia|disaster/.test(msg)) {
    const plans = context?.planesContinuidad || [];

    if (plans.length === 0) return `🔄 **No tiene planes de continuidad registrados.**\n\nVaya al módulo de **BCP/DRP** para crear su plan de continuidad de negocio.`;

    let resp = `🔄 **Planes de Continuidad de Negocio**\n\n`;
    plans.forEach((p: any, i: number) => {
      resp += `**${i + 1}. ${p.name}** — Estado: ${p.status}\n`;
      if (p.rto) resp += `   ⏱️ RTO: ${p.rto}h | RPO: ${p.rpo}h\n`;
      resp += `\n`;
    });
    return resp;
  }

  // ─ Third Party / Vendors ─
  if (/proveedor|tercero|vendor|third|externo|subcontrat/.test(msg)) {
    const vendors = context?.proveedores || [];

    if (vendors.length === 0) return `🏢 **No tiene proveedores registrados.**\n\nVaya al módulo de **Gestión de Terceros** para registrar y evaluar el riesgo de sus proveedores.`;

    let resp = `🏢 **Gestión de Riesgo de Terceros**\n\n`;
    vendors.forEach((v: any, i: number) => {
      const riskEmoji = v.criticality === "CRITICAL" ? "🚨" : v.criticality === "HIGH" ? "⚠️" : "✅";
      resp += `**${i + 1}. ${v.vendorName}**\n`;
      resp += `   ${riskEmoji} Criticidad: **${v.criticality}** | Score: ${v.riskScore?.toFixed(1)} | Cumplimiento: ${v.complianceStatus}\n\n`;
    });
    return resp;
  }

  // ─ SIEM ─
  if (/siem|monitor|evento|log|deteccion|correlacion/.test(msg)) {
    const alerts = r?.alertasSIEM ?? 0;
    if (alerts === 0) return `📡 **SIEM — Sin alertas activas.**\n\nSu módulo de monitoreo no tiene alertas abiertas. El sistema sigue monitoreando eventos en tiempo real.`;

    return `📡 **SIEM — Monitoreo de Seguridad**\n\n🚨 **${alerts} alerta(s) activa(s)** requieren revisión.\n\nRevise el módulo SIEM para ver el detalle de los eventos y reglas de detección activas.`;
  }

  // ─ Committee ─
  if (/comite|comité|sesion|sesión|reunion|reunión|acta/.test(msg)) {
    const sessions = r?.sesionesComite ?? 0;
    if (sessions === 0) return `👥 **No tiene sesiones de comité registradas.**\n\nVaya al módulo de **Comité de Seguridad** para agendar sesiones y dar seguimiento a acuerdos.`;

    return `👥 **Comité de Seguridad**\n\n📋 Se han registrado **${sessions} sesión(es)** del comité de seguridad.\n\nRevise el módulo de Comité para ver actas, asistencia y seguimiento.`;
  }

  // ─ Recommendations ─
  if (/recomendar|recomendacion|mejorar|que hago|que debo|priorid|accion|siguiente paso/.test(msg)) {
    let resp = `💡 **Recomendaciones Priorizadas para ${userName}**\n\n`;
    let priority = 1;

    const vulnsOpen = r?.vulnerabilidadesAbiertas ?? 0;
    const incidents = r?.incidentesAbiertos ?? 0;
    const alerts = r?.alertasSIEM ?? 0;
    const scans = context?.ultimosEscaneos || [];

    if (vulnsOpen > 0) resp += `**${priority++}. 🚨 Remediar vulnerabilidades (${vulnsOpen} pendientes)**\n   Priorice las críticas y altas. Cada día sin remediar aumenta el riesgo.\n\n`;
    if (incidents > 0) resp += `**${priority++}. 🔥 Gestionar incidentes (${incidents} abiertos)**\n   Investigue, contenga y documente cada incidente.\n\n`;
    if (alerts > 0) resp += `**${priority++}. 📡 Revisar alertas SIEM (${alerts} activas)**\n   Pueden indicar amenazas activas.\n\n`;
    if (scans.length === 0) resp += `**${priority++}. 📊 Realizar un escaneo de seguridad**\n   Inicie uno desde el Centro de Evaluación.\n\n`;

    if (priority === 1) {
      resp += `✅ ¡Su postura de seguridad está en buen estado!\n\n`;
      resp += `1. Mantener escaneos periódicos (al menos mensual)\n`;
      resp += `2. Revisar cumplimiento normativo trimestralmente\n`;
      resp += `3. Actualizar el BCP anualmente\n`;
      resp += `4. Capacitar al equipo en ciberseguridad\n`;
    }
    return resp;
  }

  // ─ Default ─
  return `🛡️ **${userName}**, soy **Guardy**, tu asistente de ciberseguridad.

Puedo ayudarte con información de todos los módulos:

• 📊 **"Mi estado de seguridad"** — Resumen ejecutivo
• ⚠️ **"Vulnerabilidades"** — Hallazgos pendientes
• 🚨 **"Incidentes"** — Eventos de seguridad
• 📈 **"Escaneos"** — Evaluaciones recientes
• 🔒 **"Cumplimiento"** — Estado normativo
• 📋 **"Riesgos"** — Evaluaciones de riesgo
• 🏢 **"Proveedores"** — Riesgo de terceros
• 🔄 **"BCP"** — Continuidad de negocio
• 📡 **"SIEM"** — Alertas de monitoreo
• 💡 **"Recomendaciones"** — Qué priorizar

¿En qué puedo ayudarte? 💬`;
}
