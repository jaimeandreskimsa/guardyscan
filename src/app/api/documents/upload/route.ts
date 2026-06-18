import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    const name         = (formData.get('name')         as string) || file.name
    const category     = (formData.get('category')     as string) || 'other'
    const description  = (formData.get('description')  as string) || ''
    const tagsRaw      = (formData.get('tags')         as string) || ''
    const isConfidential = formData.get('isConfidential') === 'true'

    // Subir a Vercel Blob (server-side, sin undici en el cliente)
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Guardar metadata en Neon
    const doc = await prisma.document.create({
      data: {
        userId:       session.user.id,
        name,
        originalName: file.name,
        category,
        description:  description || null,
        tags:         tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
        size:         file.size,
        mimeType:     file.type || 'application/octet-stream',
        fileType:     file.name.split('.').pop() || '',
        url:          blob.url,
        isConfidential,
        uploadedBy:   session.user.name || session.user.email || null,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('[documents/upload]', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}
