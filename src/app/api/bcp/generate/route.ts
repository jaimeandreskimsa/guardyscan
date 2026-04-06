import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { askClaude } from '@/lib/claude'

const GENERATE_SYSTEM = `Eres un experto CISO y consultor certificado en continuidad del negocio (ISO 22301, BCP/DRP, NIST SP 800-34) con 20 años de experiencia.
Tu tarea es analizar el perfil real de seguridad de una organización y generar un Plan de Continuidad del Negocio personalizado y preciso.

IMPORTANTE: Responde ÚNICAMENTE con JSON válido y minificado. Sin texto adicional, sin bloques de código Markdown, sin explicaciones fuera del JSON.

El JSON debe tener exactamente esta estructura:
{
  "name": "string (nombre formal del plan, ej: 'Plan de Continuidad del Negocio – [Empresa] 2025')",
  "description": "string (descripción ejecutiva basada en los datos reales de la organización, 2-3 oraciones)",
  "scope": "string (alcance real basado en los sistemas escaneados, tecnologías detectadas y activos identificados, 2-3 oraciones)",
  "rto": <número entero entre 1 y 48, horas — calculado según criticidad de vulnerabilidades e incidentes reales>,
  "rpo": <número entero entre 1 y 24, horas — calculado según frecuencia de cambios y criticidad>,
  "mtpd": <número entero entre 48 y 720, horas>,
  "objectives": ["objetivo específico 1", "objetivo específico 2", "objetivo específico 3", "objetivo 4"],
  "criticalProcesses": [
    {
      "name": "string (proceso real del negocio basado en los sistemas detectados)",
      "description": "string (justificación basada en los datos reales: vulnerabilidades, incidentes, tecnologías detectadas)",
      "owner": "string (cargo específico del sector)",
      "department": "string (área real)",
      "criticality": "CRITICAL|HIGH|MEDIUM|LOW",
      "rto": <número entero en horas>,
      "rpo": <número entero en horas>
    }
  ],
  "recoveryStrategies": [
    {
      "name": "string (estrategia concreta y nombrada)",
      "type": "HOT_SITE|WARM_SITE|COLD_SITE|CLOUD|MANUAL",
      "description": "string (estrategia específica que responde a las vulnerabilidades y tecnologías reales identificadas)",
      "activationTime": <número entero en minutos>
    }
  ]
}

Reglas críticas:
- Basa TODO el plan en los datos reales proporcionados (scans, vulnerabilidades, incidentes, tecnologías detectadas, score de seguridad)
- Si hay vulnerabilidades críticas o altas sin remediar, los RTO/RPO deben ser más agresivos (menores)
- Si hay incidentes abiertos, menciónalos en la descripción de los procesos afectados
- Los procesos críticos deben reflejar exactamente los sistemas y URLs escaneados
- Las estrategias deben responder a las tecnologías detectadas en los scans
- Genera entre 4 y 6 procesos críticos
- Genera entre 2 y 4 estrategias de recuperación
- Responde SOLO con el JSON, absolutamente nada más`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { planType = 'BCP', extraContext = '' } = body
    const userId = session.user.id

    // ── Recopilar todos los datos del usuario en paralelo ──────────────────
    const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => {
      try { return await p } catch { return fallback }
    }

    const [
      user,
      recentScans,
      openIncidents,
      criticalVulns,
      allVulnsCount,
      remediatedVulnsCount,
      riskAssessments,
      thirdPartyRisks,
      openAlerts,
      complianceAssessments,
      existingBcpCount,
    ] = await Promise.all([
      safe(prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, company: true, industry: true, companySize: true, website: true },
      }), null),
      safe(prisma.scan.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          targetUrl: true, score: true, createdAt: true,
          vulnerabilities: true, technologies: true, sslInfo: true,
          securityHeaders: true, openPorts: true, compliance: true,
        },
      }), []),
      safe(prisma.incident.findMany({
        where: { userId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { title: true, severity: true, status: true, category: true, affectedSystems: true, description: true },
      }), []),
      safe(prisma.vulnerability.findMany({
        where: { userId, severity: { in: ['CRITICAL', 'HIGH'] }, status: { not: 'REMEDIATED' } },
        orderBy: { cvssScore: 'desc' },
        take: 15,
        select: { title: true, severity: true, cveId: true, cvssScore: true, assetName: true, description: true },
      }), []),
      safe(prisma.vulnerability.count({ where: { userId } }), 0),
      safe(prisma.vulnerability.count({ where: { userId, status: 'REMEDIATED' } }), 0),
      safe(prisma.riskAssessment.findMany({
        where: { userId },
        orderBy: { riskScore: 'desc' },
        take: 8,
        select: { title: true, riskScore: true, probability: true, impact: true, category: true, status: true },
      }), []),
      safe(prisma.thirdPartyRisk.findMany({
        where: { userId },
        take: 6,
        select: { vendorName: true, criticality: true, riskScore: true },
      }), []),
      safe(prisma.securityAlert.count({ where: { userId, status: 'OPEN' } }), 0),
      safe(prisma.complianceAssessment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { name: true, overallScore: true, status: true, nonCompliantCount: true },
      }), []),
      safe(prisma.businessContinuityPlan.count({ where: { userId } }), 0),
    ])

    // ── Construir resumen ────────────────────────────────────────────────────
    const completedScans = (recentScans as any[]).filter(s => s.score != null)
    const avgScore = completedScans.length > 0
      ? Math.round(completedScans.reduce((s: number, sc: any) => s + sc.score, 0) / completedScans.length)
      : null

    const allTechnologies = Array.from(new Set(
      (recentScans as any[]).flatMap((s: any) => {
        const t = s.technologies
        if (!t) return []
        if (Array.isArray(t)) return t.map((x: any) => typeof x === 'string' ? x : x?.name || x?.technology || '').filter(Boolean)
        if (typeof t === 'object') return Object.keys(t)
        return []
      })
    )).slice(0, 20)

    const allUrls = [...new Set((recentScans as any[]).map((s: any) => s.targetUrl))].slice(0, 10)

    const planTypeLabel =
      planType === 'DRP' ? 'Plan de Recuperación ante Desastres (DRP)' :
      planType === 'HYBRID' ? 'Plan Híbrido de Continuidad y Recuperación (BCP/DRP)' :
      'Plan de Continuidad del Negocio (BCP)'

    const contextJson = {
      perfil_organizacion: {
        nombre_empresa: (user as any)?.company || 'No especificado',
        industria: (user as any)?.industry || 'No especificada',
        tamano: (user as any)?.companySize || 'No especificado',
        sitio_web: (user as any)?.website || null,
        urls_escaneadas: allUrls,
        planes_bcp_existentes: existingBcpCount,
      },
      postura_seguridad: {
        score_promedio: avgScore !== null ? `${avgScore}/100` : 'Sin datos',
        total_escaneos: completedScans.length,
        tecnologias_detectadas: allTechnologies,
        vulnerabilidades_total: allVulnsCount,
        vulnerabilidades_remediadas: remediatedVulnsCount,
        vulnerabilidades_pendientes: (allVulnsCount as number) - (remediatedVulnsCount as number),
        alertas_siem_abiertas: openAlerts,
        incidentes_activos: (openIncidents as any[]).length,
      },
      vulnerabilidades_criticas_sin_remediar: (criticalVulns as any[]).map((v: any) => ({
        titulo: v.title,
        severidad: v.severity,
        cvss: v.cvssScore,
        cve: v.cveId,
        activo: v.assetName,
        descripcion: v.description?.substring(0, 150),
      })),
      incidentes_abiertos: (openIncidents as any[]).map((i: any) => ({
        titulo: i.title,
        severidad: i.severity,
        categoria: i.category,
        sistemas_afectados: i.affectedSystems,
        descripcion: i.description?.substring(0, 150),
      })),
      evaluaciones_riesgo: (riskAssessments as any[]).map((r: any) => ({
        titulo: r.title,
        score: r.riskScore,
        probabilidad: r.probability,
        impacto: r.impact,
        categoria: r.category,
      })),
      proveedores_terceros: (thirdPartyRisks as any[]).map((t: any) => ({
        proveedor: t.vendorName,
        criticidad: t.criticality,
        score_riesgo: t.riskScore,
      })),
      cumplimiento_normativo: complianceAssessments,
      ultimos_escaneos: completedScans.slice(0, 5).map((s: any) => ({
        url: s.targetUrl,
        score: s.score,
        vulnerabilidades: Array.isArray(s.vulnerabilities) ? s.vulnerabilities.length : 0,
        puertos_abiertos: Array.isArray(s.openPorts) ? s.openPorts.length : 0,
      })),
    }

    const userMessage = `Genera un ${planTypeLabel} para esta organización.

DATOS REALES DE LA PLATAFORMA GuardyScan:
\`\`\`json
${JSON.stringify(contextJson, null, 2)}
\`\`\`
${extraContext?.trim() ? `\nCONTEXTO ADICIONAL DEL USUARIO:\n${extraContext.trim()}\n` : ''}
Instrucciones:
1. El nombre del plan debe incluir el nombre real de la empresa
2. Los procesos críticos deben basarse en las URLs y tecnologías detectadas en los escaneos
3. Si hay vulnerabilidades CRITICAL/HIGH sin remediar, el RTO de los procesos afectados debe ser <= 4h
4. Las estrategias deben abordar las tecnologías reales detectadas
5. Menciona los incidentes activos en los procesos relacionados`

    // ── Llamar a Claude ──────────────────────────────────────────────────────
    let raw: string
    try {
      raw = await askClaude({
        system: GENERATE_SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 4000,
        temperature: 0.2,
      })
    } catch (aiErr) {
      console.error('[bcp/generate] Claude error:', aiErr)
      return NextResponse.json({ error: 'Error al conectar con la IA. Verifica la configuración de ANTHROPIC_API_KEY.' }, { status: 503 })
    }

    // ── Parsear JSON ─────────────────────────────────────────────────────────
    let generated: any
    try {
      const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      generated = JSON.parse(clean)
    } catch {
      console.error('[bcp/generate] JSON parse error. Raw:', raw?.substring(0, 500))
      return NextResponse.json({ error: 'Error procesando la respuesta de la IA. Inténtalo de nuevo.' }, { status: 500 })
    }

    if (!generated.name || !generated.criticalProcesses?.length) {
      return NextResponse.json({ error: 'La IA generó un plan incompleto. Inténtalo de nuevo.' }, { status: 500 })
    }

    // ── Guardar en BD ────────────────────────────────────────────────────────
    const nextReviewDate = new Date()
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6)

    const plan = await prisma.businessContinuityPlan.create({
      data: {
        userId,
        name: generated.name,
        description: generated.description || 'Plan generado con IA',
        scope: generated.scope || null,
        objectives: generated.objectives || [],
        version: '1.0',
        status: 'DRAFT',
        nextReviewDate,
        rto: Math.round((generated.rto || 4) * 60),
        rpo: Math.round((generated.rpo || 1) * 60),
        mtpd: generated.mtpd || 72,
      },
    })

    if (generated.criticalProcesses?.length) {
      await prisma.criticalProcess.createMany({
        data: generated.criticalProcesses.map((p: any, i: number) => ({
          bcpId: plan.id,
          name: p.name || 'Proceso sin nombre',
          description: p.description || 'Proceso crítico del negocio',
          owner: p.owner || 'Por definir',
          department: p.department || 'Por definir',
          criticality: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(p.criticality) ? p.criticality : 'HIGH',
          priority: i + 1,
          rto: Math.round((p.rto || 4) * 60),
          rpo: Math.round((p.rpo || 1) * 60),
          dependencies: [],
          resources: [],
        })),
      })
    }

    if (generated.recoveryStrategies?.length) {
      await prisma.recoveryStrategy.createMany({
        data: generated.recoveryStrategies.map((s: any) => ({
          bcpId: plan.id,
          name: s.name || 'Estrategia de recuperación',
          type: ['HOT_SITE', 'WARM_SITE', 'COLD_SITE', 'CLOUD', 'MANUAL'].includes(s.type) ? s.type : 'MANUAL',
          description: s.description || 'Estrategia de recuperación generada por IA',
          activationTime: s.activationTime || 60,
          contactInfo: {},
          status: 'PLANNED',
        })),
      })
    }

    return NextResponse.json(
      {
        success: true,
        planId: plan.id,
        planName: plan.name,
        processesCreated: generated.criticalProcesses?.length || 0,
        strategiesCreated: generated.recoveryStrategies?.length || 0,
        dataUsed: {
          scansAnalyzed: completedScans.length,
          vulnerabilitiesAnalyzed: (criticalVulns as any[]).length,
          incidentsAnalyzed: (openIncidents as any[]).length,
          technologiesDetected: allTechnologies.length,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[bcp/generate] Error:', error)
    return NextResponse.json({ error: 'Error interno al generar el plan' }, { status: 500 })
  }
}
