import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  try {
    console.log('🔍 Verificando el esquema de Prisma Client...\n');
    
    // Intentar acceder a los campos de resetToken
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    });
    
    console.log('✅ Prisma Client tiene acceso a los campos:');
    console.log('   - resetToken');
    console.log('   - resetTokenExpiry');
    console.log('\n✅ El Prisma Client está actualizado correctamente\n');
    
    if (testUser) {
      console.log('Usuario de prueba:', {
        email: testUser.email,
        hasResetToken: !!testUser.resetToken
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar el esquema:');
    console.error(error.message);
    
    if (error.message.includes('resetToken')) {
      console.log('\n⚠️  El Prisma Client NO tiene los campos actualizados');
      console.log('💡 Solución: Ejecuta "npx prisma generate" localmente y redespliega');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
