"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users, Plus, Search, ShieldAlert, Wifi, GraduationCap,
  Building2, Laptop, CheckCircle2, XCircle, Eye, Edit, Trash2, X,
  Shield, UserCheck,
} from "lucide-react";

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

const ACCESS_LEVEL_CONFIG: Record<AccessLevel, { label: string; color: string }> = {
  BAJO:    { label: 'Bajo',    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  MEDIO:   { label: 'Medio',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ALTO:    { label: 'Alto',    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  CRITICO: { label: 'Crítico', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerRecord[]>(() => loadWorkers())
  const [search, setSearch] = useState('')
  const [filterAccessLevel, setFilterAccessLevel] = useState('ALL')
  const [showDetail, setShowDetail] = useState<WorkerRecord | null>(null)

  const filtered = useMemo(() => workers.filter(w =>
    (filterAccessLevel === 'ALL' || w.accessLevel === filterAccessLevel) &&
    (w.fullName.toLowerCase().includes(search.toLowerCase()) ||
     w.rut.toLowerCase().includes(search.toLowerCase()) ||
     w.position.toLowerCase().includes(search.toLowerCase()) ||
     w.department.toLowerCase().includes(search.toLowerCase()))
  ), [workers, search, filterAccessLevel])

  const stats = useMemo(() => ({
    total: workers.length,
    critical: workers.filter(w => w.accessLevel === 'CRITICO').length,
    remote: workers.filter(w => w.hasRemoteAccess).length,
    trained: workers.filter(w => w.hasCyberTraining).length,
  }), [workers])

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este trabajador del registro?')) return
    setWorkers(prev => prev.filter(w => w.id !== id))
    if (showDetail?.id === id) setShowDetail(null)
  }

  return (
    <div className="space-y-6">

      {/* ════ HEADER ════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-500" />
            Registro de Trabajadores
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Control de accesos, auditorías y cumplimiento Ley 21.663
          </p>
        </div>
        <Link href="/dashboard/workers/new">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" /> Registrar trabajador
          </button>
        </Link>
      </div>

      {/* ════ STATS ════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Acceso Crítico', value: stats.critical, icon: ShieldAlert, color: stats.critical > 0 ? 'text-red-600' : 'text-green-600', bg: stats.critical > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Acceso Remoto', value: stats.remote, icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Capacitados', value: stats.trained, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</p>
              </div>
              <s.icon className={`h-5 w-5 ${s.color} opacity-70`} />
            </div>
          </div>
        ))}
      </div>

      {/* ════ FILTERS ════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar trabajadores..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={filterAccessLevel} onChange={e => setFilterAccessLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500">
            <option value="ALL">Todos los niveles</option>
            <option value="CRITICO">Crítico</option>
            <option value="ALTO">Alto</option>
            <option value="MEDIO">Medio</option>
            <option value="BAJO">Bajo</option>
          </select>
          <span className="text-xs text-gray-500 whitespace-nowrap">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ════ LIST ════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Trabajadores registrados</h3>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} trabajador{filtered.length !== 1 ? 'es' : ''} registrado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-1">No hay trabajadores</h3>
            <p className="text-gray-500 text-sm mb-4">
              {search || filterAccessLevel !== 'ALL' ? 'Ajusta los filtros para ver resultados' : 'Registra tu primer trabajador'}
            </p>
            <Link href="/dashboard/workers/new">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                <Plus className="h-4 w-4" />Agregar
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(worker => {
              const alCfg = ACCESS_LEVEL_CONFIG[worker.accessLevel]
              const complianceScore = [
                worker.hasNdaSigned, worker.hasCyberTraining, worker.knowsIncidentProtocol,
                worker.knowsAcceptableUsePolicy, worker.knowsAccessControlPolicy,
              ].filter(Boolean).length
              return (
                <div key={worker.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials(worker.fullName)}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{worker.fullName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${alCfg.color}`}>{alCfg.label}</span>
                        {worker.hasPersonalDataAccess && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Datos pers.</span>
                        )}
                        {worker.hasCriticalInfrastructureAccess && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Infraestructura</span>
                        )}
                        {worker.hasRemoteAccess && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-0.5">
                            <Wifi className="h-2.5 w-2.5" />Remoto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        {worker.position} · {worker.department} · {worker.systemRole}
                        {worker.institutionalEmail && ` · ${worker.institutionalEmail}`}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          complianceScore === 5 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                          complianceScore >= 3 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          <UserCheck className="h-2.5 w-2.5" />Cumplimiento {complianceScore}/5
                        </span>
                        {worker.lastTrainingDate && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            Cap. {worker.lastTrainingDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Compliance ring */}
                    <div className="hidden md:flex items-center flex-shrink-0">
                      <div className="text-center w-12">
                        <div className="relative w-10 h-10 mx-auto">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none" strokeWidth="3"
                              strokeDasharray={`${complianceScore * 20}, 100`}
                              className={complianceScore === 5 ? 'stroke-green-500' : complianceScore >= 3 ? 'stroke-yellow-500' : 'stroke-red-500'} />
                          </svg>
                          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                            complianceScore === 5 ? 'text-green-600' : complianceScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{complianceScore}/5</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Cumplim.</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setShowDetail(worker)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href={`/dashboard/workers/${encodeURIComponent(worker.id)}/edit`}>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(worker.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ════ DETAIL MODAL ════ */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowDetail(null) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full shadow-2xl mb-8">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                    {initials(showDetail.fullName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ACCESS_LEVEL_CONFIG[showDetail.accessLevel].color}`}>
                        {ACCESS_LEVEL_CONFIG[showDetail.accessLevel].label}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {showDetail.contractType}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{showDetail.fullName}</h2>
                    <p className="text-xs text-gray-500">{showDetail.position} · {showDetail.department}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-7 py-6 space-y-6">
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Información Personal</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">RUT:</span> {showDetail.rut || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Correo:</span> {showDetail.institutionalEmail || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Teléfono:</span> {showDetail.corporatePhone || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Ingreso:</span> {showDetail.startDate || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Término:</span> {showDetail.endDate || 'Indefinido'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Rol sistema:</span> {showDetail.systemRole}</p>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Accesos y Privilegios</h4>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    ['Datos personales', showDetail.hasPersonalDataAccess],
                    ['Infraestructura crítica', showDetail.hasCriticalInfrastructureAccess],
                    ['Acceso remoto', showDetail.hasRemoteAccess],
                  ] as [string, boolean][]).map(([label, active]) => (
                    <div key={label} className={`p-3 rounded-xl border ${active ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
                      <div className="flex items-center gap-2">
                        {active ? <CheckCircle2 className="h-4 w-4 text-orange-500 flex-shrink-0" /> : <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                        <div>
                          <p className="text-xs font-semibold">{label}</p>
                          <p className={`text-xs ${active ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>{active ? '✓ Sí' : '✗ No'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />Cumplimiento en Ciberseguridad
                </h4>
                <div className="flex flex-wrap gap-2">
                  {([
                    ['Acuerdo de confidencialidad', showDetail.hasNdaSigned],
                    ['Capacitación ciberseguridad', showDetail.hasCyberTraining],
                    ['Protocolo de incidentes', showDetail.knowsIncidentProtocol],
                    ['Política uso aceptable', showDetail.knowsAcceptableUsePolicy],
                    ['Control de accesos', showDetail.knowsAccessControlPolicy],
                  ] as [string, boolean][]).map(([label, ok]) => (
                    <span key={label} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                      ok ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{label}
                    </span>
                  ))}
                </div>
                {showDetail.lastTrainingDate && (
                  <p className="mt-2 text-xs text-gray-500">Última capacitación: <span className="font-semibold text-gray-700 dark:text-gray-300">{showDetail.lastTrainingDate}</span></p>
                )}
              </section>

              {showDetail.assignedAssets?.length > 0 && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                      <Laptop className="h-3.5 w-3.5" />Activos Asignados
                    </h4>
                    <div className="space-y-2">
                      {showDetail.assignedAssets.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.assetName}</p>
                            <p className="text-xs font-mono text-blue-600">{a.inventoryCode}</p>
                          </div>
                          <span className="text-xs text-gray-400">Desde {a.deliveryDate}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {(showDetail.supervisorName || showDetail.securityOfficer) && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />Validación y Control
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {showDetail.supervisorName && <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Supervisor:</span> {showDetail.supervisorName}</p>}
                      {showDetail.securityOfficer && <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Oficial seguridad:</span> {showDetail.securityOfficer}</p>}
                      {showDetail.registrationDate && <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Fecha registro:</span> {showDetail.registrationDate}</p>}
                    </div>
                  </section>
                </>
              )}

              <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/dashboard/workers/${encodeURIComponent(showDetail.id)}/edit`} className="flex-1 min-w-[120px]">
                  <button className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <Edit className="h-4 w-4" />Editar
                  </button>
                </Link>
                <button onClick={() => setShowDetail(null)} className="flex-1 min-w-[120px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
