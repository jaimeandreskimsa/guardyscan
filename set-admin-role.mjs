import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin() {
  const user = await prisma.user.update({
    where: { email: 'jaimegomez@kimsa.io' },
    data: { role: 'admin' }
  });

  console.log('✅ Usuario actualizado a admin');
  console.log('Email:', user.email);
  console.log('Rol:', user.role);

  await prisma.$disconnect();
}

setAdmin();
