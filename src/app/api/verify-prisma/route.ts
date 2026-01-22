import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Intentar hacer una consulta que use los campos resetToken
    const testQuery = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Prisma Client tiene acceso a los campos resetToken',
      prismaVersion: '@prisma/client@5.22.0',
      fieldsAccessible: ['resetToken', 'resetTokenExpiry'],
      testUser: testQuery ? {
        email: testQuery.email,
        hasResetToken: !!testQuery.resetToken
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      prismaClientOutdated: error.message.includes('resetToken'),
      recommendation: error.message.includes('resetToken') 
        ? 'El Prisma Client necesita regenerarse. Vercel está usando una versión cacheada.'
        : 'Error desconocido'
    }, { status: 500 });
  }
}
