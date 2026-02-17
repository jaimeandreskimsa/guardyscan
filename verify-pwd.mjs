import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const email = 'jaimegomez@kimsa.io';
const testPassword = 'Lancelot123*';

const user = await prisma.user.findUnique({
  where: { email }
});

if (user && user.password) {
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log('¿Contraseña Lancelot123* es válida?', isValid);
  
  if (!isValid) {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log('✅ Contraseña establecida a: Lancelot123*');
  }
} else {
  console.log('Usuario no encontrado');
}

await prisma.$disconnect();
