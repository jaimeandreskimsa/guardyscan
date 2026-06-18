import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const count = await prisma.user.count();
console.log('Total usuarios en BD:', count);
if (count > 0) {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 30
  });
  console.log('\n--- Últimos usuarios ---');
  users.forEach(u => console.log(u.createdAt.toISOString().slice(0,10), '|', u.email, '|', u.name || '(sin nombre)'));
}
await prisma.$disconnect();
