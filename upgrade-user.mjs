import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EMAIL = 'igurbinal@gmail.com';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { subscription: true },
  });

  if (!user) {
    console.log('❌ Usuario no encontrado:', EMAIL);
    return;
  }

  console.log('✅ Usuario encontrado:', user.id, user.name);
  console.log('   Plan actual:', user.subscription?.plan);

  if (user.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        plan: 'ENTERPRISE',
        scansLimit: -1,
        scansUsed: 0,
        status: 'ACTIVE',
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'ENTERPRISE',
        scansLimit: -1,
        scansUsed: 0,
        status: 'ACTIVE',
      },
    });
  }

  console.log('🚀 Listo: plan ENTERPRISE + escaneos ilimitados aplicados a', EMAIL);
}

main().catch(console.error).finally(() => prisma.$disconnect());
