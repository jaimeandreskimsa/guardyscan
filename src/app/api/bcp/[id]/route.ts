import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener plan específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const plan = await prisma.businessContinuityPlan.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        criticalProcesses: {
          orderBy: [{ criticality: 'desc' }, { rto: 'asc' }]
        },
        recoveryStrategies: true,
        bcpTests: {
          orderBy: { scheduledDate: 'desc' }
        }
      }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    // También buscar IRPs del usuario
    const irps = await prisma.incidentResponsePlan.findMany({
      where: { userId: session.user.id },
      take: 1
    })

    // Calcular métricas del plan
    const metrics = {
      totalProcesses: plan.criticalProcesses.length,
      criticalProcesses: plan.criticalProcesses.filter((p: any) => p.criticality === 'CRITICAL').length,
      highProcesses: plan.criticalProcesses.filter((p: any) => p.criticality === 'HIGH').length,
      avgRTO: plan.criticalProcesses.length > 0 
        ? plan.criticalProcesses.reduce((acc: number, p: any) => acc + p.rto, 0) / plan.criticalProcesses.length 
        : 0,
      avgRPO: plan.criticalProcesses.length > 0 
        ? plan.criticalProcesses.reduce((acc: number, p: any) => acc + p.rpo, 0) / plan.criticalProcesses.length 
        : 0,
      testsCompleted: plan.bcpTests.filter((t: any) => t.status === 'COMPLETED').length,
      testsScheduled: plan.bcpTests.filter((t: any) => t.status === 'SCHEDULED').length,
      lastTestDate: plan.bcpTests.find((t: any) => t.status === 'COMPLETED')?.actualDate,
      hasIRP: irps.length > 0,
      strategiesCount: plan.recoveryStrategies.length,
    }

    return NextResponse.json({
      plan: {
        ...plan,
        incidentResponsePlan: irps[0] || null
      },
      metrics
    })
  } catch (error) {
    console.error('Error fetching BCP plan:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - Actualizar plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Verificar propiedad
    const existing = await prisma.businessContinuityPlan.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    // Si se está activando, actualizar versión
    const updateData: any = { ...data }
    if (data.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      const [major, minor] = (existing.version || '1.0').split('.')
      updateData.version = `${major}.${parseInt(minor) + 1}`
      updateData.approvedAt = new Date()
      updateData.approvedBy = session.user.id
      
      // Programar próxima revisión en 6 meses
      const nextReview = new Date()
      nextReview.setMonth(nextReview.getMonth() + 6)
      updateData.nextReviewDate = nextReview
    }

    const plan = await prisma.businessContinuityPlan.update({
      where: { id: params.id },
      data: updateData,
      include: {
        criticalProcesses: true,
        bcpTests: true
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error updating BCP plan:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.businessContinuityPlan.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting BCP plan:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
