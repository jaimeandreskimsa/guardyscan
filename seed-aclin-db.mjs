/**
 * seed-aclin-db.mjs
 * Carga los 198 trabajadores y 194 equipos del Excel directo a Neon.
 * Usa los JSON ya generados por import-aclin-data.mjs.
 *
 * Uso: node seed-aclin-db.mjs
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cargar variables de entorno desde .env.local
const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACLIN_USER_ID = 'cmqj5a2zh0000p42b7hzwqrqr';

async function main() {
  console.log('\n🔗 Conectando a Neon...');
  await prisma.$connect();
  console.log('✅ Conectado\n');

  // ─── WORKERS ───────────────────────────────────────────
  console.log('👷 Cargando trabajadores...');

  const workers = JSON.parse(readFileSync('aclin-workers.json', 'utf-8'));

  // Verificar si ya hay datos
  const existingWorkers = await prisma.worker.count({ where: { userId: ACLIN_USER_ID } });
  if (existingWorkers > 0) {
    console.log(`  ⚠️  Ya existen ${existingWorkers} trabajadores en Neon para ACLIN.`);
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => rl.question('  ¿Sobreescribir? (s/N): ', resolve));
    rl.close();
    if (answer.toLowerCase() !== 's') {
      console.log('  → Trabajadores omitidos');
    } else {
      await prisma.worker.deleteMany({ where: { userId: ACLIN_USER_ID } });
      console.log('  → Registros anteriores eliminados');
      await insertWorkers(workers);
    }
  } else {
    await insertWorkers(workers);
  }

  // ─── EQUIPMENT ─────────────────────────────────────────
  console.log('\n🖥️  Cargando inventario de equipos...');

  const equipment = JSON.parse(readFileSync('aclin-inventory.json', 'utf-8'));

  const existingEquip = await prisma.equipment.count({ where: { userId: ACLIN_USER_ID } });
  if (existingEquip > 0) {
    console.log(`  ⚠️  Ya existen ${existingEquip} equipos en Neon para ACLIN.`);
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => rl.question('  ¿Sobreescribir? (s/N): ', resolve));
    rl.close();
    if (answer.toLowerCase() !== 's') {
      console.log('  → Inventario omitido');
    } else {
      await prisma.equipment.deleteMany({ where: { userId: ACLIN_USER_ID } });
      console.log('  → Registros anteriores eliminados');
      await insertEquipment(equipment);
    }
  } else {
    await insertEquipment(equipment);
  }

  // ─── RESUMEN ────────────────────────────────────────────
  const totalW = await prisma.worker.count({ where: { userId: ACLIN_USER_ID } });
  const totalE = await prisma.equipment.count({ where: { userId: ACLIN_USER_ID } });

  console.log('\n' + '═'.repeat(60));
  console.log('✅  Carga completada en Neon');
  console.log('═'.repeat(60));
  console.log(`   Trabajadores en BD:  ${totalW}`);
  console.log(`   Equipos en BD:       ${totalE}`);
  console.log('\n🌐 Ahora visible en: /dashboard/workers y /dashboard/inventory');
  console.log('   para la cuenta contacto@aclin.cl\n');

  await prisma.$disconnect();
}

async function insertWorkers(workers) {
  let ok = 0, fail = 0;
  for (const w of workers) {
    try {
      const { id: _id, ...data } = w; // ignorar el id del Excel
      await prisma.worker.create({
        data: {
          ...data,
          userId: ACLIN_USER_ID,
          systemsAccess: data.systemsAccess ?? [],
          assignedAssets: data.assignedAssets ?? [],
        },
      });
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 3) console.error(`  ✗ Error en trabajador "${w.fullName}":`, e.message);
    }
  }
  console.log(`  → ${ok} insertados, ${fail} errores`);
}

async function insertEquipment(equipment) {
  let ok = 0, fail = 0;
  for (const eq of equipment) {
    try {
      const { id: _id, ...data } = eq; // ignorar el id del Excel
      await prisma.equipment.create({
        data: { ...data, userId: ACLIN_USER_ID },
      });
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 3) console.error(`  ✗ Error en equipo "${eq.assetCode}":`, e.message);
    }
  }
  console.log(`  → ${ok} insertados, ${fail} errores`);
}

main().catch(async e => {
  console.error('Error fatal:', e);
  await prisma.$disconnect();
  process.exit(1);
});
