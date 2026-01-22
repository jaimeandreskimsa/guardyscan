import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL?.substring(0, 50) + '...' + process.env.DATABASE_URL?.split('@')[1]?.split('/')[0],
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED?.substring(0, 50) + '...' + process.env.DATABASE_URL_UNPOOLED?.split('@')[1]?.split('/')[0],
    DIRECT_URL: process.env.DIRECT_URL?.substring(0, 50) + '...' + process.env.DIRECT_URL?.split('@')[1]?.split('/')[0],
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('DB'))
  });
}
