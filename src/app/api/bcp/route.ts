import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar planes BCP/DRP
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'plans', 'processes', 'tests'

    if (type === 'processes') {
      const processes = await prisma.criticalProcess.findMany({
        where: { 
          bcp: { userId: session.user.id } 
        },
        include: {
          bcp: { select: { name: true } }
        },
        orderBy: [{ criticality: 'desc' }, { rto: 'asc' }]
      })
      return NextResponse.json({ processes })
    }

    if (type === 'tests') {
      const tests = await prisma.bCPTest.findMany({
        where: {
          bcp: { userId: session.user.id }
        },
        include: {
          bcp: { select: { name: true } }
        },
        orderBy: { scheduledDate: 'desc' }
      })
      return NextResponse.json({ tests })
    }

    // Default: planes completos
    const plans = await prisma.businessContinuityPlan.findMany({
      where: { userId: session.user.id },
      include: {
        criticalProcesses: true,
        recoveryStrategies: true,
        bcpTests: { orderBy: { scheduledDate: 'desc' }, take: 5 },
        _count: {
          select: { criticalProcesses: true, bcpTests: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Calcular métricas
    const metrics = {
      totalPlans: plans.length,
      activePlans: plans.filter((p: any) => p.status === 'ACTIVE').length,
      totalProcesses: plans.reduce((acc: number, p: any) => acc + (p._count?.criticalProcesses || 0), 0),
      upcomingTests: 0,
      overdueReviews: 0,
    }

    const now = new Date()
    for (const plan of plans) {
      for (const test of (plan.bcpTests || [])) {
        if (test.status === 'SCHEDULED' && new Date(test.scheduledDate) > now) {
          metrics.upcomingTests++
        }
      }
      if (plan.nextReviewDate && new Date(plan.nextReviewDate) < now) {
        metrics.overdueReviews++
      }
    }

    return NextResponse.json({ plans, metrics })
  } catch (error) {
    console.error('Error fetching BCP data:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear plan BCP/DRP
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { action, data } = await request.json()

    if (action === 'createPlan') {
      // Calcular próxima revisión (6 meses por defecto)
      const nextReviewDate = new Date()
      nextReviewDate.setMonth(nextReviewDate.getMonth() + 6)

      const plan = await prisma.businessContinuityPlan.create({
        data: {
          userId: session.user.id,
          name: data.name,
          description: data.description || 'Plan de Continuidad del Negocio',
          scope: data.scope,
          objectives: data.objectives || [],
          version: '1.0',
          status: 'DRAFT',
          nextReviewDate,
          rto: (data.rtoTarget || 4) * 60, // Convertir a minutos
          rpo: (data.rpoTarget || 1) * 60, // Convertir a minutos
          mtpd: data.mtpdTarget || 72, // horas
        }
      })

      return NextResponse.json(plan, { status: 201 })
    }

    if (action === 'addProcess') {
      const process = await prisma.criticalProcess.create({
        data: {
          bcpId: data.bcpId,
          name: data.name,
          description: data.description || 'Proceso crítico',
          owner: data.owner,
          department: data.department,
          criticality: data.criticalityLevel || 'HIGH',
          priority: data.priority || 1,
          rto: (data.rto || 4) * 60, // Convertir a minutos
          rpo: (data.rpo || 1) * 60, // Convertir a minutos
          dependencies: data.dependencies || [],
          resources: data.resources || [],
        }
      })

      return NextResponse.json(process, { status: 201 })
    }

    if (action === 'addStrategy') {
      const strategy = await prisma.recoveryStrategy.create({
        data: {
          bcpId: data.bcpId,
          name: data.name,
          description: data.description || 'Estrategia de recuperación',
          type: data.type || 'MANUAL', // HOT_SITE, WARM_SITE, COLD_SITE, CLOUD, MANUAL
          location: data.location,
          provider: data.provider,
          contactInfo: data.contactInfo || {},
          capacity: data.capacity,
          activationTime: data.activationTime,
          monthlyCost: data.monthlyCost,
          activationCost: data.activationCost,
          status: 'PLANNED',
        }
      })

      return NextResponse.json(strategy, { status: 201 })
    }

    if (action === 'scheduleTest') {
      const test = await prisma.bCPTest.create({
        data: {
          bcpId: data.bcpId,
          name: data.name,
          description: data.description,
          type: data.type || 'TABLETOP', // TABLETOP, WALKTHROUGH, SIMULATION, FULL
          scheduledDate: new Date(data.scheduledDate),
          participants: data.participants || [],
          objectives: data.objectives || [],
          status: 'SCHEDULED',
        }
      })

      return NextResponse.json(test, { status: 201 })
    }

    if (action === 'completeTest') {
      const test = await prisma.bCPTest.update({
        where: { id: data.testId },
        data: {
          status: 'COMPLETED',
          actualDate: new Date(),
          duration: data.duration,
          results: data.results,
          findings: data.findings || [],
          recommendations: data.recommendations,
          lessonsLearned: data.lessonsLearned,
          rtoAchieved: data.rtoAchieved,
          rpoAchieved: data.rpoAchieved,
          successRate: data.successRate,
        }
      })

      return NextResponse.json(test)
    }

    if (action === 'createIRP') {
      const irp = await prisma.incidentResponsePlan.create({
        data: {
          userId: session.user.id,
          name: data.name,
          type: data.type || 'cyber', // cyber, natural, operational, pandemic
          description: data.description || 'Plan de Respuesta a Incidentes',
          triggerConditions: data.triggerConditions || [],
          escalationMatrix: data.escalationMatrix || [],
          phases: data.phases || {
            preparation: [],
            detection: [],
            containment: [],
            eradication: [],
            recovery: [],
            lessons: []
          },
          responseTeam: data.responseTeam || [],
          externalContacts: data.externalContacts || [],
          communicationPlan: data.communicationPlan || {},
          templates: data.templates || [],
          status: 'DRAFT',
          version: '1.0',
        }
      })

      return NextResponse.json(irp, { status: 201 })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error in BCP action:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
