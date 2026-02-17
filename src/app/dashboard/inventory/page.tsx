"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Laptop, Plus, Search, ShieldCheck } from "lucide-react";

type Criticality = "ALTA" | "MEDIA" | "BAJA";
type EquipmentStatus = "OPERATIVO" | "EN_REPARACION" | "DADO_DE_BAJA" | "OBSOLETO";

type EquipmentRecord = {
  id: string;
  // 1) Información general
  assetCode: string;
  equipmentType: string;
  brand: string;
  model: string;
  serialNumber: string;
  physicalLabel: boolean;
  status: EquipmentStatus;
  criticality: Criticality;

  // 2) Información técnica
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

  // 3) Ubicación y responsable
  physicalLocation: string;
  exactAddress: string;
  department: string;
  assignedUser: string;
  userRole: string;
  corporateEmail: string;

  // 4) Información administrativa
  purchaseDate: string;
  supplier: string;
  purchaseDocument: string;
  equipmentCost: number;
  warrantyUntil: string;
  supportContract: boolean;

  // 5) Seguridad y cumplimiento
  hasSensitiveInformation: boolean;
  sensitiveInformationType: string;
  lastPatchUpdate: string;
  lastSecurityReview: string;
  backupConfigured: boolean;
  lastBackupDate: string;

  // 6) Historial
  lastMaintenanceDate: string;
  reportedIncidents: string;
  relevantChanges: string;
  decommissionDate: string;
  decommissionReason: string;
};

const equipmentTypes = [
  "Notebook",
  "PC escritorio",
  "Servidor",
  "Router",
  "Switch",
  "Firewall",
  "Impresora",
  "Celular",
  "Tablet",
  "Otro",
];

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

export default function InventoryPage() {
  const [inventory, setInventory] = useState<EquipmentRecord[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Omit<EquipmentRecord, "id">>(initialFormData);
  const [selectedRecord, setSelectedRecord] = useState<EquipmentRecord | null>(initialInventory[0]);

  const filteredInventory = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return inventory.filter((item) =>
      item.assetCode.toLowerCase().includes(query) ||
      item.equipmentType.toLowerCase().includes(query) ||
      item.assignedUser.toLowerCase().includes(query) ||
      item.serialNumber.toLowerCase().includes(query)
    );
  }, [inventory, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: inventory.length,
      active: inventory.filter((item) => item.status === "OPERATIVO").length,
      critical: inventory.filter((item) => item.criticality === "ALTA").length,
      sensitive: inventory.filter((item) => item.hasSensitiveInformation).length,
    };
  }, [inventory]);

  const updateField = <K extends keyof Omit<EquipmentRecord, "id">>(field: K, value: Omit<EquipmentRecord, "id">[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.assetCode || !formData.brand || !formData.model || !formData.serialNumber) {
      alert("Completa al menos código, marca, modelo y número de serie.");
      return;
    }

    const newRecord: EquipmentRecord = {
      id: crypto.randomUUID(),
      ...formData,
    };

    setInventory((prev) => [newRecord, ...prev]);
    setSelectedRecord(newRecord);
    setFormData(initialFormData);
  };

  const boolLabel = (value: boolean) => (value ? "Sí" : "No");

  const getCriticalityClass = (criticality: Criticality) => {
    if (criticality === "ALTA") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (criticality === "MEDIA") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            Inventario de Equipos Tecnológicos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Control de activos TI para auditorías, cumplimiento y gestión de riesgos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total activos</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Operativos</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Criticidad alta</p><p className="text-2xl font-bold text-red-600">{stats.critical}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Con datos sensibles</p><p className="text-2xl font-bold text-purple-600">{stats.sensitive}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Registrar equipo</CardTitle>
          <CardDescription>Ficha profesional para inventario y cumplimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRecord} className="space-y-6">
            <section className="space-y-3">
              <h3 className="font-semibold text-lg">1) Información General del Activo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Código interno" value={formData.assetCode} onChange={(e) => updateField("assetCode", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.equipmentType} onChange={(e) => updateField("equipmentType", e.target.value)}>
                  {equipmentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <Input placeholder="Marca" value={formData.brand} onChange={(e) => updateField("brand", e.target.value)} />
                <Input placeholder="Modelo" value={formData.model} onChange={(e) => updateField("model", e.target.value)} />
                <Input placeholder="Número de serie" value={formData.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.physicalLabel ? "SI" : "NO"} onChange={(e) => updateField("physicalLabel", e.target.value === "SI")}>
                  <option value="SI">Etiqueta física: Sí</option>
                  <option value="NO">Etiqueta física: No</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.status} onChange={(e) => updateField("status", e.target.value as EquipmentStatus)}>
                  <option value="OPERATIVO">Operativo</option>
                  <option value="EN_REPARACION">En reparación</option>
                  <option value="DADO_DE_BAJA">Dado de baja</option>
                  <option value="OBSOLETO">Obsoleto</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.criticality} onChange={(e) => updateField("criticality", e.target.value as Criticality)}>
                  <option value="ALTA">Criticidad Alta</option>
                  <option value="MEDIA">Criticidad Media</option>
                  <option value="BAJA">Criticidad Baja</option>
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
                <Input placeholder="Dirección MAC" value={formData.macAddress} onChange={(e) => updateField("macAddress", e.target.value)} />
                <Input placeholder="Dominio o grupo de trabajo" value={formData.domainOrWorkgroup} onChange={(e) => updateField("domainOrWorkgroup", e.target.value)} />
                <Input placeholder="Antivirus (¿cuál?)" value={formData.antivirusName} onChange={(e) => updateField("antivirusName", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.antivirusInstalled ? "SI" : "NO"} onChange={(e) => updateField("antivirusInstalled", e.target.value === "SI")}>
                  <option value="SI">Antivirus: Sí</option>
                  <option value="NO">Antivirus: No</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.firewallActive ? "SI" : "NO"} onChange={(e) => updateField("firewallActive", e.target.value === "SI")}>
                  <option value="SI">Firewall activo: Sí</option>
                  <option value="NO">Firewall activo: No</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.diskEncryption ? "SI" : "NO"} onChange={(e) => updateField("diskEncryption", e.target.value === "SI")}>
                  <option value="SI">Cifrado de disco: Sí</option>
                  <option value="NO">Cifrado de disco: No</option>
                </select>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">3) Ubicación y Responsable</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.physicalLocation} onChange={(e) => updateField("physicalLocation", e.target.value)}>
                  <option>Oficina</option>
                  <option>Sucursal</option>
                  <option>Remoto</option>
                  <option>Data Center</option>
                </select>
                <Input placeholder="Dirección exacta" value={formData.exactAddress} onChange={(e) => updateField("exactAddress", e.target.value)} />
                <Input placeholder="Área / Departamento" value={formData.department} onChange={(e) => updateField("department", e.target.value)} />
                <Input placeholder="Usuario asignado" value={formData.assignedUser} onChange={(e) => updateField("assignedUser", e.target.value)} />
                <Input placeholder="Cargo del usuario" value={formData.userRole} onChange={(e) => updateField("userRole", e.target.value)} />
                <Input placeholder="Correo corporativo" type="email" value={formData.corporateEmail} onChange={(e) => updateField("corporateEmail", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">4) Información Administrativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input type="date" value={formData.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} />
                <Input placeholder="Proveedor" value={formData.supplier} onChange={(e) => updateField("supplier", e.target.value)} />
                <Input placeholder="Factura / documento" value={formData.purchaseDocument} onChange={(e) => updateField("purchaseDocument", e.target.value)} />
                <Input type="number" placeholder="Costo del equipo" value={formData.equipmentCost} onChange={(e) => updateField("equipmentCost", Number(e.target.value || 0))} />
                <Input type="date" value={formData.warrantyUntil} onChange={(e) => updateField("warrantyUntil", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.supportContract ? "SI" : "NO"} onChange={(e) => updateField("supportContract", e.target.value === "SI")}>
                  <option value="SI">Contrato de soporte: Sí</option>
                  <option value="NO">Contrato de soporte: No</option>
                </select>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">5) Seguridad y Cumplimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.hasSensitiveInformation ? "SI" : "NO"} onChange={(e) => updateField("hasSensitiveInformation", e.target.value === "SI")}>
                  <option value="SI">Contiene info sensible: Sí</option>
                  <option value="NO">Contiene info sensible: No</option>
                </select>
                <Input placeholder="Tipo de información" value={formData.sensitiveInformationType} onChange={(e) => updateField("sensitiveInformationType", e.target.value)} />
                <Input type="date" value={formData.lastPatchUpdate} onChange={(e) => updateField("lastPatchUpdate", e.target.value)} />
                <Input type="date" value={formData.lastSecurityReview} onChange={(e) => updateField("lastSecurityReview", e.target.value)} />
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={formData.backupConfigured ? "SI" : "NO"} onChange={(e) => updateField("backupConfigured", e.target.value === "SI")}>
                  <option value="SI">Respaldo configurado: Sí</option>
                  <option value="NO">Respaldo configurado: No</option>
                </select>
                <Input type="date" value={formData.lastBackupDate} onChange={(e) => updateField("lastBackupDate", e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">6) Historial</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input type="date" value={formData.lastMaintenanceDate} onChange={(e) => updateField("lastMaintenanceDate", e.target.value)} />
                <Input type="date" value={formData.decommissionDate} onChange={(e) => updateField("decommissionDate", e.target.value)} />
                <Input placeholder="Motivo de baja" value={formData.decommissionReason} onChange={(e) => updateField("decommissionReason", e.target.value)} />
              </div>
              <Textarea placeholder="Incidentes reportados" value={formData.reportedIncidents} onChange={(e) => updateField("reportedIncidents", e.target.value)} />
              <Textarea placeholder="Cambios relevantes realizados" value={formData.relevantChanges} onChange={(e) => updateField("relevantChanges", e.target.value)} />
            </section>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Guardar ficha de inventario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Laptop className="h-5 w-5" /> Activos registrados</CardTitle>
          <CardDescription>Inventario operativo para control de activos TI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Buscar por código, serie, tipo o responsable..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-3">Código</th>
                  <th className="text-left p-3">Equipo</th>
                  <th className="text-left p-3">Responsable</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Criticidad</th>
                  <th className="text-left p-3">Seguridad</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => setSelectedRecord(item)}
                  >
                    <td className="p-3 font-medium">{item.assetCode}</td>
                    <td className="p-3">{item.equipmentType} - {item.brand} {item.model}</td>
                    <td className="p-3">{item.assignedUser || "Sin asignar"}</td>
                    <td className="p-3">
                      <Badge variant="outline">{statusLabels[item.status]}</Badge>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityClass(item.criticality)}`}>
                        {criticalityLabels[item.criticality]}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>{item.lastPatchUpdate || "Sin fecha"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Ficha detallada: {selectedRecord.assetCode}</CardTitle>
            <CardDescription>{selectedRecord.equipmentType} - {selectedRecord.brand} {selectedRecord.model}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <p><strong>Serie:</strong> {selectedRecord.serialNumber}</p>
              <p><strong>Etiqueta física:</strong> {boolLabel(selectedRecord.physicalLabel)}</p>
              <p><strong>Estado:</strong> {statusLabels[selectedRecord.status]}</p>
              <p><strong>Criticidad:</strong> {criticalityLabels[selectedRecord.criticality]}</p>
              <p><strong>SO:</strong> {selectedRecord.operatingSystem} {selectedRecord.operatingSystemVersion}</p>
              <p><strong>Procesador:</strong> {selectedRecord.processor}</p>
              <p><strong>RAM:</strong> {selectedRecord.ram}</p>
              <p><strong>Disco:</strong> {selectedRecord.storage}</p>
              <p><strong>IP / MAC:</strong> {selectedRecord.assignedIp} / {selectedRecord.macAddress}</p>
              <p><strong>Dominio:</strong> {selectedRecord.domainOrWorkgroup}</p>
              <p><strong>Antivirus:</strong> {boolLabel(selectedRecord.antivirusInstalled)} {selectedRecord.antivirusName ? `(${selectedRecord.antivirusName})` : ""}</p>
              <p><strong>Firewall:</strong> {boolLabel(selectedRecord.firewallActive)}</p>
              <p><strong>Cifrado:</strong> {boolLabel(selectedRecord.diskEncryption)}</p>
              <p><strong>Ubicación:</strong> {selectedRecord.physicalLocation}</p>
              <p><strong>Área:</strong> {selectedRecord.department}</p>
              <p><strong>Usuario:</strong> {selectedRecord.assignedUser}</p>
              <p><strong>Cargo:</strong> {selectedRecord.userRole}</p>
              <p><strong>Correo:</strong> {selectedRecord.corporateEmail}</p>
              <p><strong>Proveedor:</strong> {selectedRecord.supplier}</p>
              <p><strong>Costo:</strong> ${selectedRecord.equipmentCost.toLocaleString("es-CL")}</p>
              <p><strong>Garantía:</strong> {selectedRecord.warrantyUntil || "N/A"}</p>
              <p><strong>Soporte:</strong> {boolLabel(selectedRecord.supportContract)}</p>
              <p><strong>Info sensible:</strong> {boolLabel(selectedRecord.hasSensitiveInformation)}</p>
              <p><strong>Tipo info:</strong> {selectedRecord.sensitiveInformationType || "N/A"}</p>
              <p><strong>Último parche:</strong> {selectedRecord.lastPatchUpdate || "N/A"}</p>
              <p><strong>Última revisión seguridad:</strong> {selectedRecord.lastSecurityReview || "N/A"}</p>
              <p><strong>Respaldo:</strong> {boolLabel(selectedRecord.backupConfigured)}</p>
              <p><strong>Último respaldo:</strong> {selectedRecord.lastBackupDate || "N/A"}</p>
              <p><strong>Última mantención:</strong> {selectedRecord.lastMaintenanceDate || "N/A"}</p>
              <p><strong>Fecha de baja:</strong> {selectedRecord.decommissionDate || "N/A"}</p>
              <p><strong>Motivo de baja:</strong> {selectedRecord.decommissionReason || "N/A"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1">Incidentes reportados</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRecord.reportedIncidents || "Sin registro"}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cambios relevantes</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRecord.relevantChanges || "Sin registro"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
