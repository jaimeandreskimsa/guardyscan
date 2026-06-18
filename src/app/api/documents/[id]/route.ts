import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const document = await prisma.document.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!document) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Delete from Vercel Blob
  try {
    await del(document.url)
  } catch (e) {
    console.error('[blob] Error deleting blob:', e)
  }

  // Delete from DB
  await prisma.document.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}

// GET — get single document (for preview/download)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const document = await prisma.document.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!document) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ document })
}
