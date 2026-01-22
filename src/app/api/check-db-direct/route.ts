import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Consulta SQL directa para ver las columnas de la tabla users
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    return NextResponse.json({
      success: true,
      columns: result.rows,
      hasResetToken: result.rows.some((row: any) => row.column_name === 'resetToken'),
      hasResetTokenExpiry: result.rows.some((row: any) => row.column_name === 'resetTokenExpiry'),
      databaseUrl: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    await pool.end();
  }
}
