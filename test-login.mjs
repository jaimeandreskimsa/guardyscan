import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  console.log('=== VERIFICANDO AUTENTICACIÓN ===\n');
  
  const email = 'jaimegomez@kimsa.io';
  const password = 'Admin123!';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  });
  
  if (!user) {
    console.log('❌ Usuario no encontrado');
    await prisma.$disconnect();
    return;
  }
  
  console.log('✓ Usuario encontrado:', user.email);
  console.log('✓ Tiene contraseña:', !!user.password);
  console.log('✓ Hash:', user.password ? user.password.substring(0, 20) + '...' : 'N/A');
  
  if (user.password) {
    const isValid = await bcrypt.compare(password, user.password);
    console.log('\n✓ Contraseña válida con bcrypt.compare:', isValid);
    
    // Probar diferentes contraseñas
    const tests = ['Admin123!', 'GuardyScan2026!', 'admin123'];
    console.log('\nProbando contraseñas:');
    for (const pwd of tests) {
      const valid = await bcrypt.compare(pwd, user.password);
      console.log('  -', pwd, ':', valid ? '✅ VÁLIDA' : '❌');
    }
  }
  
  await prisma.$disconnect();
}

testLogin();
