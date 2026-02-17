import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true
  },
  orderBy: {
    createdAt: 'desc'
  }
});

console.log('=== USUARIOS EN EL SISTEMA ===\n');
console.log(`Total de usuarios: ${users.length}\n`);

users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name || 'Sin nombre'}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Rol: ${user.role}`);
  console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`);
  console.log('');
});

await prisma.$disconnect();
