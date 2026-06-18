/**
 * seed-aclin-committee.mjs
 * Carga los miembros del comité y sesiones de ciberseguridad de ACLIN a Neon.
 * Datos extraídos de: Matriz RACI y Calendario Comité Ciberseguridad ACLIN 2026.xlsx
 *
 * Uso: node seed-aclin-committee.mjs
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cargar .env.local
const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACLIN_USER_ID = 'cmqj5a2zh0000p42b7hzwqrqr';

// ── Miembros del Comité (extraídos de la Matriz RACI) ──────────────────────────
const members = [
  {
    name: 'Paulina Tapia Hernández',
    role: 'CISO - Encargada de Ciberseguridad',
    email: 'p.tapia@aclin.cl',
    phone: '',
    department: 'Ciberseguridad',
    responsibilities: 'R: Definir política de ciberseguridad, Implementar controles, Gestión de riesgos, Gestión de incidentes, Gestión de accesos, Backups y recuperación, Capacitación de ciberseguridad, Evaluación de proveedores, Auditoría interna de seguridad, Revisión del sistema de ciberseguridad',
    status: 'ACTIVE',
  },
  {
    name: 'M. Ignacia Tapia Baldassare',
    role: 'Presidenta del Comité de Ciberseguridad',
    email: 'i.tapia@aclin.cl',
    phone: '',
    department: 'Dirección / Comité de Ciberseguridad',
    responsibilities: 'A: Aprueba todas las actividades del sistema de ciberseguridad. Preside el Comité. Responsable de constitución del comité.',
    status: 'ACTIVE',
  },
  {
    name: 'Jaime Gómez Ayala',
    role: 'Auditor Externo de Ciberseguridad',
    email: 'j.gomez@auditoria.cl',
    phone: '',
    department: 'Auditoría Externa',
    responsibilities: 'R: Auditoría externa de ciberseguridad independiente del SGC. C: Consultado en política, riesgos, incidentes, proveedores y revisión del sistema.',
    status: 'ACTIVE',
  },
  {
    name: 'Área TI ACLIN',
    role: 'Responsable de Área TI',
    email: 'ti@aclin.cl',
    phone: '',
    department: 'Tecnología de la Información',
    responsibilities: 'R: Implementar controles de seguridad, Gestión de riesgos, Gestión de incidentes, Gestión de accesos, Backups y recuperación, Capacitación de ciberseguridad, Evaluación de proveedores, Auditoría interna.',
    status: 'ACTIVE',
  },
  {
    name: 'RRHH ACLIN',
    role: 'Representante de Recursos Humanos',
    email: 'rrhh@aclin.cl',
    phone: '',
    department: 'Recursos Humanos',
    responsibilities: 'R: Capacitación de ciberseguridad. C: Gestión de riesgos, Gestión de incidentes, Gestión de accesos, Evaluación de proveedores, Auditoría interna.',
    status: 'ACTIVE',
  },
];

// ── Sesiones del Calendario ────────────────────────────────────────────────────
const sessions = [
  {
    topic: 'Constitución del Comité',
    description: 'Revisión diagnóstico Ley 21.663 y planificación inicial',
    date: new Date('2026-01-15'),
    time: '10:00',
    attendees: 'M. Ignacia Tapia Baldassare, Paulina Tapia Hernández, Área TI ACLIN',
    decisions: 'Constitución formal del Comité de Ciberseguridad ACLIN. Fase inicial de implementación 2026.',
    status: 'COMPLETED',
  },
  {
    topic: 'Seguimiento — Plan de Implementación',
    description: 'Revisión plan de implementación de controles de ciberseguridad',
    date: new Date('2026-02-10'),
    time: '10:00',
    attendees: 'Comité de Ciberseguridad ACLIN',
    decisions: 'Revisión avances plan de controles. Fase inicial implementación 2026.',
    status: 'COMPLETED',
  },
  {
    topic: 'Seguimiento — Cumplimiento Ley 21.663',
    description: 'Revisión avances cumplimiento Ley 21.663',
    date: new Date('2026-03-12'),
    time: '10:00',
    attendees: 'Comité de Ciberseguridad ACLIN',
    decisions: 'Revisión cumplimiento Ley Marco Ciberseguridad.',
    status: 'COMPLETED',
  },
  {
    topic: 'Revisión Trimestral Q2',
    description: 'Evaluación de incidentes y controles implementados',
    date: new Date('2026-06-15'),
    time: '10:00',
    attendees: 'Comité de Ciberseguridad ACLIN',
    decisions: '',
    status: 'SCHEDULED',
  },
  {
    topic: 'Revisión Trimestral Q3',
    description: 'Evaluación de riesgos y controles técnicos',
    date: new Date('2026-09-15'),
    time: '10:00',
    attendees: 'Comité de Ciberseguridad ACLIN',
    decisions: '',
    status: 'SCHEDULED',
  },
  {
    topic: 'Cierre Anual 2026',
    description: 'Revisión anual del sistema de ciberseguridad',
    date: new Date('2026-12-10'),
    time: '10:00',
    attendees: 'Comité de Ciberseguridad ACLIN',
    decisions: '',
    status: 'SCHEDULED',
  },
];

async function main() {
  console.log('\n🔗 Conectando a Neon...');
  await prisma.$connect();
  console.log('✅ Conectado\n');

  // ── Miembros ─────────────────────────────────────────────────────
  console.log('👥 Cargando miembros del comité...');
  const existingMembers = await prisma.committeeMember.count({ where: { userId: ACLIN_USER_ID } });
  if (existingMembers > 0) {
    await prisma.committeeMember.deleteMany({ where: { userId: ACLIN_USER_ID } });
    console.log('  → Miembros anteriores eliminados');
  }
  for (const m of members) {
    await prisma.committeeMember.create({ data: { ...m, userId: ACLIN_USER_ID, appointedDate: new Date('2026-01-15') } });
  }
  console.log(`  → ${members.length} miembros insertados`);

  // ── Sesiones ─────────────────────────────────────────────────────
  console.log('\n📅 Cargando sesiones del comité...');
  const existingSessions = await prisma.committeeSession.count({ where: { userId: ACLIN_USER_ID } });
  if (existingSessions > 0) {
    await prisma.committeeSession.deleteMany({ where: { userId: ACLIN_USER_ID } });
    console.log('  → Sesiones anteriores eliminadas');
  }
  for (const s of sessions) {
    await prisma.committeeSession.create({ data: { ...s, userId: ACLIN_USER_ID } });
  }
  console.log(`  → ${sessions.length} sesiones insertadas`);

  console.log('\n' + '═'.repeat(55));
  console.log('✅  Comité de Ciberseguridad cargado en Neon');
  console.log('═'.repeat(55));
  console.log(`   Miembros: ${members.length}  |  Sesiones: ${sessions.length}`);
  console.log('\n🌐 Visible en: /dashboard/committee\n');

  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
