import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EMAIL = 'igurbinal@gmail.com';

const user = await prisma.user.findUnique({
  where: { email: EMAIL },
  include: { subscription: true }
});

if (!user) {
  console.error('❌ No encontrado:', EMAIL);
  await prisma.$disconnect();
  process.exit(1);
}

console.log('--- Estado actual ---');
console.log('Email:       ', user.email);
console.log('Nombre:      ', user.name ?? '(sin nombre)');
console.log('Rol:         ', user.role);
console.log('Plan:        ', user.subscription?.plan);
console.log('Status:      ', user.subscription?.status);
console.log('ScansLimit:  ', user.subscription?.scansLimit);
console.log('ScansUsed:   ', user.subscription?.scansUsed);
console.log('PeriodEnd:   ', user.subscription?.currentPeriodEnd);

// Forzar reset completo por si acaso
await prisma.user.update({
  where: { id: user.id },
  data: { role: 'admin' }
});

await prisma.subscription.upsert({
  where: { userId: user.id },
  update: {
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    scansLimit: -1,
    scansUsed: 0,
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  create: {
    userId: user.id,
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    scansLimit: -1,
    scansUsed: 0,
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }
});

console.log('\n✅ Configuración forzada: ENTERPRISE + scansLimit=-1 + scansUsed=0 + role=admin');
await prisma.$disconnect();

