"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

type ContractType = "PLANTA" | "CONTRATA" | "HONORARIOS" | "EXTERNO";
type AccessLevel = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
type SystemRole = "USUARIO" | "ADMINISTRADOR" | "SOPORTE" | "AUDITOR" | "OTRO";

type SystemAccess = { id: string; systemName: string; accessType: string; assignedAt: string; revokedAt: string };
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

const initialFormData: Omit<WorkerRecord, "id"> = {
  fullName: "",
  rut: "",
  position: "",
  department: "",
  contractType: "PLANTA",
  startDate: "",
  endDate: "",
  institutionalEmail: "",
  corporatePhone: "",
  systemRole: "USUARIO",
  accessLevel: "BAJO",
  hasPersonalDataAccess: false,
  hasCriticalInfrastructureAccess: false,
  hasRemoteAccess: false,
  systemsAccess: [{ id: "sa-1", systemName: "", accessType: "", assignedAt: "", revokedAt: "" }],
  hasNdaSigned: false,
  hasCyberTraining: false,
  knowsIncidentProtocol: false,
  knowsAcceptableUsePolicy: false,
  knowsAccessControlPolicy: false,
  lastTrainingDate: "",
  assignedAssets: [{ id: "aa-1", assetName: "", inventoryCode: "", deliveryDate: "", returnDate: "" }],
  supervisorName: "",
  securityOfficer: "",
  workerSignature: "",
  itResponsibleSignature: "",
  registrationDate: new Date().toISOString().slice(0, 10),
};

export default function NewWorkerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof Omit<WorkerRecord, "id">>(key: K, value: Omit<WorkerRecord, "id">[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateSystemAccess = (id: string, key: keyof SystemAccess, value: string) => {
    setFormData((prev) => ({
      ...prev,
      systemsAccess: prev.systemsAccess.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
  };

  const updateAssignedAsset = (id: string, key: keyof AssignedAsset, value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedAssets: prev.assignedAssets.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.fullName || !formData.rut || !formData.position) {
      alert("Completa al menos nombre, RUT y cargo.");
      return;
    }

    setSaving(true);
    try {
      const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
      const next = [{ id, ...formData }, ...(Array.isArray(current) ? current : [])];
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(next));
      router.push("/dashboard/workers");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el trabajador");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registrar trabajador</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Ficha de cumplimiento Ley 21.663.</p>
        </div>
        <Link href="/dashboard/workers"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ficha de registro de trabajadores</CardTitle>
          <CardDescription>Control de personal con acceso a sistemas y responsabilidades de ciberseguridad.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h3 className="font-semibold text-lg">1) Información General del Trabajador</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Nombre completo" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                <Input placeholder="RUT" value={formData.rut} onChange={(e) => updateField("rut", e.target.value)} />
                <Input placeholder="Cargo" value={formData.position} onChange={(e) => updateField("position", e.target.value)} />
                <Input placeholder="Área / Departamento" value={formData.department} onChange={(e) => updateField("department", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.contractType} onChange={(e) => updateField("contractType", e.target.value as ContractType)}>
                  <option value="PLANTA">Planta</option><option value="CONTRATA">Contrata</option><option value="HONORARIOS">Honorarios</option><option value="EXTERNO">Externo</option>
                </select>
                <Input type="date" value={formData.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
                <Input type="date" value={formData.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
                <Input type="email" placeholder="Correo institucional" value={formData.institutionalEmail} onChange={(e) => updateField("institutionalEmail", e.target.value)} />
                <Input placeholder="Teléfono corporativo" value={formData.corporatePhone} onChange={(e) => updateField("corporatePhone", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">2) Rol en Seguridad de la Información</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.systemRole} onChange={(e) => updateField("systemRole", e.target.value as SystemRole)}>
                  <option value="USUARIO">Usuario</option><option value="ADMINISTRADOR">Administrador</option><option value="SOPORTE">Soporte</option><option value="AUDITOR">Auditor</option><option value="OTRO">Otro</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.accessLevel} onChange={(e) => updateField("accessLevel", e.target.value as AccessLevel)}>
                  <option value="BAJO">Bajo</option><option value="MEDIO">Medio</option><option value="ALTO">Alto</option><option value="CRITICO">Crítico</option>
                </select>
                <div className="flex items-center gap-4 text-sm">
                  <label><input type="checkbox" checked={formData.hasPersonalDataAccess} onChange={(e) => updateField("hasPersonalDataAccess", e.target.checked)} className="mr-2" />Datos personales</label>
                  <label><input type="checkbox" checked={formData.hasCriticalInfrastructureAccess} onChange={(e) => updateField("hasCriticalInfrastructureAccess", e.target.checked)} className="mr-2" />Infra crítica</label>
                  <label><input type="checkbox" checked={formData.hasRemoteAccess} onChange={(e) => updateField("hasRemoteAccess", e.target.checked)} className="mr-2" />Acceso remoto</label>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">3) Sistemas a los que Tiene Acceso</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData((p) => ({ ...p, systemsAccess: [...p.systemsAccess, { id: `${Date.now()}`, systemName: "", accessType: "", assignedAt: "", revokedAt: "" }] }))}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
              </div>
              {formData.systemsAccess.map((row) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Input placeholder="Sistema / Plataforma" value={row.systemName} onChange={(e) => updateSystemAccess(row.id, "systemName", e.target.value)} />
                  <Input placeholder="Tipo de acceso" value={row.accessType} onChange={(e) => updateSystemAccess(row.id, "accessType", e.target.value)} />
                  <Input type="date" value={row.assignedAt} onChange={(e) => updateSystemAccess(row.id, "assignedAt", e.target.value)} />
                  <Input type="date" value={row.revokedAt} onChange={(e) => updateSystemAccess(row.id, "revokedAt", e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => setFormData((p) => ({ ...p, systemsAccess: p.systemsAccess.filter((x) => x.id !== row.id) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">4) Responsabilidades en Ciberseguridad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <label><input type="checkbox" checked={formData.hasNdaSigned} onChange={(e) => updateField("hasNdaSigned", e.target.checked)} className="mr-2" />Ha firmado acuerdo de confidencialidad</label>
                <label><input type="checkbox" checked={formData.hasCyberTraining} onChange={(e) => updateField("hasCyberTraining", e.target.checked)} className="mr-2" />Ha recibido capacitación en ciberseguridad</label>
                <label><input type="checkbox" checked={formData.knowsIncidentProtocol} onChange={(e) => updateField("knowsIncidentProtocol", e.target.checked)} className="mr-2" />Conoce protocolo de incidentes</label>
                <label><input type="checkbox" checked={formData.knowsAcceptableUsePolicy} onChange={(e) => updateField("knowsAcceptableUsePolicy", e.target.checked)} className="mr-2" />Conoce política de uso aceptable</label>
                <label><input type="checkbox" checked={formData.knowsAccessControlPolicy} onChange={(e) => updateField("knowsAccessControlPolicy", e.target.checked)} className="mr-2" />Conoce política de control de accesos</label>
              </div>
              <Input type="date" value={formData.lastTrainingDate} onChange={(e) => updateField("lastTrainingDate", e.target.value)} />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">5) Gestión de Activos Asignados</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData((p) => ({ ...p, assignedAssets: [...p.assignedAssets, { id: `${Date.now()}-a`, assetName: "", inventoryCode: "", deliveryDate: "", returnDate: "" }] }))}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
              </div>
              {formData.assignedAssets.map((row) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Input placeholder="Activo" value={row.assetName} onChange={(e) => updateAssignedAsset(row.id, "assetName", e.target.value)} />
                  <Input placeholder="Código inventario" value={row.inventoryCode} onChange={(e) => updateAssignedAsset(row.id, "inventoryCode", e.target.value)} />
                  <Input type="date" value={row.deliveryDate} onChange={(e) => updateAssignedAsset(row.id, "deliveryDate", e.target.value)} />
                  <Input type="date" value={row.returnDate} onChange={(e) => updateAssignedAsset(row.id, "returnDate", e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => setFormData((p) => ({ ...p, assignedAssets: p.assignedAssets.filter((x) => x.id !== row.id) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">6) Validación y Control</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Supervisor responsable" value={formData.supervisorName} onChange={(e) => updateField("supervisorName", e.target.value)} />
                <Input placeholder="Oficial de seguridad (CISO)" value={formData.securityOfficer} onChange={(e) => updateField("securityOfficer", e.target.value)} />
                <Input placeholder="Firma trabajador" value={formData.workerSignature} onChange={(e) => updateField("workerSignature", e.target.value)} />
                <Input placeholder="Firma responsable TI" value={formData.itResponsibleSignature} onChange={(e) => updateField("itResponsibleSignature", e.target.value)} />
                <Input type="date" value={formData.registrationDate} onChange={(e) => updateField("registrationDate", e.target.value)} />
              </div>
            </section>

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/workers"><Button type="button" variant="outline">Cancelar</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Guardando..." : "Guardar trabajador"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
