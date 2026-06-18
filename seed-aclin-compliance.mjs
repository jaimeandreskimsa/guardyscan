/**
 * seed-aclin-compliance.mjs
 * Carga el estado de cumplimiento Ley 21.663 de ACLIN con evidencias reales.
 * 28 controles IMPLEMENTED (85%) + 2 EN PROGRESO (L19 MFA, L27 colaboración)
 *
 * Uso: node seed-aclin-compliance.mjs
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ACLIN_USER_ID = 'cmqj5a2zh0000p42b7hzwqrqr';
const FW = 'LEY21663';
const TODAY = '2026-06-18';

// ── URLs de documentos en Vercel Blob ─────────────────────────────────────────
const BASE = 'https://ag5s2c1by0qrlb3m.public.blob.vercel-storage.com/documents/aclin';
const DOCS = {
  politicaGeneral:        `${BASE}/policies/Politica_General_Ciberseguridad_ACLIN_2026.pdf`,
  politicaAccesos:        `${BASE}/policies/Politica_Control_Accesos_ACLIN_2026.pdf`,
  politicaClasificacion:  `${BASE}/policies/Politica_Clasificacion_Informacion_ACLIN_2026.pdf`,
  politicaContrasenas:    `${BASE}/policies/Politica_Control_Accesos_Contrasen%CC%83as_ACLIN_2026.pdf`,
  politicaUsoAceptable:   `${BASE}/policies/Politica_Uso_Aceptable_TI_ACLIN_2026.pdf`,
  procGestionIncidentes:  `${BASE}/policies/Procedimiento_Gestion_Incidentes_ACLIN_2026.pdf`,
  procGestionIncSeg:      `${BASE}/compliance/Procedimiento_Gestion_Incidentes_Seguridad_ACLIN_2026.pdf`,
  procReporteCsirt:       `${BASE}/policies/Procedimiento_Reporte_CSIRT_ACLIN_2026.pdf`,
  procRespaldo:           `${BASE}/policies/Procedimiento_Respaldo_Recuperacion_ACLIN_2026.pdf`,
  procMonitoreo:          `${BASE}/policies/Procedimiento_Monitoreo_Seguridad_ACLIN_2026.pdf`,
  procParcheo:            `${BASE}/policies/Procedimiento_Actualizacion_Parcheo_ACLIN_2026.pdf`,
  procGestionUsuarios:    `${BASE}/policies/Procedimiento_Gestion_Usuarios_ACLIN_2026.pdf`,
  bcp:                    `${BASE}/bcp/BCP_ACLIN_2026.pdf`,
  drp:                    `${BASE}/bcp/DRP_ACLIN_2026.pdf`,
  bia:                    `${BASE}/bcp/BIA_ACLIN_2026.pdf`,
  planRespuesta:          `${BASE}/bcp/Plan_Respuesta_Incidentes_ACLIN_2026.pdf`,
  inventarioServicios:    `${BASE}/bcp/Inventario_Servicios_Criticos_ACLIN_2026.pdf`,
  simulacros:             `${BASE}/bcp/Plan_Anual_Simulacros_Continuidad_ACLIN_2026.pdf`,
  inventarioActivos:      `${BASE}/compliance/Inventario_Activos_Criticos_ACLIN_2026.pdf`,
  matrizRiesgos:          `${BASE}/compliance/Matriz_Riesgos_Ciberseguridad_ACLIN_2026.pdf`,
  metodologiaRiesgos:     `${BASE}/compliance/Metodologia_Analisis_Riesgos_ACLIN_2026.pdf`,
  planTratamiento:        `${BASE}/compliance/Plan_Tratamiento_Riesgos_ACLIN_2026.pdf`,
  registroRiesgos:        `${BASE}/compliance/Registro_Evaluacion_Riesgos_ACLIN_2026.pdf`,
  capacitacion:           `${BASE}/compliance/Capacitacion_Ciberseguridad_ACLIN_2026.pdf`,
  planCapacitacion:       `${BASE}/compliance/Plan_Anual_Capacitacion_Ciberseguridad_ACLIN_2026.xlsx`,
  auditInterna:           `${BASE}/compliance/Informe_Auditoria_Interna_Ley21663_ACLIN_2026.pdf`,
  auditExpandida:         `${BASE}/compliance/Informe_Auditoria_Expandida_Ley21663_ACLIN_2026.pdf`,
  informeCumplimiento:    `${BASE}/legal/Informe_Cumplimiento_Ley21663_ACLIN_2026.pdf`,
  matrizRaci:             `${BASE}/legal/Matriz_RACI_Ciberseguridad_ACLIN_2026.xlsx`,
  actaConstitucion:       `${BASE}/legal/Acta_Constitucion_Comite_Ciberseguridad.pdf`,
  nombramiAuditor:        `${BASE}/legal/Nombramiento_Auditor_Externo_ACLIN_2026.pdf`,
  informeAnci:            `${BASE}/legal/Informe_Ejecutivo_ANCI_Regulatorio_2026.pdf`,
  plantillaReporte:       `${BASE}/compliance/Plantilla_Reporte_Incidente_Ley21663_ACLIN.pdf`,
};

// ── 30 controles Ley 21.663 con estado y evidencia ───────────────────────────
const controls = [
  {
    controlId: 'L1',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.politicaGeneral,
    notes: 'Política General de Ciberseguridad ACLIN 2026 aprobada y vigente. Alineada con la Política Nacional de Ciberseguridad.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Politica_General_Ciberseguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L2',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.informeAnci,
    notes: 'Informe Ejecutivo enviado a ANCI. Coordinación activa con el regulador en el marco de la Ley 21.663.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Informe_Ejecutivo_ANCI_Regulatorio_2026.pdf',
  },
  {
    controlId: 'L3',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.inventarioActivos,
    notes: 'Inventario de Activos Críticos ACLIN 2026 elaborado, clasificado y aprobado por el Comité.',
    responsible: 'Área TI ACLIN',
    fileName: 'Inventario_Activos_Criticos_ACLIN_2026.pdf',
  },
  {
    controlId: 'L4',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.politicaAccesos,
    notes: 'Controles de protección implementados: políticas de acceso, segmentación de red, monitoreo continuo y hardening de equipos.',
    responsible: 'Área TI ACLIN',
    fileName: 'Politica_Control_Accesos_ACLIN_2026.pdf',
  },
  {
    controlId: 'L5',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.procGestionIncidentes,
    notes: 'Procedimiento de Gestión de Incidentes vigente. Incluye mecanismos de reporte al CSIRT según Ley 21.663.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Procedimiento_Gestion_Incidentes_ACLIN_2026.pdf',
  },
  {
    controlId: 'L6',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.procReporteCsirt,
    notes: 'Procedimiento de Reporte CSIRT define plazos: alerta en 24h e informe completo en 72h conforme a la ley.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Procedimiento_Reporte_CSIRT_ACLIN_2026.pdf',
  },
  {
    controlId: 'L7',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.planRespuesta,
    notes: 'Plan de Respuesta a Incidentes 2026 define al equipo CSIRT interno. Nombramiento Auditor Externo como respaldo.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Plan_Respuesta_Incidentes_ACLIN_2026.pdf',
  },
  {
    controlId: 'L8',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.politicaClasificacion,
    notes: 'Política de Clasificación de la Información cubre protección de datos personales conforme a Ley 19.628. Todos los trabajadores (198) han firmado acuerdo de confidencialidad.',
    responsible: 'RRHH ACLIN / Paulina Tapia Hernández',
    fileName: 'Politica_Clasificacion_Informacion_ACLIN_2026.pdf',
  },
  {
    controlId: 'L9',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.matrizRiesgos,
    notes: 'Metodología de Análisis de Riesgos, Matriz de Riesgos y Registro de Evaluación completos. Plan de Tratamiento aprobado.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Matriz_Riesgos_Ciberseguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L10',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.bcp,
    notes: 'Plan de Continuidad de Negocio (BCP) 2026 elaborado, aprobado y con pruebas programadas. Incluye escenarios de ciberseguridad.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'BCP_ACLIN_2026.pdf',
  },
  {
    controlId: 'L11',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.drp,
    notes: 'Plan de Recuperación de Desastres (DRP) 2026 documentado. Procedimiento de Respaldo y Recuperación vigente.',
    responsible: 'Área TI ACLIN',
    fileName: 'DRP_ACLIN_2026.pdf',
  },
  {
    controlId: 'L12',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.capacitacion,
    notes: '30 constancias de capacitación en ciberseguridad. Plan Anual de Capacitación vigente. Programa de Concientización ejecutado.',
    responsible: 'RRHH ACLIN / Paulina Tapia Hernández',
    fileName: 'Capacitacion_Ciberseguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L13',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.auditExpandida,
    notes: 'Auditoría Interna y Auditoría Expandida Ley 21.663 realizadas por Jaime Gómez Ayala (Auditor Externo). Informes disponibles.',
    responsible: 'Jaime Gómez Ayala (Auditor Externo)',
    fileName: 'Informe_Auditoria_Expandida_Ley21663_ACLIN_2026.pdf',
  },
  {
    controlId: 'L14',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.inventarioActivos,
    notes: 'Inventario de Activos Críticos completo. Inventario de equipos TI cargado: 194 equipos en 20 laboratorios. Inventario de Servicios Críticos disponible.',
    responsible: 'Área TI ACLIN',
    fileName: 'Inventario_Activos_Criticos_ACLIN_2026.pdf',
  },
  {
    controlId: 'L15',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.matrizRiesgos,
    notes: 'Evaluación de riesgos de proveedores incluida en la Matriz de Riesgos. Módulo de terceros activo en el sistema.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Matriz_Riesgos_Ciberseguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L16',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.politicaGeneral,
    notes: 'Política General y procedimientos incluyen cláusulas de ciberseguridad para proveedores. Contratos con requisitos de seguridad en proceso de actualización.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Politica_General_Ciberseguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L17',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.politicaGeneral,
    notes: 'Controles de seguridad para servicios en la nube definidos en la Política General. Microsoft 365 y servicios cloud bajo gestión de seguridad.',
    responsible: 'Área TI ACLIN',
    fileName: 'Politica_General_Ciberseguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L18',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.politicaContrasenas,
    notes: 'Política de Control de Accesos y Contraseñas define cifrado obligatorio. Datos sensibles de pacientes cifrados en reposo y tránsito (TLS 1.3).',
    responsible: 'Área TI ACLIN',
    fileName: 'Politica_Control_Accesos_Contrasen%CC%83as_ACLIN_2026.pdf',
  },
  {
    controlId: 'L19',
    implementationStatus: 'IN_PROGRESS',
    docType: 'link',
    evidence: DOCS.politicaAccesos,
    notes: 'Política de Control de Accesos implementada. MFA en proceso de implementación para sistemas críticos. Estimado: Q3 2026.',
    responsible: 'Área TI ACLIN',
    targetDate: '2026-09-30',
    fileName: 'Politica_Control_Accesos_ACLIN_2026.pdf',
  },
  {
    controlId: 'L20',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.procMonitoreo,
    notes: 'Procedimiento de Monitoreo de Seguridad activo. Sistema SIEM configurado con detección continua de amenazas.',
    responsible: 'Área TI ACLIN',
    fileName: 'Procedimiento_Monitoreo_Seguridad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L21',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.procParcheo,
    notes: 'Procedimiento de Actualización y Parcheo vigente con cronograma mensual. 194 equipos bajo gestión de parches.',
    responsible: 'Área TI ACLIN',
    fileName: 'Procedimiento_Actualizacion_Parcheo_ACLIN_2026.pdf',
  },
  {
    controlId: 'L22',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.procRespaldo,
    notes: 'Procedimiento de Respaldo y Recuperación vigente. Backups automáticos diarios con pruebas de restauración programadas.',
    responsible: 'Área TI ACLIN',
    fileName: 'Procedimiento_Respaldo_Recuperacion_ACLIN_2026.pdf',
  },
  {
    controlId: 'L23',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.informeCumplimiento,
    notes: 'Informe de Cumplimiento Ley 21.663 ACLIN 2026 elaborado y disponible. Auditoría externa realizada.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Informe_Cumplimiento_Ley21663_ACLIN_2026.pdf',
  },
  {
    controlId: 'L24',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.actaConstitucion,
    notes: 'Acta de Constitución del Comité de Ciberseguridad suscrita por la Dirección. Comité activo con 6 sesiones programadas en 2026.',
    responsible: 'M. Ignacia Tapia Baldassare (Dirección)',
    fileName: 'Acta_Constitucion_Comite_Ciberseguridad.pdf',
  },
  {
    controlId: 'L25',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.matrizRaci,
    notes: 'Paulina Tapia Hernández designada formalmente como CISO. Matriz RACI define responsabilidades. Nombramiento documentado.',
    responsible: 'M. Ignacia Tapia Baldassare (Dirección)',
    fileName: 'Matriz_RACI_Ciberseguridad_ACLIN_2026.xlsx',
  },
  {
    controlId: 'L26',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.informeCumplimiento,
    notes: 'Presupuesto de ciberseguridad asignado para 2026. Inversión en auditorías, herramientas, capacitación y consultoría documentada.',
    responsible: 'M. Ignacia Tapia Baldassare (Dirección)',
    fileName: 'Informe_Cumplimiento_Ley21663_ACLIN_2026.pdf',
  },
  {
    controlId: 'L27',
    implementationStatus: 'IN_PROGRESS',
    docType: 'manual',
    evidence: 'Participación en iniciativas sectoriales en evaluación. Auditor externo Jaime Gómez Ayala actúa como enlace con organismos del sector.',
    notes: 'Se está evaluando adhesión a grupos de trabajo del sector salud en ciberseguridad. Estimado: Q4 2026.',
    responsible: 'Jaime Gómez Ayala (Auditor Externo)',
    targetDate: '2026-12-31',
    fileName: '',
  },
  {
    controlId: 'L28',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.simulacros,
    notes: 'Plan Anual de Simulacros de Continuidad 2026 aprobado. Registro de Pruebas y Lecciones Aprendidas disponible.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Plan_Anual_Simulacros_Continuidad_ACLIN_2026.pdf',
  },
  {
    controlId: 'L29',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.auditExpandida,
    notes: 'Organización conoce y gestiona el riesgo de sanciones. Auditoría expandida identifica riesgos de incumplimiento. Informe de cumplimiento vigente.',
    responsible: 'Jaime Gómez Ayala (Auditor Externo)',
    fileName: 'Informe_Auditoria_Expandida_Ley21663_ACLIN_2026.pdf',
  },
  {
    controlId: 'L30',
    implementationStatus: 'IMPLEMENTED',
    docType: 'link',
    evidence: DOCS.informeCumplimiento,
    notes: 'Documentación completa: 86 documentos organizados en 8 categorías. Evidencias de todos los controles disponibles en el repositorio.',
    responsible: 'Paulina Tapia Hernández (CISO)',
    fileName: 'Informe_Cumplimiento_Ley21663_ACLIN_2026.pdf',
  },
];

async function main() {
  console.log('\n🔗 Conectando a Neon...');
  await prisma.$connect();
  console.log('✅ Conectado\n');

  console.log('📋 Cargando estado de cumplimiento Ley 21.663...');

  // Limpiar estados anteriores de ACLIN
  await (prisma).userComplianceState.deleteMany({ where: { userId: ACLIN_USER_ID, frameworkId: FW } });

  let ok = 0, inProgress = 0;
  for (const c of controls) {
    await (prisma).userComplianceState.create({
      data: {
        userId: ACLIN_USER_ID,
        frameworkId: FW,
        controlId: c.controlId,
        implementationStatus: c.implementationStatus,
        docType: c.docType || null,
        evidence: c.evidence || null,
        notes: c.notes || null,
        responsible: c.responsible || '',
        targetDate: c.targetDate || '',
        fileName: c.fileName || '',
        lastReviewed: TODAY,
      },
    });
    if (c.implementationStatus === 'IMPLEMENTED') ok++;
    else inProgress++;
  }

  const pct = Math.round((ok / controls.length) * 100);

  console.log('\n' + '═'.repeat(60));
  console.log('✅  Cumplimiento Ley 21.663 cargado en Neon');
  console.log('═'.repeat(60));
  console.log(`   IMPLEMENTADO:  ${ok} controles`);
  console.log(`   EN PROGRESO:   ${inProgress} controles (L19 MFA, L27 colaboración)`);
  console.log(`   PORCENTAJE:    ${pct}% (${ok}/${controls.length})`);
  console.log('\n🌐 Visible en: /dashboard/compliance → Ley 21.663\n');

  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
