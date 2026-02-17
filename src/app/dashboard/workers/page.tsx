"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Search, Users } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            Listado de Trabajadores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registro formal para control de accesos, auditorías y cumplimiento Ley 21.663.
          </p>
        </div>
        <Link href="/dashboard/workers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Registrar trabajador
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total trabajadores</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Acceso crítico</p><p className="text-2xl font-bold text-red-600">{stats.critical}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Acceso remoto</p><p className="text-2xl font-bold text-blue-600">{stats.remote}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Capacitados</p><p className="text-2xl font-bold text-green-600">{stats.trained}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Trabajadores registrados</CardTitle>
          <CardDescription>Busca por nombre, RUT, cargo o área.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Buscar trabajador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">RUT</th>
                  <th className="text-left p-3">Cargo</th>
                  <th className="text-left p-3">Área</th>
                  <th className="text-left p-3">Rol sistema</th>
                  <th className="text-left p-3">Nivel acceso</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedWorker(worker)}>
                    <td className="p-3 font-medium">{worker.fullName}</td>
                    <td className="p-3">{worker.rut}</td>
                    <td className="p-3">{worker.position}</td>
                    <td className="p-3">{worker.department}</td>
                    <td className="p-3">{worker.systemRole}</td>
                    <td className="p-3">
                      <Badge variant={worker.accessLevel === "CRITICO" ? "destructive" : "outline"}>{worker.accessLevel}</Badge>
                    </td>
                  </tr>
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">No se encontraron trabajadores.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedWorker && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Ficha: {selectedWorker.fullName}</CardTitle>
                <CardDescription>{selectedWorker.position} · {selectedWorker.department}</CardDescription>
              </div>
              <Link href={`/dashboard/workers/${encodeURIComponent(selectedWorker.id)}/edit`}>
                <Button variant="outline">Editar trabajador</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <p><strong>RUT:</strong> {selectedWorker.rut}</p>
              <p><strong>Contrato:</strong> {selectedWorker.contractType}</p>
              <p><strong>Ingreso:</strong> {selectedWorker.startDate || "N/A"}</p>
              <p><strong>Término:</strong> {selectedWorker.endDate || "N/A"}</p>
              <p><strong>Correo:</strong> {selectedWorker.institutionalEmail || "N/A"}</p>
              <p><strong>Teléfono:</strong> {selectedWorker.corporatePhone || "N/A"}</p>
              <p><strong>Rol sistema:</strong> {selectedWorker.systemRole}</p>
              <p><strong>Nivel acceso:</strong> {selectedWorker.accessLevel}</p>
              <p><strong>Datos personales:</strong> {selectedWorker.hasPersonalDataAccess ? "Sí" : "No"}</p>
              <p><strong>Infraestructura crítica:</strong> {selectedWorker.hasCriticalInfrastructureAccess ? "Sí" : "No"}</p>
              <p><strong>Acceso remoto:</strong> {selectedWorker.hasRemoteAccess ? "Sí" : "No"}</p>
              <p><strong>Última capacitación:</strong> {selectedWorker.lastTrainingDate || "N/A"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Responsabilidades en ciberseguridad</h4>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>{selectedWorker.hasNdaSigned ? "✓" : "✗"} Acuerdo de confidencialidad</li>
                  <li>{selectedWorker.hasCyberTraining ? "✓" : "✗"} Capacitación en ciberseguridad</li>
                  <li>{selectedWorker.knowsIncidentProtocol ? "✓" : "✗"} Conoce protocolo de incidentes</li>
                  <li>{selectedWorker.knowsAcceptableUsePolicy ? "✓" : "✗"} Conoce política de uso aceptable</li>
                  <li>{selectedWorker.knowsAccessControlPolicy ? "✓" : "✗"} Conoce política de control de accesos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Validación y control</h4>
                <p><strong>Supervisor:</strong> {selectedWorker.supervisorName || "N/A"}</p>
                <p><strong>Oficial de Seguridad:</strong> {selectedWorker.securityOfficer || "N/A"}</p>
                <p><strong>Firma trabajador:</strong> {selectedWorker.workerSignature || "N/A"}</p>
                <p><strong>Firma responsable TI:</strong> {selectedWorker.itResponsibleSignature || "N/A"}</p>
                <p><strong>Fecha registro:</strong> {selectedWorker.registrationDate || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
