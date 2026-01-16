import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Activity, AlertTriangle, FileCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: {
      subscription: true,
      scans: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      incidents: {
        where: { status: "OPEN" },
        take: 5,
      },
    },
  });

  const stats = {
    totalScans: await prisma.scan.count({ where: { userId: user!.id } }),
    completedScans: await prisma.scan.count({ 
      where: { userId: user!.id, status: "COMPLETED" } 
    }),
    openIncidents: await prisma.incident.count({ 
      where: { userId: user!.id, status: "OPEN" } 
    }),
    criticalIncidents: await prisma.incident.count({ 
      where: { userId: user!.id, severity: "CRITICAL", status: "OPEN" } 
    }),
  };

  const averageScore = await prisma.scan.aggregate({
    where: { userId: user!.id, status: "COMPLETED", score: { not: null } },
    _avg: { score: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido, {user?.name}
        </p>
      </div>

      {/* Subscription Status */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan {user?.subscription?.plan}</CardTitle>
              <CardDescription>
                {user?.subscription?.scansUsed || 0} de {user?.subscription?.scansLimit} escaneos utilizados este mes
              </CardDescription>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="outline">Actualizar plan</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Escaneos
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedScans} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Puntuación Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageScore._avg.score?.toFixed(0) || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Seguridad general
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Incidentes Abiertos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalIncidents} críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cumplimiento
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">
              ISO 27001
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans & Incidents */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Escaneos Recientes</CardTitle>
            <CardDescription>Tus últimos 5 análisis de seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.scans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay escaneos todavía</p>
                <Link href="/dashboard/scans/new">
                  <Button className="mt-4">Crear primer escaneo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user?.scans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium truncate">{scan.targetUrl}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.score && (
                        <span className={`text-sm font-semibold ${
                          scan.score >= 80 ? "text-green-600" :
                          scan.score >= 60 ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {scan.score}/100
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scan.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        scan.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                        scan.status === "FAILED" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/scans">
                  <Button variant="outline" className="w-full">
                    Ver todos los escaneos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidentes Activos</CardTitle>
            <CardDescription>Incidentes que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.incidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay incidentes abiertos</p>
                <Link href="/dashboard/incidents/new">
                  <Button className="mt-4">Registrar incidente</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user?.incidents.map((incident) => (
                  <div key={incident.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-gray-500">{incident.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      incident.severity === "CRITICAL" ? "bg-red-100 text-red-700" :
                      incident.severity === "HIGH" ? "bg-orange-100 text-orange-700" :
                      incident.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                ))}
                <Link href="/dashboard/incidents">
                  <Button variant="outline" className="w-full">
                    Ver todos los incidentes
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/scans/new">
              <Button className="w-full" size="lg">
                <Shield className="mr-2 h-5 w-5" />
                Nuevo Escaneo
              </Button>
            </Link>
            <Link href="/dashboard/incidents/new">
              <Button className="w-full" size="lg" variant="outline">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Registrar Incidente
              </Button>
            </Link>
            <Link href="/dashboard/compliance">
              <Button className="w-full" size="lg" variant="outline">
                <FileCheck className="mr-2 h-5 w-5" />
                Ver Cumplimiento
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
