import { askClaude } from "./claude";

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
 * Genera el análisis ejecutivo completo para el informe PDF mensual
 */
export async function generateReportAnalysis(data: {
  company: string;
  period: string;
  summary: any;
  scans: any[];
  incidents: any[];
  vulnerabilities: any[];
  compliance: any[];
}): Promise<{
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

  const raw = await askClaude({
    system: REPORT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 3000,
    temperature: 0.4,
  });

  // Extraer JSON de la respuesta
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude no devolvió JSON válido en el análisis del informe");
  return JSON.parse(jsonMatch[0]);
}

/**
 * Genera el análisis técnico + ejecutivo de un escaneo individual
 */
export async function generateScanAnalysis(scanData: {
  domain: string;
  score: number;
  vulnerabilities: any[];
  openPorts: any[];
  technologies: any[];
  sslInfo?: any;
  headers?: any;
}): Promise<{
  diagnosticoEjecutivo: string;
  analisisTecnico: string;
  impactoNegocio: string;
  planRemediacion: string;
}> {
  const prompt = `Analiza los resultados del siguiente escaneo de seguridad web para el dominio "${scanData.domain}" y genera un informe profesional en dos idiomas: técnico y de negocio.

RESULTADOS DEL ESCANEO:
${JSON.stringify(scanData, null, 2)}

Responde en JSON con exactamente estas claves:
{
  "diagnosticoEjecutivo": "2-3 párrafos para el CEO: qué encontramos, qué significa y por qué importa ahora",
  "analisisTecnico": "Análisis técnico detallado: CVEs, CVSS, vectores de ataque, puertos críticos, análisis SSL/TLS, headers de seguridad faltantes, tecnologías vulnerables con versiones",
  "impactoNegocio": "Traducción a impacto empresarial: riesgo financiero estimado, exposición regulatoria (GDPR, Ley 21.663, PCI-DSS según aplique), impacto reputacional, riesgo operativo",
  "planRemediacion": "Plan de remediación priorizado: INMEDIATO (0-7 días), CORTO PLAZO (30 días), MEDIANO PLAZO (90 días). Con responsables sugeridos y criterios de verificación"
}`;

  const raw = await askClaude({
    system: REPORT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 2500,
    temperature: 0.4,
  });

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude no devolvió JSON válido en el análisis del escaneo");
  return JSON.parse(jsonMatch[0]);
}
