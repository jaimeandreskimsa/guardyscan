/**
 * import-aclin-data.mjs
 * Reads ACLIN Excel files and generates JSON + browser console snippet
 * for loading workers and inventory into GuardyScan localStorage.
 *
 * Run: node import-aclin-data.mjs
 */

import { writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

const WORKERS_FILE =
  'documentos/LEY MARCO 21663-ACLIN/5 CAPACITACION Y CONCIENCIA/PROGRAMA-CAPACITACION/PLANILLAS/Dotacion 2026 ACLIN.xlsx';
const INVENTORY_FILE =
  'documentos/LEY MARCO 21663-ACLIN/1 GOBIERNO Y ESTRUCTURA/ACTAS Y PLANILLAS/PLANILLAS/Cotejo Laboratorios ACLIN.xlsx';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatExcelDate(val) {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel serial number → JS date
    const base = new Date(1900, 0, 1); // Jan 1 1900
    const date = new Date(base.getTime() + (val - 2) * 86400000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    // Try DD/MM/YYYY
    const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return val;
  }
  return '';
}

function mapContractType(tipo) {
  const t = String(tipo || '').toLowerCase().trim();
  if (t.includes('indefinido')) return 'PLANTA';
  if (t.includes('plazo') || t.includes('fijo')) return 'CONTRATA';
  if (t.includes('honorario')) return 'HONORARIOS';
  if (t.includes('externo')) return 'EXTERNO';
  return 'PLANTA';
}

function mapEquipmentType(tipo) {
  const t = String(tipo || '').toUpperCase().trim();
  if (t === 'COMPUTADOR') return 'PC';
  if (t === 'NOTEBOOK' || t === 'LAPTOP') return 'Notebook';
  if (t === 'IMPRESORA') return 'Impresora';
  if (t === 'ROUTER' || t === 'SWITCH') return 'Red';
  if (t === 'SERVIDOR' || t === 'SERVER') return 'Servidor';
  return tipo || 'PC';
}

function mapCriticality(tipo) {
  const t = String(tipo || '').toUpperCase().trim();
  if (t === 'COMPUTADOR' || t === 'NOTEBOOK' || t === 'SERVIDOR') return 'ALTA';
  if (t === 'ROUTER' || t === 'SWITCH') return 'ALTA';
  if (t === 'IMPRESORA') return 'MEDIA';
  return 'MEDIA';
}

function str(val) {
  const s = String(val || '').trim();
  return s === '#VALUE!' || s === 'undefined' || s === 'null' ? '' : s;
}

// ─────────────────────────────────────────────
// WORKERS
// ─────────────────────────────────────────────

console.log('\n📋 Parsing workers...');

const wbW = xlsx.readFile(WORKERS_FILE);
const wsW = wbW.Sheets[wbW.SheetNames[0]];
const rowsW = xlsx.utils.sheet_to_json(wsW, { defval: '' });

const workers = [];

for (let i = 1; i < rowsW.length; i++) {
  const row = rowsW[i];

  const fullName = str(row['__EMPTY']);
  if (!fullName) continue;
  // Skip label/header lookalike rows
  if (fullName === 'Nombre Completo' || /^\d+$/.test(fullName)) continue;

  const rut = str(row['__EMPTY_1']);
  const email = str(row['__EMPTY_10']);
  const phone = str(row['__EMPTY_11']);
  const startDate = formatExcelDate(row['__EMPTY_14']);
  const position = str(row['__EMPTY_17']);
  const contractRaw = str(row['__EMPTY_18']);
  const razonSocial = str(row['__EMPTY_19']);

  const id = `ACLIN-W-${String(workers.length + 1).padStart(4, '0')}`;

  workers.push({
    id,
    fullName,
    rut,
    position,
    department: razonSocial || 'ACLIN SpA',
    contractType: mapContractType(contractRaw),
    startDate,
    endDate: '',
    institutionalEmail: email,
    corporatePhone: phone,
    systemRole: 'USUARIO',
    accessLevel: 'MEDIO',
    hasPersonalDataAccess: true,
    hasCriticalInfrastructureAccess: false,
    hasRemoteAccess: false,
    systemsAccess: [],
    hasNdaSigned: false,
    hasCyberTraining: false,
    knowsIncidentProtocol: false,
    knowsAcceptableUsePolicy: false,
    knowsAccessControlPolicy: false,
    lastTrainingDate: '',
    assignedAssets: [],
    supervisorName: '',
    securityOfficer: '',
    workerSignature: '',
    itResponsibleSignature: '',
    registrationDate: new Date().toISOString().split('T')[0],
  });
}

console.log(`  → ${workers.length} workers parsed`);
writeFileSync('aclin-workers.json', JSON.stringify(workers, null, 2));
console.log('  → aclin-workers.json written');

// ─────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────

console.log('\n📦 Parsing inventory...');

const wbI = xlsx.readFile(INVENTORY_FILE);
const wsI = wbI.Sheets[wbI.SheetNames[0]];
const rowsI = xlsx.utils.sheet_to_json(wsI, { defval: '' });

const inventory = [];
let currentLab = '';

for (let i = 1; i < rowsI.length; i++) {
  const row = rowsI[i];

  // Propagate lab name
  const labCell = str(row['COTEJO LABORATORIOS ACLIN v REGIÓN']);
  if (labCell && labCell !== 'Nombre Laboratorio') {
    currentLab = labCell;
  }

  const equipType = str(row['__EMPTY']);
  if (!equipType || equipType === 'Equipo') continue;

  const brand  = str(row['__EMPTY_1']);
  const model  = str(row['__EMPTY_2']);
  const code   = str(row['__EMPTY_3']);
  const serial = str(row['__EMPTY_4']);

  const id = `ACLIN-INV-${String(inventory.length + 1).padStart(4, '0')}`;
  const isComputer = equipType.toUpperCase() === 'COMPUTADOR';
  const isRouter   = equipType.toUpperCase() === 'ROUTER';

  inventory.push({
    id,
    assetCode: code || id,
    equipmentType: mapEquipmentType(equipType),
    brand:        brand  === 'SIN INFO' ? '' : brand,
    model:        model  === 'SIN INFO' ? '' : model,
    serialNumber: serial === 'SIN INFO' ? '' : serial,
    physicalLabel: !!code,
    status: 'OPERATIVO',
    criticality: mapCriticality(equipType),
    operatingSystem:        isComputer ? 'Windows' : '',
    operatingSystemVersion: '',
    processor:              '',
    ram:                    '',
    storage:                '',
    assignedIp:             '',
    macAddress:             '',
    domainOrWorkgroup:      '',
    antivirusInstalled:     isComputer,
    antivirusName:          isComputer ? 'Microsoft Defender' : '',
    firewallActive:         isRouter,
    diskEncryption:         false,
    physicalLocation:       currentLab,
    exactAddress:           '',
    department:             currentLab,
    assignedUser:           '',
    userRole:               '',
    corporateEmail:         '',
    purchaseDate:           '',
    supplier:               '',
    purchaseDocument:       '',
    equipmentCost:          0,
    warrantyUntil:          '',
    supportContract:        false,
    hasSensitiveInformation:     isComputer,
    sensitiveInformationType:    isComputer ? 'Datos clínicos de pacientes' : '',
    lastPatchUpdate:             '',
    lastSecurityReview:          '',
    backupConfigured:            false,
    lastBackupDate:              '',
    lastMaintenanceDate:         '',
    reportedIncidents:           '',
    relevantChanges:             '',
    decommissionDate:            '',
    decommissionReason:          '',
  });
}

console.log(`  → ${inventory.length} equipment records parsed`);
writeFileSync('aclin-inventory.json', JSON.stringify(inventory, null, 2));
console.log('  → aclin-inventory.json written');

// ─────────────────────────────────────────────
// Browser console snippet
// ─────────────────────────────────────────────

const snippet = `
// ──────────────────────────────────────────────────────────────
// GuardyScan – ACLIN Data Seed Script
// Run once in browser console while logged in as contacto@aclin.cl
// ──────────────────────────────────────────────────────────────
(function() {
  const WORKERS_KEY   = 'guardyscan_workers_registry_v1';
  const INVENTORY_KEY = 'guardyscan_inventory_equipment_v1';

  const workers   = ${JSON.stringify(workers)};
  const inventory = ${JSON.stringify(inventory)};

  // Merge with existing data (don't overwrite if already seeded)
  const existingWorkers   = JSON.parse(localStorage.getItem(WORKERS_KEY)   || '[]');
  const existingInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');

  if (existingWorkers.length === 0) {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
    console.log('✅ Workers loaded:', workers.length);
  } else {
    console.log('⚠️  Workers already present (' + existingWorkers.length + '), skipping');
  }

  if (existingInventory.length === 0) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    console.log('✅ Inventory loaded:', inventory.length);
  } else {
    console.log('⚠️  Inventory already present (' + existingInventory.length + '), skipping');
  }

  console.log('🔄 Reloading page...');
  setTimeout(() => location.reload(), 1000);
})();
`.trim();

writeFileSync('aclin-seed-browser.js', snippet);
console.log('  → aclin-seed-browser.js written');

// Summary
console.log('\n' + '═'.repeat(60));
console.log('✅  All done!');
console.log('═'.repeat(60));
console.log(`   Workers:   ${workers.length} records  →  aclin-workers.json`);
console.log(`   Inventory: ${inventory.length} records  →  aclin-inventory.json`);
console.log(`   Browser snippet          →  aclin-seed-browser.js`);
console.log('\nNext step:');
console.log('  1. Log in as contacto@aclin.cl on the platform');
console.log('  2. Open browser DevTools (F12) → Console tab');
console.log('  3. Paste the contents of aclin-seed-browser.js and press Enter');
console.log('  4. The page will reload with all data pre-loaded\n');
