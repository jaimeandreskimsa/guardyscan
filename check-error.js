const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Obtener el scan más reciente que falló
  const failedScan = await prisma.scan.findFirst({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' }
  });
  
  if (failedScan) {
    console.log('🔍 Scan fallido encontrado:');
    console.log('URL:', failedScan.targetUrl);
    console.log('Fecha:', failedScan.createdAt);
    console.log('Progreso:', failedScan.progress + '%');
    console.log('\n📋 Resultados/Error:');
    console.log(JSON.stringify(failedScan.results, null, 2));
  } else {
    console.log('No se encontraron scans fallidos');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
