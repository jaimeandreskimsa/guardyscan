"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Search, Users, ShieldAlert, Wifi, GraduationCap, User, Phone, Mail, Calendar, Shield, Building2, Laptop, CheckCircle2, XCircle } from "lucide-react";

type ContractType = "PLANTA" | "CONTRATA" | "HONORARIOS" | "EXTERNO";
type AccessLevel = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
type SystemRole = "USUARIO" | "ADMINISTRADOR" | "SOPORTE" | "AUDITOR" | "OTRO";

type SystemAccess = {
  id: string;
  systemName: string;
  accessType: string;
  assignedAt: string;
  revokedAt: string;
};

type AssignedAsset = {
  id: string;
  assetName: string;
  inventoryCode: string;
  deliveryDate: string;
  returnDate: string;
};

type WorkerRecord = {
  id: string;
  fullName: string;
  rut: string;
  position: string;
  department: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  institutionalEmail: string;
  corporatePhone: string;

  systemRole: SystemRole;
  accessLevel: AccessLevel;
  hasPersonalDataAccess: boolean;
  hasCriticalInfrastructureAccess: boolean;
  hasRemoteAccess: boolean;

  systemsAccess: SystemAccess[];

  hasNdaSigned: boolean;
  hasCyberTraining: boolean;
  knowsIncidentProtocol: boolean;
  knowsAcceptableUsePolicy: boolean;
  knowsAccessControlPolicy: boolean;
  lastTrainingDate: string;

  assignedAssets: AssignedAsset[];

  supervisorName: string;
  securityOfficer: string;
  workerSignature: string;
  itResponsibleSignature: string;
  registrationDate: string;
};

const WORKERS_STORAGE_KEY = "guardyscan_workers_registry_v1";

const initialWorkers: WorkerRecord[] = [
  {
    id: "W-001",
    fullName: "Ana Torres Silva",
    rut: "17.234.567-8",
    position: "Analista de Seguridad",
    department: "TI",
    contractType: "PLANTA",
    startDate: "2024-03-01",
    endDate: "",
    institutionalEmail: "ana.torres@empresa.cl",
    corporatePhone: "+56 9 1234 5678",
    systemRole: "ADMINISTRADOR",
    accessLevel: "CRITICO",
    hasPersonalDataAccess: true,
    hasCriticalInfrastructureAccess: true,
    hasRemoteAccess: true,
    systemsAccess: [
      { id: "sa-1", systemName: "AD Corporativo", accessType: "Admin", assignedAt: "2024-03-02", revokedAt: "" },
      { id: "sa-2", systemName: "SIEM", accessType: "Analista", assignedAt: "2024-03-05", revokedAt: "" },
    ],
    hasNdaSigned: true,
    hasCyberTraining: true,
    knowsIncidentProtocol: true,
    knowsAcceptableUsePolicy: true,
    knowsAccessControlPolicy: true,
    lastTrainingDate: "2026-01-20",
    assignedAssets: [
      { id: "aa-1", assetName: "Laptop", inventoryCode: "KIMSA-NTB-001", deliveryDate: "2024-03-01", returnDate: "" },
      { id: "aa-2", assetName: "Token / MFA", inventoryCode: "MFA-0091", deliveryDate: "2024-03-01", returnDate: "" },
    ],
    supervisorName: "Carlos Méndez",
    securityOfficer: "CISO - María Díaz",
    workerSignature: "Ana Torres",
    itResponsibleSignature: "Carlos Méndez",
    registrationDate: "2026-02-17",
  },
];

function loadWorkers(): WorkerRecord[] {
  if (typeof window === "undefined") return initialWorkers;
  const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
  if (!raw) return initialWorkers;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as WorkerRecord[];
    return initialWorkers;
  } catch {
    return initialWorkers;
  }
}

export default function WorkersPage() {
  const [workers] = useState<WorkerRecord[]>(() => loadWorkers());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<WorkerRecord | null>(workers[0] ?? null);

  const filteredWorkers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return workers.filter((w) =>
      w.fullName.toLowerCase().includes(query) ||
      w.rut.toLowerCase().includes(query) ||
      w.position.toLowerCase().includes(query) ||
      w.department.toLowerCase().includes(query)
    );
  }, [workers, searchTerm]);

  const stats = useMemo(() => ({
    total: workers.length,
    critical: workers.filter((w) => w.accessLevel === "CRITICO").length,
    remote: workers.filter((w) => w.hasRemoteAccess).length,
    trained: workers.filter((w) => w.hasCyberTraining).length,
  }), [workers]);

  const accessLevelConfig: Record<AccessLevel, { label: string; badge: string }> = {
    BAJO:   { label: 'Bajo',    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    MEDIO:  { label: 'Medio',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ALTO:   { label: 'Alto',    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    CRITICO:{ label: 'Crítico', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  function initials(name: string) {
    return name.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Registro de Trabajadores
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-14">
            Control de accesos, auditorías y cumplimiento Ley&nbsp;21.663.
          </p>
        </div>
        <Link href="/dashboard/workers/new">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" /> Registrar trabajador
          </button>
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total trabajadores',  value: stats.total,    icon: Users,          from: 'from-indigo-500', to: 'to-purple-500',  text: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Acceso crítico',      value: stats.critical,  icon: ShieldAlert,    from: 'from-red-500',    to: 'to-rose-500',    text: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Acceso remoto',        value: stats.remote,    icon: Wifi,           from: 'from-purple-500', to: 'to-violet-500',  text: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Capacitados',          value: stats.trained,   icon: GraduationCap,  from: 'from-emerald-500',to: 'to-green-500',   text: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, from, to, text, bg }) => (
          <div key={label} className={`rounded-2xl ${bg} border border-white/60 dark:border-gray-700 p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${from} ${to} shadow-sm`}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <p className={`text-3xl font-black ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── WORKERS TABLE ── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">Trabajadores registrados</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">{filteredWorkers.length}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
              placeholder="Buscar trabajador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                {['Nombre', 'RUT', 'Cargo', 'Área', 'Rol', 'Acceso'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredWorkers.map((worker) => (
                <tr
                  key={worker.id}
                  className={`hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer transition-colors ${
                    selectedWorker?.id === worker.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials(worker.fullName)}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{worker.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{worker.rut}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{worker.position}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Building2 className="h-3 w-3" />
                      <span>{worker.department}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">{worker.systemRole}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${accessLevelConfig[worker.accessLevel].badge}`}>
                      {accessLevelConfig[worker.accessLevel].label}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No se encontraron trabajadores.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAIL PANEL ── */}
      {selectedWorker && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-xl font-black">
                {initials(selectedWorker.fullName)}
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{selectedWorker.fullName}</h2>
                <p className="text-indigo-100 text-sm">{selectedWorker.position} · {selectedWorker.department}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">{selectedWorker.contractType}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedWorker.accessLevel === 'CRITICO' ? 'bg-red-500 text-white' :
                    selectedWorker.accessLevel === 'ALTO' ? 'bg-orange-400 text-white' :
                    'bg-white/20 text-white'
                  }`}>{accessLevelConfig[selectedWorker.accessLevel].label}</span>
                </div>
              </div>
            </div>
            <Link href={`/dashboard/workers/${encodeURIComponent(selectedWorker.id)}/edit`}>
              <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all">
                Editar
              </button>
            </Link>
          </div>

          <div className="p-5 space-y-5">
            {/* Info rows */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                [Mail, 'Correo', selectedWorker.institutionalEmail || '—'],
                [Phone, 'Teléfono', selectedWorker.corporatePhone || '—'],
                [Calendar, 'Ingreso', selectedWorker.startDate || '—'],
                [Calendar, 'Término', selectedWorker.endDate || 'Indefinido'],
                [Shield, 'Rol sistema', selectedWorker.systemRole],
                [User, 'Supervisor', selectedWorker.supervisorName || '—'],
              ].map(([Icon, label, value]) => (
                <div key={String(label)} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                  <p className="text-xs text-gray-400 mb-0.5">{String(label)}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{String(value)}</p>
                </div>
              ))}
            </div>

            {/* Accesos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Accesos y Privilegios</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['Datos personales', selectedWorker.hasPersonalDataAccess],
                  ['Infraestructura crítica', selectedWorker.hasCriticalInfrastructureAccess],
                  ['Acceso remoto', selectedWorker.hasRemoteAccess],
                ] as [string, boolean][]).map(([label, active]) => (
                  <div key={label} className={`p-3 rounded-xl flex items-center gap-2 ${
                    active ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-800/60'
                  }`}>
                    {active
                      ? <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                      : <XCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    }
                    <span className={`text-xs font-medium ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ciberseguridad */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cumplimiento en Ciberseguridad</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {([
                  ['Acuerdo de confidencialidad', selectedWorker.hasNdaSigned],
                  ['Capacitación ciberseguridad', selectedWorker.hasCyberTraining],
                  ['Protocolo de incidentes', selectedWorker.knowsIncidentProtocol],
                  ['Política uso aceptable', selectedWorker.knowsAcceptableUsePolicy],
                  ['Control de accesos', selectedWorker.knowsAccessControlPolicy],
                ] as [string, boolean][]).map(([label, ok]) => (
                  <div key={label} className={`p-3 rounded-xl flex items-center gap-2 ${
                    ok ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900'
                  }`}>
                    {ok
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    }
                    <span className={`text-xs font-medium ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
              {selectedWorker.lastTrainingDate && (
                <p className="mt-2 text-xs text-gray-400">Última capacitación: <span className="font-semibold text-gray-600 dark:text-gray-300">{selectedWorker.lastTrainingDate}</span></p>
              )}
            </div>

            {/* Activos asignados */}
            {selectedWorker.assignedAssets?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Laptop className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Activos Asignados</h3>
                </div>
                <div className="space-y-2">
                  {selectedWorker.assignedAssets.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{a.assetName}</p>
                        <p className="text-xs text-blue-500 font-mono">{a.inventoryCode}</p>
                      </div>
                      <span className="text-xs text-blue-400">Desde {a.deliveryDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Firma y control */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              {[
                ['Oficial de seguridad', selectedWorker.securityOfficer],
                ['Firma trabajador', selectedWorker.workerSignature],
                ['Resp. TI', selectedWorker.itResponsibleSignature],
                ['Fecha registro', selectedWorker.registrationDate],
              ].map(([label, value]) => value ? (
                <div key={label} className="text-xs">
                  <span className="text-gray-400">{label}:</span>{' '}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      )}
    </div>
  );}