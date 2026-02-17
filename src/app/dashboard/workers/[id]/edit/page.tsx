"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function EditWorkerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const workerId = useMemo(() => decodeURIComponent(params.id), [params.id]);

  const [worker, setWorker] = useState<WorkerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
      const list: WorkerRecord[] = raw ? JSON.parse(raw) : [];
      setWorker(list.find((item) => item.id === workerId) || null);
    } catch {
      setWorker(null);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  const updateField = <K extends keyof WorkerRecord>(key: K, value: WorkerRecord[K]) => {
    setWorker((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateSystemAccess = (id: string, key: keyof SystemAccess, value: string) => {
    setWorker((prev) => prev ? ({ ...prev, systemsAccess: prev.systemsAccess.map((row) => (row.id === id ? { ...row, [key]: value } : row)) }) : prev);
  };

  const updateAssignedAsset = (id: string, key: keyof AssignedAsset, value: string) => {
    setWorker((prev) => prev ? ({ ...prev, assignedAssets: prev.assignedAssets.map((row) => (row.id === id ? { ...row, [key]: value } : row)) }) : prev);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!worker) return;

    if (!worker.fullName || !worker.rut || !worker.position) {
      alert("Completa al menos nombre, RUT y cargo.");
      return;
    }

    setSaving(true);
    try {
      const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
      const list: WorkerRecord[] = raw ? JSON.parse(raw) : [];
      const updated = list.map((item) => (item.id === worker.id ? worker : item));
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(updated));
      router.push("/dashboard/workers");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el trabajador");
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Cargando trabajador...</div>;

  if (!worker) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trabajador no encontrado</CardTitle>
          <CardDescription>El registro no existe o no está disponible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/workers"><Button variant="outline">Volver</Button></Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar trabajador</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Actualiza la ficha de {worker.fullName}.</p>
        </div>
        <Link href="/dashboard/workers"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ficha de trabajador</CardTitle>
          <CardDescription>Actualiza datos de acceso y cumplimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h3 className="font-semibold text-lg">1) Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input value={worker.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="Nombre completo" />
                <Input value={worker.rut} onChange={(e) => updateField("rut", e.target.value)} placeholder="RUT" />
                <Input value={worker.position} onChange={(e) => updateField("position", e.target.value)} placeholder="Cargo" />
                <Input value={worker.department} onChange={(e) => updateField("department", e.target.value)} placeholder="Área" />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={worker.contractType} onChange={(e) => updateField("contractType", e.target.value as ContractType)}>
                  <option value="PLANTA">Planta</option><option value="CONTRATA">Contrata</option><option value="HONORARIOS">Honorarios</option><option value="EXTERNO">Externo</option>
                </select>
                <Input type="date" value={worker.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">2) Seguridad de la Información</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={worker.systemRole} onChange={(e) => updateField("systemRole", e.target.value as SystemRole)}>
                  <option value="USUARIO">Usuario</option><option value="ADMINISTRADOR">Administrador</option><option value="SOPORTE">Soporte</option><option value="AUDITOR">Auditor</option><option value="OTRO">Otro</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={worker.accessLevel} onChange={(e) => updateField("accessLevel", e.target.value as AccessLevel)}>
                  <option value="BAJO">Bajo</option><option value="MEDIO">Medio</option><option value="ALTO">Alto</option><option value="CRITICO">Crítico</option>
                </select>
                <div className="flex items-center gap-4 text-sm">
                  <label><input type="checkbox" checked={worker.hasPersonalDataAccess} onChange={(e) => updateField("hasPersonalDataAccess", e.target.checked)} className="mr-2" />Datos personales</label>
                  <label><input type="checkbox" checked={worker.hasCriticalInfrastructureAccess} onChange={(e) => updateField("hasCriticalInfrastructureAccess", e.target.checked)} className="mr-2" />Infra crítica</label>
                  <label><input type="checkbox" checked={worker.hasRemoteAccess} onChange={(e) => updateField("hasRemoteAccess", e.target.checked)} className="mr-2" />Remoto</label>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">3) Sistemas con acceso</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => updateField("systemsAccess", [...worker.systemsAccess, { id: `${Date.now()}`, systemName: "", accessType: "", assignedAt: "", revokedAt: "" }])}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
              </div>
              {worker.systemsAccess.map((row) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Input placeholder="Sistema" value={row.systemName} onChange={(e) => updateSystemAccess(row.id, "systemName", e.target.value)} />
                  <Input placeholder="Tipo acceso" value={row.accessType} onChange={(e) => updateSystemAccess(row.id, "accessType", e.target.value)} />
                  <Input type="date" value={row.assignedAt} onChange={(e) => updateSystemAccess(row.id, "assignedAt", e.target.value)} />
                  <Input type="date" value={row.revokedAt} onChange={(e) => updateSystemAccess(row.id, "revokedAt", e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => updateField("systemsAccess", worker.systemsAccess.filter((x) => x.id !== row.id))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">4) Activos asignados</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => updateField("assignedAssets", [...worker.assignedAssets, { id: `${Date.now()}-a`, assetName: "", inventoryCode: "", deliveryDate: "", returnDate: "" }])}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
              </div>
              {worker.assignedAssets.map((row) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Input placeholder="Activo" value={row.assetName} onChange={(e) => updateAssignedAsset(row.id, "assetName", e.target.value)} />
                  <Input placeholder="Código inventario" value={row.inventoryCode} onChange={(e) => updateAssignedAsset(row.id, "inventoryCode", e.target.value)} />
                  <Input type="date" value={row.deliveryDate} onChange={(e) => updateAssignedAsset(row.id, "deliveryDate", e.target.value)} />
                  <Input type="date" value={row.returnDate} onChange={(e) => updateAssignedAsset(row.id, "returnDate", e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => updateField("assignedAssets", worker.assignedAssets.filter((x) => x.id !== row.id))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </section>

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/workers"><Button type="button" variant="outline">Cancelar</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
