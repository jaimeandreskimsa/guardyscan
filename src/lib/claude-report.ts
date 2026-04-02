import { askClaude, saveDiagnostic, getLastDiagnostic } from "./claude";

/**
 * System prompt para informes ejecutivos — Claude como CISO senior
 */
const REPORT_SYSTEM_PROMPT = `Eres un CISO senior con 20+ años de experiencia en ciberseguridad empresarial, gobierno de TI y gestión de riesgos. Redactas informes ejecutivos de alta calidad que son leídos por CEOs, directores y consejos de administración.

## TU OBJETIVO EN ESTE INFORME
Transformar datos técnicos de seguridad en lenguaje de negocio claro, accionable y persuasivo que ayude a los líderes empresariales a tomar decisiones informadas sobre inversión en seguridad.

## REGLAS DE REDACCIÓN
1. Responde SIEMPRE en español formal y profesional.
2. Usa dos capas de análisis por sección:
   - **Perspectiva técnica**: CVEs, CVSS, vectores, controles, frameworks (ISO 27001, NIST, CIS)
   - **Perspectiva de negocio**: impacto financiero, operativo, reputacional, legal/regulatorio
3. Cuantifica el riesgo siempre que sea posible (probabilidad de brecha, costo estimado, tiempo de recuperación).
4. Sé directo, sin tecnicismos innecesarios para el lector no técnico.
5. Incluye siempre recomendaciones concretas con timeframes.
6. Usa el tono de un consultor de confianza que habla con honestidad.
7. NUNCA inventes datos. Solo analiza los datos proporcionados.
8. Formato: texto continuo profesional (no Markdown con #, ya que irá en PDF).`;

/**
 * Genera el análisis ejecutivo completo para el informe PDF mensual.
 * Guarda el resultado en la BD. Si Claude falla, retorna el último análisis guardado.
 */
export async function generateReportAnalysis(
  data: {
    company: string;
    period: string;
    summary: any;
    scans: any[];
    incidents: any[];
    vulnerabilities: any[];
    compliance: any[];
  },
  userId?: string
): Promise<{
  resumenEjecutivo: string;
  analisisEscaneos: string;
  analisisIncidentes: string;
  analisisVulnerabilidades: string;
  analisisCumplimiento: string;
  conclusionesYPlan: string;
}> {
  const prompt = `Genera el análisis ejecutivo completo para el informe mensual de ciberseguridad de la empresa "${data.company}" para el período ${data.period}.

DATOS DEL PERÍODO:
${JSON.stringify(data, null, 2)}

Genera 6 secciones de texto para el informe. Cada sección debe tener entre 150-250 palabras, en español profesional, con perspectiva técnica Y de negocio.

Responde en JSON con exactamente estas claves:
{
  "resumenEjecutivo": "...",
  "analisisEscaneos": "...",
  "analisisIncidentes": "...",
  "analisisVulnerabilidades": "...",
  "analisisCumplimiento": "...",
  "conclusionesYPlan": "..."
}`;

  try {
    const raw = await askClaude({
      system: REPORT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 3000,
      temperature: 0.4,
    });

    // Extraer JSON de la respuesta
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude no devolvió JSON válido en el análisis del informe");
    const analysis = JSON.parse(jsonMatch[0]);

    // Guardar en la BD para uso futuro como fallback
    if (userId) {
      await saveDiagnostic({
        userId,
        type: "report_analysis",
        content: JSON.stringify(analysis),
        context: `${data.company} — ${data.period}`,
      });
    }

    return analysis;
  } catch (err) {
    console.error("[generateReportAnalysis] Claude falló, buscando diagnóstico guardado:", err);

    // Fallback: último análisis guardado para este usuario
    if (userId) {
      const last = await getLastDiagnostic(userId, "report_analysis");
      if (last) {
        try {
          return JSON.parse(last);
        } catch (_) { /* JSON corrupto, continúa */ }
      }
    }

    throw err; // propagar si no hay fallback disponible
  }
}

/**
 * Genera el análisis técnico + ejecutivo de un escaneo individual.
 * Guarda el resultado en la BD. Si Claude falla, retorna el último análisis guardado.
 */
export async function generateScanAnalysis(
  scanData: {
    domain: string;
    score: number;
    vulnerabilities: any[];
    openPorts: any[];
    technologies: any[];
    sslInfo?: any;
    headers?: any;
    securityHeaders?: any;
    firewall?: any;
    compliance?: any;
    dnsRecords?: any;
    cookies?: any;
    performance?: any;
  },
  userId?: string
): Promise<{
  diagnosticoEjecutivo: string;
  analisisTecnico: string;
  impactoNegocio: string;
  planRemediacion: string;
}> {
  // Build a compact but complete summary to keep the prompt short and fast
  const vulns = scanData.vulnerabilities || [];
  const ports = scanData.openPorts || [];
  const techs = scanData.technologies || [];
  const ssl = scanData.sslInfo || {};
  const headers = scanData.securityHeaders || scanData.headers || {};
  const firewall = scanData.firewall || {};
  const compliance = scanData.compliance || {};

  const criticalVulns = vulns.filter((v: any) =>
    ["critical", "crítico", "critico"].includes((v.severity || "").toLowerCase())
  );
  const highVulns = vulns.filter((v: any) =>
    ["high", "alto"].includes((v.severity || "").toLowerCase())
  );
  const mediumVulns = vulns.filter((v: any) =>
    ["medium", "medio", "moderate"].includes((v.severity || "").toLowerCase())
  );

  const activeHeaders = [
    "strict-transport-security","x-content-type-options","x-frame-options",
    "content-security-policy","x-xss-protection","referrer-policy",
  ].filter((h) => headers?.headers?.[h]);

  const summary = {
    domain: scanData.domain,
    score: scanData.score,
    ssl: { valid: ssl.valid, issuer: ssl.issuer, daysLeft: ssl.daysUntilExpiry },
    securityHeaders: { active: activeHeaders.length, outOf: 6, missing: 6 - activeHeaders.length },
    vulnerabilities: {
      total: vulns.length,
      critical: criticalVulns.length,
      high: highVulns.length,
      medium: mediumVulns.length,
      items: vulns.slice(0, 8).map((v: any) => ({
        title: v.title,
        severity: v.severity,
        description: v.description?.substring(0, 120),
        recommendation: v.recommendation?.substring(0, 100),
      })),
    },
    openPorts: ports.slice(0, 10).map((p: any) => ({ port: p.port, service: p.service })),
    technologies: techs.slice(0, 10),
    firewall: { waf: firewall.waf, ddos: firewall.ddos, rateLimit: firewall.rateLimit },
    compliance: {
      iso27001: compliance?.iso27001?.score,
      gdpr: compliance?.gdpr?.score,
    },
  };

  const prompt = `Analiza este escaneo de seguridad web y responde SOLO con JSON válido, sin texto extra.

DATOS DEL ESCANEO (${scanData.domain}):
${JSON.stringify(summary, null, 1)}

JSON requerido (4 claves, cada valor 120-200 palabras en español profesional):
{
  "diagnosticoEjecutivo": "Para el CEO/directivo: qué encontramos, nivel de riesgo, y por qué actuar ahora",
  "impactoNegocio": "Riesgo financiero, regulatorio (GDPR/PCI-DSS/Ley 21.663) y reputacional concreto",
  "analisisTecnico": "Análisis técnico: CVEs, SSL/TLS, headers HTTP faltantes, vectores de ataque, tecnologías",
  "planRemediacion": "INMEDIATO (0-7d): X acciones. CORTO PLAZO (30d): Y acciones. MEDIANO PLAZO (90d): Z acciones"
}`;

  try {
    const raw = await askClaude({
      system: REPORT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 1800,
      temperature: 0.3,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude no devolvió JSON válido");
    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis.diagnosticoEjecutivo) throw new Error("JSON incompleto de Claude");

    // Save generic key too for fallback
    if (userId) {
      await saveDiagnostic({
        userId,
        type: "scan_analysis",
        content: JSON.stringify(analysis),
        context: `${scanData.domain} — score ${scanData.score}`,
      });
    }

    return analysis;
  } catch (err) {
    console.error("[generateScanAnalysis] Claude falló:", err);
    throw err;
  }
}
