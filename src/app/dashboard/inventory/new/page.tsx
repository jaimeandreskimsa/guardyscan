"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const initialFormData: Omit<EquipmentRecord, "id"> = {
  assetCode: "",
  equipmentType: "Notebook",
  brand: "",
  model: "",
  serialNumber: "",
  physicalLabel: false,
  status: "OPERATIVO",
  criticality: "MEDIA",
  operatingSystem: "",
  operatingSystemVersion: "",
  processor: "",
  ram: "",
  storage: "",
  assignedIp: "",
  macAddress: "",
  domainOrWorkgroup: "",
  antivirusInstalled: false,
  antivirusName: "",
  firewallActive: true,
  diskEncryption: false,
  physicalLocation: "Oficina",
  exactAddress: "",
  department: "",
  assignedUser: "",
  userRole: "",
  corporateEmail: "",
  purchaseDate: "",
  supplier: "",
  purchaseDocument: "",
  equipmentCost: 0,
  warrantyUntil: "",
  supportContract: false,
  hasSensitiveInformation: false,
  sensitiveInformationType: "",
  lastPatchUpdate: "",
  lastSecurityReview: "",
  backupConfigured: false,
  lastBackupDate: "",
  lastMaintenanceDate: "",
  reportedIncidents: "",
  relevantChanges: "",
  decommissionDate: "",
  decommissionReason: "",
};

export default function NewInventoryEquipmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<EquipmentRecord, "id">>(initialFormData);
  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof Omit<EquipmentRecord, "id">>(
    field: K,
    value: Omit<EquipmentRecord, "id">[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.assetCode || !formData.brand || !formData.model || !formData.serialNumber) {
      alert("Completa al menos: código, marca, modelo y número de serie.");
      return;
    }

    setSaving(true);
    try {
      const newRecord: EquipmentRecord = { id: generateId(), ...formData };
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(current) ? [newRecord, ...current] : [newRecord];
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(next));
      router.push("/dashboard/inventory");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el equipo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registrar equipo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Completa la ficha de inventario tecnológico.</p>
        </div>
        <Link href="/dashboard/inventory">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inventario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva ficha de equipo</CardTitle>
          <CardDescription>Formato para control de activos TI, cumplimiento y auditoría.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h3 className="font-semibold text-lg">1) Información General del Activo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Código interno" value={formData.assetCode} onChange={(e) => updateField("assetCode", e.target.value)} />
                <Input placeholder="Tipo de equipo" value={formData.equipmentType} onChange={(e) => updateField("equipmentType", e.target.value)} />
                <Input placeholder="Marca" value={formData.brand} onChange={(e) => updateField("brand", e.target.value)} />
                <Input placeholder="Modelo" value={formData.model} onChange={(e) => updateField("model", e.target.value)} />
                <Input placeholder="Número de serie" value={formData.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.status} onChange={(e) => updateField("status", e.target.value as EquipmentStatus)}>
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
                <Input placeholder="Sistema operativo" value={formData.operatingSystem} onChange={(e) => updateField("operatingSystem", e.target.value)} />
                <Input placeholder="Versión SO" value={formData.operatingSystemVersion} onChange={(e) => updateField("operatingSystemVersion", e.target.value)} />
                <Input placeholder="Procesador" value={formData.processor} onChange={(e) => updateField("processor", e.target.value)} />
                <Input placeholder="RAM" value={formData.ram} onChange={(e) => updateField("ram", e.target.value)} />
                <Input placeholder="Disco duro / SSD" value={formData.storage} onChange={(e) => updateField("storage", e.target.value)} />
                <Input placeholder="IP asignada" value={formData.assignedIp} onChange={(e) => updateField("assignedIp", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">3) Ubicación y Responsable</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Ubicación física" value={formData.physicalLocation} onChange={(e) => updateField("physicalLocation", e.target.value)} />
                <Input placeholder="Área / Departamento" value={formData.department} onChange={(e) => updateField("department", e.target.value)} />
                <Input placeholder="Usuario asignado" value={formData.assignedUser} onChange={(e) => updateField("assignedUser", e.target.value)} />
                <Input placeholder="Cargo del usuario" value={formData.userRole} onChange={(e) => updateField("userRole", e.target.value)} />
                <Input type="email" placeholder="Correo corporativo" value={formData.corporateEmail} onChange={(e) => updateField("corporateEmail", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">4) Información Administrativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input type="date" value={formData.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} />
                <Input placeholder="Proveedor" value={formData.supplier} onChange={(e) => updateField("supplier", e.target.value)} />
                <Input placeholder="Factura / documento" value={formData.purchaseDocument} onChange={(e) => updateField("purchaseDocument", e.target.value)} />
                <Input type="number" placeholder="Costo del equipo" value={formData.equipmentCost} onChange={(e) => updateField("equipmentCost", Number(e.target.value || 0))} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">5) Seguridad y Cumplimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Tipo de información sensible" value={formData.sensitiveInformationType} onChange={(e) => updateField("sensitiveInformationType", e.target.value)} />
                <Input type="date" value={formData.lastPatchUpdate} onChange={(e) => updateField("lastPatchUpdate", e.target.value)} />
                <Input type="date" value={formData.lastSecurityReview} onChange={(e) => updateField("lastSecurityReview", e.target.value)} />
                <Input type="date" value={formData.lastBackupDate} onChange={(e) => updateField("lastBackupDate", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">6) Historial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input type="date" value={formData.lastMaintenanceDate} onChange={(e) => updateField("lastMaintenanceDate", e.target.value)} />
                <Input type="date" value={formData.decommissionDate} onChange={(e) => updateField("decommissionDate", e.target.value)} />
              </div>
              <Textarea placeholder="Incidentes reportados" value={formData.reportedIncidents} onChange={(e) => updateField("reportedIncidents", e.target.value)} />
              <Textarea placeholder="Cambios relevantes realizados" value={formData.relevantChanges} onChange={(e) => updateField("relevantChanges", e.target.value)} />
              <Textarea placeholder="Motivo de baja" value={formData.decommissionReason} onChange={(e) => updateField("decommissionReason", e.target.value)} />
            </section>

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/inventory">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar equipo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
