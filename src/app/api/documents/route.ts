import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — lista documentos del usuario autenticado
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ documents })
}

// POST — guarda metadata de un documento ya subido a Vercel Blob
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, originalName, category, description, tags, size, mimeType, fileType, url, isConfidential } = body

    if (!name || !url) return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        name,
        originalName: originalName || name,
        category: category || 'other',
        description: description || null,
        tags: Array.isArray(tags) ? tags : [],
        size: size || 0,
        mimeType: mimeType || 'application/octet-stream',
        fileType: fileType || '',
        url,
        isConfidential: isConfidential || false,
        uploadedBy: (session.user as any).name || session.user.email || 'Usuario',
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('[documents POST]', error)
    return NextResponse.json({ error: 'Error guardando documento' }, { status: 500 })
  }
}
