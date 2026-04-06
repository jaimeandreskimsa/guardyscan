"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

type ContractType = "PLANTA" | "CONTRATA" | "HONORARIOS" | "EXTERNO";
type AccessLevel = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
type SystemRole = "USUARIO" | "ADMINISTRADOR" | "SOPORTE" | "AUDITOR" | "OTRO";
type AssignedAsset = { id: string; assetName: string; inventoryCode: string; deliveryDate: string; returnDate: string };

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
  systemsAccess: { id: string; systemName: string; accessType: string; assignedAt: string; revokedAt: string }[];
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

const empty: Omit<WorkerRecord, "id"> = {
  fullName: "", rut: "", position: "", department: "",
  contractType: "PLANTA", startDate: "", endDate: "",
  institutionalEmail: "", corporatePhone: "",
  systemRole: "USUARIO", accessLevel: "BAJO",
  hasPersonalDataAccess: false, hasCriticalInfrastructureAccess: false, hasRemoteAccess: false,
  systemsAccess: [],
  hasNdaSigned: false, hasCyberTraining: false, knowsIncidentProtocol: false,
  knowsAcceptableUsePolicy: false, knowsAccessControlPolicy: false,
  lastTrainingDate: "",
  assignedAssets: [{ id: "aa-1", assetName: "", inventoryCode: "", deliveryDate: "", returnDate: "" }],
  supervisorName: "", securityOfficer: "", workerSignature: "", itResponsibleSignature: "",
  registrationDate: new Date().toISOString().slice(0, 10),
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const selectCls = `${inputCls} cursor-pointer`;

export default function NewWorkerPage() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.rut || !form.position) {
      alert("Completa al menos nombre, RUT y cargo.");
      return;
    }
    setSaving(true);
    try {
      const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const id = crypto?.randomUUID?.() ?? `${Date.now()}`;
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify([{ id, ...form }, ...(Array.isArray(current) ? current : [])]));
      router.push("/dashboard/workers");
    } catch {
      alert("No se pudo guardar el trabajador.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            Registrar trabajador
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Ficha de cumplimiento Ley 21.663</p>
        </div>
        <Link href="/dashboard/workers">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── 1. DATOS PERSONALES ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            1 · Datos del trabajador
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" required>
              <input className={inputCls} placeholder="Ej. Ana Torres Silva" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
            </Field>
            <Field label="RUT" required>
              <input className={inputCls} placeholder="Ej. 12.345.678-9" value={form.rut} onChange={e => set("rut", e.target.value)} />
            </Field>
            <Field label="Cargo" required>
              <input className={inputCls} placeholder="Ej. Analista de Seguridad" value={form.position} onChange={e => set("position", e.target.value)} />
            </Field>
            <Field label="Área / Departamento">
              <input className={inputCls} placeholder="Ej. TI, RRHH, Finanzas" value={form.department} onChange={e => set("department", e.target.value)} />
            </Field>
            <Field label="Correo institucional">
              <input className={inputCls} type="email" placeholder="nombre@empresa.cl" value={form.institutionalEmail} onChange={e => set("institutionalEmail", e.target.value)} />
            </Field>
            <Field label="Teléfono corporativo">
              <input className={inputCls} placeholder="+56 9 ..." value={form.corporatePhone} onChange={e => set("corporatePhone", e.target.value)} />
            </Field>
          </div>
        </section>

        {/* ── 2. CONTRATO ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            2 · Contrato y supervisor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de contrato">
              <select className={selectCls} value={form.contractType} onChange={e => set("contractType", e.target.value as ContractType)}>
                <option value="PLANTA">Planta</option>
                <option value="CONTRATA">Contrata</option>
                <option value="HONORARIOS">Honorarios</option>
                <option value="EXTERNO">Externo / Proveedor</option>
              </select>
            </Field>
            <Field label="Supervisor directo">
              <input className={inputCls} placeholder="Nombre del supervisor" value={form.supervisorName} onChange={e => set("supervisorName", e.target.value)} />
            </Field>
            <Field label="Fecha de inicio del contrato">
              <input className={inputCls} type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
            </Field>
            <Field label="Fecha de término del contrato (dejar vacío si es indefinido)">
              <input className={inputCls} type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
            </Field>
          </div>
        </section>

        {/* ── 3. ACCESO ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            3 · Acceso a sistemas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rol en el sistema">
              <select className={selectCls} value={form.systemRole} onChange={e => set("systemRole", e.target.value as SystemRole)}>
                <option value="USUARIO">Usuario</option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="SOPORTE">Soporte TI</option>
                <option value="AUDITOR">Auditor</option>
                <option value="OTRO">Otro</option>
              </select>
            </Field>
            <Field label="Nivel de acceso">
              <select className={selectCls} value={form.accessLevel} onChange={e => set("accessLevel", e.target.value as AccessLevel)}>
                <option value="BAJO">Bajo — acceso básico a herramientas de oficina</option>
                <option value="MEDIO">Medio — acceso a sistemas internos</option>
                <option value="ALTO">Alto — acceso a datos sensibles o críticos</option>
                <option value="CRITICO">Crítico — acceso de administrador o infraestructura</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {([
              ["hasPersonalDataAccess", "Accede a datos personales"],
              ["hasCriticalInfrastructureAccess", "Accede a infraestructura crítica"],
              ["hasRemoteAccess", "Tiene acceso remoto"],
            ] as [keyof typeof empty, string][]).map(([key, label]) => (
              <label key={key} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                form[key]
                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
              }`}>
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={e => set(key, e.target.checked)}
                  className="accent-indigo-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* ── 4. CUMPLIMIENTO ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            4 · Cumplimiento en ciberseguridad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              ["hasNdaSigned", "Firmó acuerdo de confidencialidad (NDA)"],
              ["hasCyberTraining", "Recibió capacitación en ciberseguridad"],
              ["knowsIncidentProtocol", "Conoce el protocolo de incidentes"],
              ["knowsAcceptableUsePolicy", "Conoce la política de uso aceptable"],
              ["knowsAccessControlPolicy", "Conoce la política de control de accesos"],
            ] as [keyof typeof empty, string][]).map(([key, label]) => (
              <label key={key} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                form[key]
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
              }`}>
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={e => set(key, e.target.checked)}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          <Field label="Fecha de la última capacitación en ciberseguridad">
            <input className={inputCls} type="date" value={form.lastTrainingDate} onChange={e => set("lastTrainingDate", e.target.value)} />
          </Field>
        </section>

        {/* ── 5. ACTIVOS ASIGNADOS ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              5 · Activos asignados
            </h2>
            <button
              type="button"
              onClick={() => set("assignedAssets", [...form.assignedAssets, { id: `${Date.now()}`, assetName: "", inventoryCode: "", deliveryDate: "", returnDate: "" }])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar activo
            </button>
          </div>
          <div className="space-y-3">
            {form.assignedAssets.map((row, i) => (
              <div key={row.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Field label="Nombre del activo / equipo">
                  <input className={inputCls} placeholder="Ej. Notebook ThinkPad T14" value={row.assetName} onChange={e => set("assignedAssets", form.assignedAssets.map(x => x.id === row.id ? { ...x, assetName: e.target.value } : x))} />
                </Field>
                <Field label="Código de inventario">
                  <input className={inputCls} placeholder="Ej. KIMSA-NTB-001" value={row.inventoryCode} onChange={e => set("assignedAssets", form.assignedAssets.map(x => x.id === row.id ? { ...x, inventoryCode: e.target.value } : x))} />
                </Field>
                <div className="flex items-end justify-end">
                  {form.assignedAssets.length > 1 && (
                    <button type="button" onClick={() => set("assignedAssets", form.assignedAssets.filter(x => x.id !== row.id))} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Field label="Fecha de entrega del activo">
                  <input className={inputCls} type="date" value={row.deliveryDate} onChange={e => set("assignedAssets", form.assignedAssets.map(x => x.id === row.id ? { ...x, deliveryDate: e.target.value } : x))} />
                </Field>
                <Field label="Fecha de devolución (dejar vacío si no aplica)">
                  <input className={inputCls} type="date" value={row.returnDate} onChange={e => set("assignedAssets", form.assignedAssets.map(x => x.id === row.id ? { ...x, returnDate: e.target.value } : x))} />
                </Field>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/dashboard/workers">
            <button type="button" className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar trabajador"}
          </button>
        </div>
      </form>
    </div>
  );
}
