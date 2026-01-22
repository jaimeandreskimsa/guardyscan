const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Resetear todos los contadores de scans
  const result = await prisma.subscription.updateMany({
    data: {
      scansUsed: 0
    }
  });
  
  console.log(`✅ Reseteo completado. ${result.count} suscripciones actualizadas.`);
  
  // Mostrar límites actuales
  const subscriptions = await prisma.subscription.findMany({
    include: { user: { select: { email: true } } }
  });
  
  console.log('\n📊 Estado de suscripciones:');
  subscriptions.forEach(sub => {
    console.log(`- ${sub.user.email}: ${sub.scansUsed}/${sub.scansLimit} scans (${sub.plan})`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
