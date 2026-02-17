import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
  where: { id: 'cmki3ypyj0000egih8alr2bb4' },
  select: { email: true, role: true, id: true }
});

console.log('Usuario por ID:', user);

const userByEmail = await prisma.user.findUnique({
  where: { email: 'jaimegomez@kimsa.io' },
  select: { email: true, role: true, id: true }
});

console.log('Usuario por Email:', userByEmail);

await prisma.$disconnect();
