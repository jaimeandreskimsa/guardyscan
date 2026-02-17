"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function EditInventoryEquipmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const equipmentId = useMemo(() => decodeURIComponent(params.id), [params.id]);

  const [record, setRecord] = useState<EquipmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      const list: EquipmentRecord[] = raw ? JSON.parse(raw) : [];
      const found = list.find((item) => item.id === equipmentId) || null;
      setRecord(found);
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  const updateField = <K extends keyof EquipmentRecord>(field: K, value: EquipmentRecord[K]) => {
    setRecord((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!record) return;

    if (!record.assetCode || !record.brand || !record.model || !record.serialNumber) {
      alert("Completa al menos: código, marca, modelo y número de serie.");
      return;
    }

    setSaving(true);
    try {
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      const list: EquipmentRecord[] = raw ? JSON.parse(raw) : [];
      const updated = list.map((item) => (item.id === record.id ? record : item));
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
      router.push("/dashboard/inventory");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el equipo.");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando equipo...</div>;
  }

  if (!record) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipo no encontrado</CardTitle>
          <CardDescription>El activo que intentas editar no existe o no está disponible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/inventory">
            <Button variant="outline">Volver al inventario</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar equipo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Actualiza la ficha del activo {record.assetCode}.</p>
        </div>
        <Link href="/dashboard/inventory">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ficha del activo</CardTitle>
          <CardDescription>Modifica la información y guarda cambios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h3 className="font-semibold text-lg">1) Información General del Activo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Código interno" value={record.assetCode} onChange={(e) => updateField("assetCode", e.target.value)} />
                <Input placeholder="Tipo de equipo" value={record.equipmentType} onChange={(e) => updateField("equipmentType", e.target.value)} />
                <Input placeholder="Marca" value={record.brand} onChange={(e) => updateField("brand", e.target.value)} />
                <Input placeholder="Modelo" value={record.model} onChange={(e) => updateField("model", e.target.value)} />
                <Input placeholder="Número de serie" value={record.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={record.status} onChange={(e) => updateField("status", e.target.value as EquipmentStatus)}>
                  <option value="OPERATIVO">Operativo</option>
                  <option value="EN_REPARACION">En reparación</option>
                  <option value="DADO_DE_BAJA">Dado de baja</option>
                  <option value="OBSOLETO">Obsoleto</option>
                </select>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">2) Información Técnica</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Sistema operativo" value={record.operatingSystem} onChange={(e) => updateField("operatingSystem", e.target.value)} />
                <Input placeholder="Versión SO" value={record.operatingSystemVersion} onChange={(e) => updateField("operatingSystemVersion", e.target.value)} />
                <Input placeholder="Procesador" value={record.processor} onChange={(e) => updateField("processor", e.target.value)} />
                <Input placeholder="RAM" value={record.ram} onChange={(e) => updateField("ram", e.target.value)} />
                <Input placeholder="Disco duro / SSD" value={record.storage} onChange={(e) => updateField("storage", e.target.value)} />
                <Input placeholder="IP asignada" value={record.assignedIp} onChange={(e) => updateField("assignedIp", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">3) Ubicación y Responsable</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Ubicación física" value={record.physicalLocation} onChange={(e) => updateField("physicalLocation", e.target.value)} />
                <Input placeholder="Área / Departamento" value={record.department} onChange={(e) => updateField("department", e.target.value)} />
                <Input placeholder="Usuario asignado" value={record.assignedUser} onChange={(e) => updateField("assignedUser", e.target.value)} />
                <Input placeholder="Cargo del usuario" value={record.userRole} onChange={(e) => updateField("userRole", e.target.value)} />
                <Input type="email" placeholder="Correo corporativo" value={record.corporateEmail} onChange={(e) => updateField("corporateEmail", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">4) Información Administrativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input type="date" value={record.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} />
                <Input placeholder="Proveedor" value={record.supplier} onChange={(e) => updateField("supplier", e.target.value)} />
                <Input placeholder="Factura / documento" value={record.purchaseDocument} onChange={(e) => updateField("purchaseDocument", e.target.value)} />
                <Input type="number" placeholder="Costo del equipo" value={record.equipmentCost} onChange={(e) => updateField("equipmentCost", Number(e.target.value || 0))} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">5) Seguridad y Cumplimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Tipo de información sensible" value={record.sensitiveInformationType} onChange={(e) => updateField("sensitiveInformationType", e.target.value)} />
                <Input type="date" value={record.lastPatchUpdate} onChange={(e) => updateField("lastPatchUpdate", e.target.value)} />
                <Input type="date" value={record.lastSecurityReview} onChange={(e) => updateField("lastSecurityReview", e.target.value)} />
                <Input type="date" value={record.lastBackupDate} onChange={(e) => updateField("lastBackupDate", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">6) Historial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input type="date" value={record.lastMaintenanceDate} onChange={(e) => updateField("lastMaintenanceDate", e.target.value)} />
                <Input type="date" value={record.decommissionDate} onChange={(e) => updateField("decommissionDate", e.target.value)} />
              </div>
              <Textarea placeholder="Incidentes reportados" value={record.reportedIncidents} onChange={(e) => updateField("reportedIncidents", e.target.value)} />
              <Textarea placeholder="Cambios relevantes realizados" value={record.relevantChanges} onChange={(e) => updateField("relevantChanges", e.target.value)} />
              <Textarea placeholder="Motivo de baja" value={record.decommissionReason} onChange={(e) => updateField("decommissionReason", e.target.value)} />
            </section>

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/inventory">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
