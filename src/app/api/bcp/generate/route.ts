import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { askClaude } from '@/lib/claude'

const GENERATE_SYSTEM = `Eres un experto en continuidad del negocio (ISO 22301, BCP/DRP) con 20 años de experiencia.
Tu tarea es generar un plan de continuidad estructurado y completo para una organización.

IMPORTANTE: Responde ÚNICAMENTE con JSON válido y minificado. Sin texto adicional, sin bloques de código Markdown, sin explicaciones fuera del JSON.

El JSON debe tener exactamente esta estructura:
{
  "name": "string (nombre formal del plan)",
  "description": "string (descripción ejecutiva en 2-3 oraciones)",
  "scope": "string (alcance organizacional y tecnológico del plan, 2-3 oraciones)",
  "rto": <número entero, horas entre 1 y 48>,
  "rpo": <número entero, horas entre 1 y 24>,
  "mtpd": <número entero, horas entre 48 y 720>,
  "objectives": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "criticalProcesses": [
    {
      "name": "string (nombre del proceso)",
      "description": "string (descripción del proceso y por qué es crítico)",
      "owner": "string (cargo o rol responsable)",
      "department": "string (área o departamento)",
      "criticality": "CRITICAL|HIGH|MEDIUM|LOW",
      "rto": <número entero en horas>,
      "rpo": <número entero en horas>
    }
  ],
  "recoveryStrategies": [
    {
      "name": "string (nombre de la estrategia)",
      "type": "HOT_SITE|WARM_SITE|COLD_SITE|CLOUD|MANUAL",
      "description": "string (descripción de la estrategia de recuperación)",
      "activationTime": <número entero en minutos>
    }
  ]
}

Reglas:
- Genera entre 3 y 5 procesos críticos relevantes para el sector
- Genera entre 2 y 3 estrategias de recuperación
- Los valores de RTO/RPO deben ser realistas para el sector indicado
- Los procesos críticos deben reflejar los sistemas y operaciones más importantes del sector
- Responde SOLO con el JSON, absolutamente nada más`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { orgName, sector, description, planType } = await request.json()

    if (!sector?.trim()) {
      return NextResponse.json({ error: 'El sector/industria es obligatorio' }, { status: 400 })
    }

    const planTypeLabel =
      planType === 'DRP' ? 'Plan de Recuperación ante Desastres (DRP)' :
      planType === 'HYBRID' ? 'Plan Híbrido de Continuidad y Recuperación (BCP/DRP)' :
      'Plan de Continuidad del Negocio (BCP)'

    const userMessage = `Genera un ${planTypeLabel} para la siguiente organización:

- Nombre de la organización: ${orgName?.trim() || 'No especificado'}
- Sector / Industria: ${sector.trim()}
- Contexto adicional: ${description?.trim() || 'Sin información adicional'}

Adapta todos los procesos críticos, estrategias y métricas al sector específico indicado. Los nombres de procesos deben reflejar operaciones reales de ese sector.`

    // Call Claude AI
    let raw: string
    try {
      raw = await askClaude({
        system: GENERATE_SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 3000,
        temperature: 0.3,
      })
    } catch (aiErr) {
      console.error('[bcp/generate] Claude error:', aiErr)
      return NextResponse.json({ error: 'Error al conectar con la IA. Verifica la configuración de ANTHROPIC_API_KEY.' }, { status: 503 })
    }

    // Parse JSON from response
    let generated: any
    try {
      const clean = raw
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()
      generated = JSON.parse(clean)
    } catch (parseErr) {
      console.error('[bcp/generate] JSON parse error. Raw:', raw?.substring(0, 500))
      return NextResponse.json({ error: 'Error procesando la respuesta de la IA. Inténtalo de nuevo.' }, { status: 500 })
    }

    // Validate structure
    if (!generated.name || !generated.criticalProcesses?.length) {
      return NextResponse.json({ error: 'La IA generó un plan incompleto. Inténtalo de nuevo.' }, { status: 500 })
    }

    // Next review date: 6 months from now
    const nextReviewDate = new Date()
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6)

    // Create the BCP plan in DB
    const plan = await prisma.businessContinuityPlan.create({
      data: {
        userId: session.user.id,
        name: generated.name,
        description: generated.description || 'Plan generado con IA',
        scope: generated.scope || null,
        objectives: generated.objectives || [],
        version: '1.0',
        status: 'DRAFT',
        nextReviewDate,
        rto: Math.round((generated.rto || 4) * 60),  // convert hours → minutes
        rpo: Math.round((generated.rpo || 1) * 60),  // convert hours → minutes
        mtpd: generated.mtpd || 72,                   // already in hours
      },
    })

    // Create critical processes
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

    // Create recovery strategies
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
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[bcp/generate] Error:', error)
    return NextResponse.json({ error: 'Error interno al generar el plan' }, { status: 500 })
  }
}
