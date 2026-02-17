import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
  where: { email: 'jaimegomez@kimsa.io' },
  select: { email: true, name: true, role: true }
});

console.log('=== USUARIO EN DB ===');
console.log(JSON.stringify(user, null, 2));

await prisma.$disconnect();
