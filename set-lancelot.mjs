import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setPassword() {
  const email = 'jaimegomez@kimsa.io';
  const password = 'Lancelot123*';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log('✅ Contraseña establecida a: Lancelot123*');
    console.log('Email:', email);
    console.log('\nAhora puedes iniciar sesión en http://localhost:3000/auth/login');
  } else {
    console.log('❌ Usuario no encontrado');
  }
  
  await prisma.$disconnect();
}

setPassword();
