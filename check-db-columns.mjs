import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkColumns() {
  try {
    // Intentar hacer una query que use resetToken
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 Columnas en la tabla users:');
    console.table(result);
    
    const hasResetToken = result.some(col => col.column_name === 'resetToken');
    const hasResetTokenExpiry = result.some(col => col.column_name === 'resetTokenExpiry');
    
    console.log('\n✅ Verificación:');
    console.log('resetToken existe:', hasResetToken);
    console.log('resetTokenExpiry existe:', hasResetTokenExpiry);
    
    if (!hasResetToken || !hasResetTokenExpiry) {
      console.log('\n❌ FALTAN LAS COLUMNAS - Aplicando migración manual...');
      
      await prisma.$executeRaw`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS "resetToken" TEXT,
        ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
      `;
      
      console.log('✅ Columnas agregadas exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
