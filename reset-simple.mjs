import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email = 'jaimegomez@kimsa.io';
const newPassword = 'password123';

const user = await prisma.user.findUnique({
  where: { email }
});

if (user) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
  console.log('Contraseña actualizada a: password123');
} else {
  console.log('Usuario no encontrado');
}

await prisma.$disconnect();
