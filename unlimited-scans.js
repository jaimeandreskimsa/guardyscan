const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Actualizar todas las suscripciones a ilimitado
  const result = await prisma.subscription.updateMany({
    data: {
      scansLimit: -1,
      scansUsed: 0
    }
  });
  
  console.log(`✅ Scans ilimitados activados. ${result.count} suscripciones actualizadas.`);
  
  // Mostrar estado
  const subscriptions = await prisma.subscription.findMany({
    include: { user: { select: { email: true } } }
  });
  
  console.log('\n📊 Estado de suscripciones:');
  subscriptions.forEach(sub => {
    console.log(`- ${sub.user.email}: ${sub.scansUsed}/${sub.scansLimit === -1 ? '∞' : sub.scansLimit} scans (${sub.plan})`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
