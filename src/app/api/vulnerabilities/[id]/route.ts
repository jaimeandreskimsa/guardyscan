import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener vulnerabilidad específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const vulnerability = await prisma.vulnerability.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!vulnerability) {
      return NextResponse.json({ error: 'Vulnerabilidad no encontrada' }, { status: 404 })
    }

    return NextResponse.json(vulnerability)
  } catch (error) {
    console.error('Error fetching vulnerability:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - Actualizar vulnerabilidad
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

    // Verificar que existe
    const existing = await prisma.vulnerability.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Vulnerabilidad no encontrada' }, { status: 404 })
    }

    // Si se está resolviendo, actualizar fecha
    const updateData: any = { ...data }
    if (data.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = session.user.id
    }

    const vulnerability = await prisma.vulnerability.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(vulnerability)
  } catch (error) {
    console.error('Error updating vulnerability:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar vulnerabilidad
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.vulnerability.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vulnerability:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
