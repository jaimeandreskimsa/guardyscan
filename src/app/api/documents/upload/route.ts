import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Handles Vercel Blob client uploads:
// 1. Client calls upload() from @vercel/blob/client pointing here
// 2. This route generates a short-lived upload token
// 3. The file goes directly from browser → Vercel Blob (no size limit on server)
export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname) => ({
        allowedContentTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
          'text/plain',
          'text/csv',
          'application/zip',
          'application/octet-stream',
        ],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        tokenPayload: JSON.stringify({ userId: session.user.id }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('[blob] Upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
