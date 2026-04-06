"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

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

const INVENTORY_STORAGE_KEY = "guardyscan_inventory_equipment_v1";

const empty: Omit<EquipmentRecord, "id"> = {
  assetCode: "", equipmentType: "Notebook", brand: "", model: "", serialNumber: "",
  physicalLabel: false, status: "OPERATIVO", criticality: "MEDIA",
  operatingSystem: "", operatingSystemVersion: "", processor: "", ram: "", storage: "",
  assignedIp: "", macAddress: "", domainOrWorkgroup: "",
  antivirusInstalled: false, antivirusName: "", firewallActive: true, diskEncryption: false,
  physicalLocation: "Oficina", exactAddress: "", department: "", assignedUser: "", userRole: "", corporateEmail: "",
  purchaseDate: "", supplier: "", purchaseDocument: "", equipmentCost: 0, warrantyUntil: "", supportContract: false,
  hasSensitiveInformation: false, sensitiveInformationType: "",
  lastPatchUpdate: "", lastSecurityReview: "", backupConfigured: false, lastBackupDate: "",
  lastMaintenanceDate: "", reportedIncidents: "", relevantChanges: "", decommissionDate: "", decommissionReason: "",
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

export default function NewInventoryEquipmentPage() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetCode || !form.brand || !form.model || !form.serialNumber) {
      alert("Completa al menos: código, marca, modelo y número de serie.");
      return;
    }
    setSaving(true);
    try {
      const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify([{ id, ...form }, ...(Array.isArray(current) ? current : [])]));
      router.push("/dashboard/inventory");
    } catch {
      alert("No se pudo guardar el equipo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar equipo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ficha de inventario de activos TI</p>
        </div>
        <Link href="/dashboard/inventory">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── 1. IDENTIFICACIÓN ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            1 · Identificación del equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Código interno del activo" required>
              <input className={inputCls} placeholder="Ej. KIMSA-NTB-001" value={form.assetCode} onChange={e => set("assetCode", e.target.value)} />
            </Field>
            <Field label="Tipo de equipo">
              <select className={selectCls} value={form.equipmentType} onChange={e => set("equipmentType", e.target.value)}>
                {["Notebook","PC escritorio","Servidor","Router","Switch","Firewall","Impresora","Celular","Tablet","Otro"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Marca" required>
              <input className={inputCls} placeholder="Ej. Lenovo, Dell, HP" value={form.brand} onChange={e => set("brand", e.target.value)} />
            </Field>
            <Field label="Modelo" required>
              <input className={inputCls} placeholder="Ej. ThinkPad T14, PowerEdge R450" value={form.model} onChange={e => set("model", e.target.value)} />
            </Field>
            <Field label="Número de serie" required>
              <input className={inputCls} placeholder="Número único del fabricante" value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} />
            </Field>
            <Field label="Estado actual">
              <select className={selectCls} value={form.status} onChange={e => set("status", e.target.value as EquipmentStatus)}>
                <option value="OPERATIVO">Operativo — en uso normal</option>
                <option value="EN_REPARACION">En reparación — fuera de servicio temporalmente</option>
                <option value="DADO_DE_BAJA">Dado de baja — retirado definitivamente</option>
                <option value="OBSOLETO">Obsoleto — sin soporte del fabricante</option>
              </select>
            </Field>
            <Field label="Criticidad para la organización">
              <select className={selectCls} value={form.criticality} onChange={e => set("criticality", e.target.value as Criticality)}>
                <option value="ALTA">Alta — impacto grave si falla o es comprometido</option>
                <option value="MEDIA">Media — impacto moderado, afecta operaciones parcialmente</option>
                <option value="BAJA">Baja — impacto mínimo, fácilmente reemplazable</option>
              </select>
            </Field>
          </div>
        </section>

        {/* ── 2. TÉCNICO ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            2 · Información técnica
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Sistema operativo">
              <input className={inputCls} placeholder="Ej. Windows, Ubuntu Server, macOS" value={form.operatingSystem} onChange={e => set("operatingSystem", e.target.value)} />
            </Field>
            <Field label="Versión del sistema operativo">
              <input className={inputCls} placeholder="Ej. Windows 11 Pro 23H2, 22.04 LTS" value={form.operatingSystemVersion} onChange={e => set("operatingSystemVersion", e.target.value)} />
            </Field>
            <Field label="IP asignada">
              <input className={inputCls} placeholder="Ej. 10.20.15.23" value={form.assignedIp} onChange={e => set("assignedIp", e.target.value)} />
            </Field>
            <Field label="Ubicación física">
              <select className={selectCls} value={form.physicalLocation} onChange={e => set("physicalLocation", e.target.value)}>
                <option>Oficina</option>
                <option>Sucursal</option>
                <option>Remoto</option>
                <option>Data Center</option>
                <option>Bodega</option>
              </select>
            </Field>
          </div>
        </section>

        {/* ── 3. RESPONSABLE ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            3 · Responsable del equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Área / Departamento">
              <input className={inputCls} placeholder="Ej. TI, Infraestructura, Finanzas" value={form.department} onChange={e => set("department", e.target.value)} />
            </Field>
            <Field label="Usuario asignado">
              <input className={inputCls} placeholder="Nombre completo del responsable" value={form.assignedUser} onChange={e => set("assignedUser", e.target.value)} />
            </Field>
            <Field label="Cargo del usuario">
              <input className={inputCls} placeholder="Ej. Analista de Seguridad" value={form.userRole} onChange={e => set("userRole", e.target.value)} />
            </Field>
            <Field label="Correo corporativo del usuario">
              <input className={inputCls} type="email" placeholder="usuario@empresa.cl" value={form.corporateEmail} onChange={e => set("corporateEmail", e.target.value)} />
            </Field>
          </div>
        </section>

        {/* ── 4. COMPRA Y GARANTÍA ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            4 · Compra y garantía
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Proveedor o tienda donde se adquirió">
              <input className={inputCls} placeholder="Ej. TecnoChile SPA" value={form.supplier} onChange={e => set("supplier", e.target.value)} />
            </Field>
            <Field label="Número de factura o documento de compra">
              <input className={inputCls} placeholder="Ej. FAC-45871, OC-99817" value={form.purchaseDocument} onChange={e => set("purchaseDocument", e.target.value)} />
            </Field>
            <Field label="Fecha de compra del equipo">
              <input className={inputCls} type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} />
            </Field>
            <Field label="Fecha de vencimiento de la garantía">
              <input className={inputCls} type="date" value={form.warrantyUntil} onChange={e => set("warrantyUntil", e.target.value)} />
            </Field>
          </div>
        </section>

        {/* ── 5. SEGURIDAD ── */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            5 · Seguridad del equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              ["antivirusInstalled", "Tiene antivirus instalado"],
              ["firewallActive", "Firewall activo"],
              ["diskEncryption", "Disco cifrado (BitLocker, FileVault, LUKS, etc.)"],
              ["backupConfigured", "Respaldo automático configurado"],
              ["hasSensitiveInformation", "Contiene datos sensibles o personales"],
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
          {form.antivirusInstalled && (
            <Field label="Nombre del antivirus">
              <input className={inputCls} placeholder="Ej. Microsoft Defender, CrowdStrike, Kaspersky" value={form.antivirusName} onChange={e => set("antivirusName", e.target.value)} />
            </Field>
          )}
          {form.hasSensitiveInformation && (
            <Field label="Tipo de datos sensibles que contiene">
              <input className={inputCls} placeholder="Ej. Datos de clientes, información financiera, RRHH" value={form.sensitiveInformationType} onChange={e => set("sensitiveInformationType", e.target.value)} />
            </Field>
          )}
          <Field label="Fecha del último parche de seguridad aplicado">
            <input className={inputCls} type="date" value={form.lastPatchUpdate} onChange={e => set("lastPatchUpdate", e.target.value)} />
          </Field>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/dashboard/inventory">
            <button type="button" className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar equipo"}
          </button>
        </div>
      </form>
    </div>
  );
}
