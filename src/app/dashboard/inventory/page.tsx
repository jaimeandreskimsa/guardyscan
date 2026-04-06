"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Laptop, Plus, Search, ShieldCheck, Shield, AlertTriangle,
  Lock, HardDrive, Eye, Edit, Trash2, X, MapPin, DollarSign,
  Server, Wifi, Smartphone, Printer, Monitor
} from "lucide-react";

type Criticality = "ALTA" | "MEDIA" | "BAJA";
type EquipmentStatus = "OPERATIVO" | "EN_REPARACION" | "DADO_DE_BAJA" | "OBSOLETO";

type EquipmentRecord = {
  id: string;
  assetCode: string;
  equipmentType: string;
  brand: string;
  model: string;
  serialNumber: string;
  physicalLabel: boolean;
  status: EquipmentStatus;
  criticality: Criticality;
  operatingSystem: string;
  operatingSystemVersion: string;
  processor: string;
  ram: string;
  storage: string;
  assignedIp: string;
  macAddress: string;
  domainOrWorkgroup: string;
  antivirusInstalled: boolean;
  antivirusName: string;
  firewallActive: boolean;
  diskEncryption: boolean;
  physicalLocation: string;
  exactAddress: string;
  department: string;
  assignedUser: string;
  userRole: string;
  corporateEmail: string;
  purchaseDate: string;
  supplier: string;
  purchaseDocument: string;
  equipmentCost: number;
  warrantyUntil: string;
  supportContract: boolean;
  hasSensitiveInformation: boolean;
  sensitiveInformationType: string;
  lastPatchUpdate: string;
  lastSecurityReview: string;
  backupConfigured: boolean;
  lastBackupDate: string;
  lastMaintenanceDate: string;
  reportedIncidents: string;
  relevantChanges: string;
  decommissionDate: string;
  decommissionReason: string;
};

const statusLabels: Record<EquipmentStatus, string> = {
  OPERATIVO: "Operativo",
  EN_REPARACION: "En reparación",
  DADO_DE_BAJA: "Dado de baja",
  OBSOLETO: "Obsoleto",
};

const criticalityLabels: Record<Criticality, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

const initialInventory: EquipmentRecord[] = [
  {
    id: "INV-1",
    assetCode: "KIMSA-NTB-001",
    equipmentType: "Notebook",
    brand: "Lenovo",
    model: "ThinkPad T14",
    serialNumber: "PF-9XK-001",
    physicalLabel: true,
    status: "OPERATIVO",
    criticality: "ALTA",
    operatingSystem: "Windows",
    operatingSystemVersion: "Windows 11 Pro 23H2",
    processor: "Intel Core i7",
    ram: "16 GB",
    storage: "SSD 512 GB",
    assignedIp: "10.20.15.23",
    macAddress: "00:1A:2B:3C:4D:5E",
    domainOrWorkgroup: "KIMSA-AD",
    antivirusInstalled: true,
    antivirusName: "Microsoft Defender",
    firewallActive: true,
    diskEncryption: true,
    physicalLocation: "Oficina",
    exactAddress: "Casa Matriz - Piso 3",
    department: "TI",
    assignedUser: "Ana Torres",
    userRole: "Analista de Seguridad",
    corporateEmail: "ana.torres@empresa.cl",
    purchaseDate: "2025-03-10",
    supplier: "TecnoChile SPA",
    purchaseDocument: "FAC-45871",
    equipmentCost: 1250000,
    warrantyUntil: "2028-03-10",
    supportContract: true,
    hasSensitiveInformation: true,
    sensitiveInformationType: "Clientes, Operativa",
    lastPatchUpdate: "2026-02-10",
    lastSecurityReview: "2026-02-01",
    backupConfigured: true,
    lastBackupDate: "2026-02-16",
    lastMaintenanceDate: "2026-01-15",
    reportedIncidents: "Sin incidentes",
    relevantChanges: "Reemplazo de SSD y hardening del equipo",
    decommissionDate: "",
    decommissionReason: "",
  },
  {
    id: "INV-2",
    assetCode: "KIMSA-SRV-002",
    equipmentType: "Servidor",
    brand: "Dell",
    model: "PowerEdge R450",
    serialNumber: "DL-R450-7781",
    physicalLabel: true,
    status: "OPERATIVO",
    criticality: "ALTA",
    operatingSystem: "Ubuntu Server",
    operatingSystemVersion: "22.04 LTS",
    processor: "Intel Xeon Silver",
    ram: "64 GB",
    storage: "SSD 2 TB",
    assignedIp: "10.10.0.12",
    macAddress: "AA:BB:CC:DD:EE:11",
    domainOrWorkgroup: "Datacenter",
    antivirusInstalled: true,
    antivirusName: "CrowdStrike",
    firewallActive: true,
    diskEncryption: true,
    physicalLocation: "Data Center",
    exactAddress: "Rack A-14",
    department: "Infraestructura",
    assignedUser: "Equipo TI",
    userRole: "Administración",
    corporateEmail: "infra@empresa.cl",
    purchaseDate: "2024-09-20",
    supplier: "InfraSecure Ltda",
    purchaseDocument: "OC-99817",
    equipmentCost: 4850000,
    warrantyUntil: "2029-09-20",
    supportContract: true,
    hasSensitiveInformation: true,
    sensitiveInformationType: "Financiera, RRHH",
    lastPatchUpdate: "2026-02-12",
    lastSecurityReview: "2026-01-25",
    backupConfigured: true,
    lastBackupDate: "2026-02-16",
    lastMaintenanceDate: "2026-02-05",
    reportedIncidents: "Alerta de CPU alta el 2025-12-11",
    relevantChanges: "Actualización de kernel y reglas de firewall",
    decommissionDate: "",
    decommissionReason: "",
  },
];

const INVENTORY_STORAGE_KEY = "guardyscan_inventory_equipment_v1";

function loadInventoryRecords(): EquipmentRecord[] {
  if (typeof window === "undefined") return initialInventory;
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!raw) return initialInventory;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as EquipmentRecord[];
    return initialInventory;
  } catch {
    return initialInventory;
  }
}

function EquipmentIcon({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    "Servidor": <Server className="h-5 w-5 text-indigo-500" />,
    "Router": <Wifi className="h-5 w-5 text-purple-500" />,
    "Switch": <Wifi className="h-5 w-5 text-blue-400" />,
    "Celular": <Smartphone className="h-5 w-5 text-cyan-500" />,
    "Tablet": <Smartphone className="h-5 w-5 text-teal-500" />,
    "Impresora": <Printer className="h-5 w-5 text-gray-400" />,
    "PC escritorio": <Monitor className="h-5 w-5 text-blue-400" />,
  };
  return <>{map[type] ?? <Laptop className="h-5 w-5 text-blue-500" />}</>;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<EquipmentRecord[]>(() => loadInventoryRecords());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterCriticality, setFilterCriticality] = useState("TODOS");
  const [showDetail, setShowDetail] = useState<EquipmentRecord | null>(null);

  const filtered = useMemo(() => {
    return inventory.filter(item => {
      if (filterStatus !== "TODOS" && item.status !== filterStatus) return false;
      if (filterCriticality !== "TODOS" && item.criticality !== filterCriticality) return false;
      const q = search.toLowerCase();
      return (
        !q ||
        item.assetCode.toLowerCase().includes(q) ||
        item.equipmentType.toLowerCase().includes(q) ||
        item.assignedUser.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q)
      );
    });
  }, [inventory, search, filterStatus, filterCriticality]);

  const stats = useMemo(() => ({
    total: inventory.length,
    active: inventory.filter(i => i.status === "OPERATIVO").length,
    critical: inventory.filter(i => i.criticality === "ALTA").length,
    sensitive: inventory.filter(i => i.hasSensitiveInformation).length,
  }), [inventory]);

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este equipo del inventario?")) return;
    setInventory(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (showDetail?.id === id) setShowDetail(null);
  };

  const getCriticalityConfig = (criticality: Criticality) => {
    const map = {
      ALTA: { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
      MEDIA: { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
      BAJA: { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    };
    return map[criticality];
  };

  const boolLabel = (value: boolean) => (value ? "Sí" : "No");

  return (
    <div className="space-y-5">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Laptop className="h-8 w-8 text-blue-500" />
          Inventario de Activos TI
        </h1>
        <Link href="/dashboard/inventory/new">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Registrar equipo
          </button>
        </Link>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "TOTAL ACTIVOS", value: stats.total, icon: ClipboardList, bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", iconColor: "text-blue-400" },
          { label: "OPERATIVOS", value: stats.active, icon: ShieldCheck, bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", iconColor: "text-emerald-400" },
          { label: "CRITICIDAD ALTA", value: stats.critical, icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800", text: "text-red-700 dark:text-red-300", iconColor: "text-red-400" },
          { label: "DATOS SENSIBLES", value: stats.sensitive, icon: Lock, bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", iconColor: "text-purple-400" },
        ].map(({ label, value, icon: Icon, bg, text, iconColor }) => (
          <div key={label} className={`rounded-xl p-3.5 border ${bg} flex items-center justify-between`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${text} opacity-70`}>{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${text}`}>{value}</p>
            </div>
            <Icon className={`h-5 w-5 ${iconColor} opacity-60`} />
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por código, marca, modelo, responsable..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="OPERATIVO">Operativo</option>
          <option value="EN_REPARACION">En reparación</option>
          <option value="DADO_DE_BAJA">Dado de baja</option>
          <option value="OBSOLETO">Obsoleto</option>
        </select>
        <select
          value={filterCriticality}
          onChange={e => setFilterCriticality(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="TODOS">Toda criticidad</option>
          <option value="ALTA">Criticidad Alta</option>
          <option value="MEDIA">Criticidad Media</option>
          <option value="BAJA">Criticidad Baja</option>
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {filtered.length} equipo{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── LIST ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Laptop className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron equipos con los filtros aplicados.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(item => {
              const secScore = [item.antivirusInstalled, item.firewallActive, item.diskEncryption, item.backupConfigured].filter(Boolean).length;
              const secPct = Math.round((secScore / 4) * 100);
              const critCfg = getCriticalityConfig(item.criticality);
              return (
                <li key={item.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex items-center gap-4">
                  {/* Icon square */}
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <EquipmentIcon type={item.equipmentType} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {item.assetCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === "OPERATIVO" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        item.status === "EN_REPARACION" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>{statusLabels[item.status]}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${critCfg.badge}`}>
                        {criticalityLabels[item.criticality]}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {item.equipmentType} · {item.brand} {item.model}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {item.assignedUser && (
                        <span className="text-xs text-gray-500">👤 {item.assignedUser}</span>
                      )}
                      {item.department && (
                        <span className="text-xs text-gray-400">{item.department}</span>
                      )}
                      <div className="flex items-center gap-1">
                        {item.antivirusInstalled && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">AV</span>
                        )}
                        {item.firewallActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">FW</span>
                        )}
                        {item.diskEncryption && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">ENC</span>
                        )}
                        {item.hasSensitiveInformation && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">SENS</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Security ring */}
                  <div className="flex-shrink-0 relative w-10 h-10">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={secPct >= 75 ? "#10b981" : secPct >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="3"
                        strokeDasharray={`${secPct} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300" style={{ transform: "rotate(90deg)" }}>
                      {secPct}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setShowDetail(item)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link href={`/dashboard/inventory/${encodeURIComponent(item.id)}/edit`}>
                      <button
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-400 hover:text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowDetail(null); }}
        >
          <div className="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Sticky header */}
            <div className="sticky top-0 bg-blue-600 z-10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <HardDrive className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{showDetail.assetCode}</h2>
                  <p className="text-blue-100 text-xs">
                    {showDetail.equipmentType} · {showDetail.brand} {showDetail.model}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(null)}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  showDetail.status === "OPERATIVO" ? "bg-emerald-100 text-emerald-700" :
                  showDetail.status === "EN_REPARACION" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>{statusLabels[showDetail.status]}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCriticalityConfig(showDetail.criticality).badge}`}>
                  Criticidad {criticalityLabels[showDetail.criticality]}
                </span>
                {showDetail.hasSensitiveInformation && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Contiene datos sensibles
                  </span>
                )}
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Technical */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Información Técnica</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ["N° Serie", showDetail.serialNumber || "—"],
                    ["S.O.", `${showDetail.operatingSystem} ${showDetail.operatingSystemVersion}`.trim() || "—"],
                    ["Procesador", showDetail.processor || "—"],
                    ["RAM", showDetail.ram || "—"],
                    ["Disco", showDetail.storage || "—"],
                    ["IP", showDetail.assignedIp || "—"],
                    ["MAC", showDetail.macAddress || "—"],
                    ["Dominio", showDetail.domainOrWorkgroup || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Location */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ubicación y Responsable</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ["Ubicación", showDetail.physicalLocation || "—"],
                    ["Dirección", showDetail.exactAddress || "—"],
                    ["Área", showDetail.department || "—"],
                    ["Usuario asignado", showDetail.assignedUser || "—"],
                    ["Cargo", showDetail.userRole || "—"],
                    ["Correo corporativo", showDetail.corporateEmail || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Security */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Seguridad y Cumplimiento</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {([
                    ["Antivirus", showDetail.antivirusInstalled, showDetail.antivirusName ? ` (${showDetail.antivirusName})` : ""],
                    ["Firewall activo", showDetail.firewallActive, ""],
                    ["Cifrado de disco", showDetail.diskEncryption, ""],
                    ["Respaldo configurado", showDetail.backupConfigured, showDetail.lastBackupDate ? ` (${showDetail.lastBackupDate})` : ""],
                  ] as [string, boolean, string][]).map(([label, ok, extra]) => (
                    <div key={label} className={`p-3 rounded-xl flex items-center gap-2 ${
                      ok
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900"
                    }`}>
                      <span className={`text-xs font-medium ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}>
                        {label}: {boolLabel(ok)}{extra}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Último parche", showDetail.lastPatchUpdate || "—"],
                    ["Última revisión seg.", showDetail.lastSecurityReview || "—"],
                    ["Info sensible", boolLabel(showDetail.hasSensitiveInformation)],
                    ["Tipo de info", showDetail.sensitiveInformationType || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Administrative */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Datos Administrativos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ["Proveedor", showDetail.supplier || "—"],
                    ["Costo equipo", showDetail.equipmentCost ? `$${showDetail.equipmentCost.toLocaleString("es-CL")}` : "—"],
                    ["Garantía hasta", showDetail.warrantyUntil || "—"],
                    ["Contrato soporte", boolLabel(showDetail.supportContract)],
                    ["Fecha de compra", showDetail.purchaseDate || "—"],
                    ["Documento compra", showDetail.purchaseDocument || "—"],
                    ["Ú. mantención", showDetail.lastMaintenanceDate || "—"],
                    ["Fecha de baja", showDetail.decommissionDate || "—"],
                    ["Motivo de baja", showDetail.decommissionReason || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident / changes history */}
              {(showDetail.reportedIncidents || showDetail.relevantChanges) && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {showDetail.reportedIncidents && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Incidentes reportados</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{showDetail.reportedIncidents}</p>
                      </div>
                    )}
                    {showDetail.relevantChanges && (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Cambios relevantes</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{showDetail.relevantChanges}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/dashboard/inventory/${encodeURIComponent(showDetail.id)}/edit`} className="flex-1 min-w-[120px]">
                  <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <Edit className="h-4 w-4" /> Editar
                  </button>
                </Link>
                <button
                  onClick={() => setShowDetail(null)}
                  className="flex-1 min-w-[120px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
