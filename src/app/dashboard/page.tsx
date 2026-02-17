import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, Activity, AlertTriangle, FileCheck, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Users, Lock, Zap, Eye, ChevronRight,
  BarChart3, Target, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles,
  Globe, Server, Database, Cloud, Wifi, Bug, ShieldAlert, TrendingUpIcon,
  Calendar, Bell, Layers, Network, HardDrive, Code, UserPlus, Mail
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SecurityTrendChart } from "@/components/dashboard/security-trend-chart";
import { IncidentPieChart } from "@/components/dashboard/incident-pie-chart";
import { ScanActivityChart } from "@/components/dashboard/scan-activity-chart";
import { MonthlyReportButton } from "@/components/dashboard/MonthlyReportButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscription: true,
      scans: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      incidents: {
        where: { status: "OPEN" },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Ejecutar todas las queries en paralelo para mejor performance
  const [
    stats,
    averageScore,
    incidentsBySeverity,
    allScans,
    totalVulnerabilities,
    closedVulnerabilities,
    criticalVulnerabilities,
    recentThreats,
    recentVulnerabilities,
    closedIncidents,
    processedIncidents,
  ] = await Promise.all([
    // Stats
    Promise.all([
      prisma.scan.count({ where: { userId: user.id } }),
      prisma.scan.count({ where: { userId: user.id, status: "COMPLETED" } }),
      prisma.incident.count({ where: { userId: user.id, status: "OPEN" } }),
      prisma.incident.count({ where: { userId: user.id, severity: "CRITICAL", status: "OPEN" } }),
    ]).then(([totalScans, completedScans, openIncidents, criticalIncidents]) => ({
      totalScans,
      completedScans,
      openIncidents,
      criticalIncidents,
    })),
    
    // Average score
    prisma.scan.aggregate({
      where: { userId: user.id, status: "COMPLETED", score: { not: null } },
      _avg: { score: true },
    }),
    
    // Incidents by severity
    prisma.incident.groupBy({
      by: ['severity'],
      where: { userId: user.id, status: 'OPEN' },
      _count: { severity: true },
    }),
    
    // All scans for unique domains
    prisma.scan.findMany({
      where: { userId: user.id },
      select: { targetUrl: true },
    }),
    
    // Vulnerabilities stats
    prisma.vulnerability.count({ where: { userId: user.id } }),
    prisma.vulnerability.count({ where: { userId: user.id, status: "RESOLVED" } }),
    prisma.vulnerability.count({ where: { userId: user.id, severity: "CRITICAL" } }),
    
    // Recent threats
    prisma.incident.findMany({
      where: { 
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    
    // Recent vulnerabilities
    prisma.vulnerability.findMany({
      where: { 
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    
    // Closed incidents for avg response time
    prisma.incident.findMany({
      where: { 
        userId: user.id,
        status: "RESOLVED",
        resolvedAt: { not: null }
      },
      select: {
        detectedAt: true,
        resolvedAt: true,
      },
      take: 50,
    }),
    
    // Processed incidents last 30 days
    prisma.incident.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
  ]);

  // Process unique domains
  const uniqueDomains = Array.from(new Set(allScans.map(s => {
    try {
      return new URL(s.targetUrl).hostname;
    } catch {
      return s.targetUrl;
    }
  })));

  // Calculate avg response time
  const avgResponseTime = closedIncidents.length > 0
    ? closedIncidents.reduce((acc, inc) => {
        const diff = inc.resolvedAt!.getTime() - inc.detectedAt.getTime();
        return acc + diff;
      }, 0) / closedIncidents.length / (1000 * 60 * 60)
    : 0;

  // Get SIEM alerts count
  const openAlerts = await prisma.securityAlert.count({
    where: { userId: user.id, status: "OPEN" }
  }).catch(() => 0);

  const highRiskEvents = await prisma.securityEvent.count({
    where: { 
      userId: user.id, 
      severity: { in: ["HIGH", "CRITICAL"] },
      timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  }).catch(() => 0);

  const activeThreats = await prisma.incident.count({
    where: { userId: user.id, status: "OPEN", severity: "CRITICAL" }
  }).catch(() => 0);

  // Most recent high-risk event for urgent action block
  const urgentEvent = await prisma.securityEvent.findFirst({
    where: { 
      userId: user.id, 
      severity: { in: ["HIGH", "CRITICAL"] },
    },
    orderBy: { timestamp: "desc" },
  }).catch(() => null);

  // Get open vulnerabilities for suggested incidents
  const openCriticalVulns = await prisma.vulnerability.findMany({
    where: { 
      userId: user.id, 
      status: { in: ["OPEN", "IN_PROGRESS"] },
      severity: { in: ["CRITICAL", "HIGH"] }
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  }).catch(() => []);

  // Determine security status level
  const getSecurityStatus = () => {
    if (activeThreats > 0 || stats.criticalIncidents > 0) return { level: 'CRITICAL', color: 'red', emoji: '🔴', text: 'Crítico', action: 'Requiere atención inmediata' };
    if (highRiskEvents > 0 || stats.openIncidents > 0) return { level: 'WARNING', color: 'amber', emoji: '🟡', text: 'Acción requerida', action: `${highRiskEvents} evento${highRiskEvents !== 1 ? 's' : ''} con riesgo ALTO` };
    return { level: 'OK', color: 'emerald', emoji: '🟢', text: 'Operativo', action: 'Sin amenazas detectadas' };
  };
  const securityStatus = getSecurityStatus();

  // Get last 7 days of scans for activity chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const scanActivity = await Promise.all(
    last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = await prisma.scan.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: date,
            lt: nextDay,
          },
        },
      });
      
      return {
        date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        scans: count,
      };
    })
  );

  // Calculate trend
  const recentScans = user?.scans.slice(0, 5).filter(s => s.score);
  const olderScans = user?.scans.slice(5, 10).filter(s => s.score);
  const recentAvg = (recentScans?.reduce((acc, s) => acc + (s.score || 0), 0) || 0) / (recentScans?.length || 1);
  const olderAvg = (olderScans?.reduce((acc, s) => acc + (s.score || 0), 0) || 0) / (olderScans?.length || 1);
  const trend = recentAvg - olderAvg;

  const securityScore = averageScore._avg.score?.toFixed(0) || 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                Panel de Control
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Bienvenido, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-slate-400 text-lg">
                Tu infraestructura de seguridad en tiempo real
              </p>
              <div className="mt-4">
                <MonthlyReportButton />
              </div>
            </div>
            {/* Security Score Circle */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreBackground(Number(securityScore))} p-1`}>
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{securityScore}</div>
                      <div className="text-xs text-slate-400">Security Score</div>
                    </div>
                  </div>
                </div>
                {trend > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-sm text-slate-400 mb-1">Plan Actual</div>
                <div className="text-xl font-semibold text-white">{user?.subscription?.plan}</div>
                <Link href="/dashboard/billing" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
                  Gestionar plan <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Usage Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-300">Uso de escaneos este mes</span>
              <span className="text-sm font-medium">
                {user?.subscription?.scansUsed || 0} / {(user?.subscription?.plan === "FREE" || user?.subscription?.scansLimit === -1) ? "∞" : (user?.subscription?.scansLimit || 0)}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{
                  width:
                    user?.subscription?.plan === "FREE" || user?.subscription?.scansLimit === -1
                      ? "10%"
                      : `${Math.min(((user?.subscription?.scansUsed || 0) / (user?.subscription?.scansLimit || 1)) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Semaphore - PPT: ESTADO GENERAL DE SEGURIDAD */}
      <div className={`rounded-2xl border-2 p-6 ${
        securityStatus.level === 'CRITICAL' 
          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' 
          : securityStatus.level === 'WARNING'
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
          : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl`}>{securityStatus.emoji}</div>
            <div>
              <h2 className={`text-xl font-bold ${
                securityStatus.level === 'CRITICAL' ? 'text-red-800 dark:text-red-200' :
                securityStatus.level === 'WARNING' ? 'text-amber-800 dark:text-amber-200' :
                'text-emerald-800 dark:text-emerald-200'
              }`}>
                ESTADO GENERAL DE SEGURIDAD: {securityStatus.text}
              </h2>
              <p className={`text-sm mt-1 ${
                securityStatus.level === 'CRITICAL' ? 'text-red-700 dark:text-red-300' :
                securityStatus.level === 'WARNING' ? 'text-amber-700 dark:text-amber-300' :
                'text-emerald-700 dark:text-emerald-300'
              }`}>{securityStatus.action}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-slate-900 dark:text-white">{highRiskEvents}</div>
              <div className="text-slate-500 text-xs">Eventos alto riesgo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-slate-900 dark:text-white">{openAlerts}</div>
              <div className="text-slate-500 text-xs">Alertas abiertas</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-slate-900 dark:text-white">{activeThreats}</div>
              <div className="text-slate-500 text-xs">Amenazas activas</div>
            </div>
            <Link href="/dashboard/siem">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                Ver resumen diario
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Action Block - PPT: REQUIERE ACCIÓN INMEDIATA */}
      {(urgentEvent || openCriticalVulns.length > 0) && (
        <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-1">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-4">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
              ⚠ REQUIERE ACCIÓN INMEDIATA
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {urgentEvent && (
                <div className="border border-red-200 dark:border-red-800 rounded-xl p-4 bg-red-50/50 dark:bg-red-900/10">
                  <div className="text-sm text-slate-500 mb-1">Evento detectado:</div>
                  <div className="font-semibold text-slate-900 dark:text-white mb-2">
                    {(urgentEvent as any).message || (urgentEvent as any).eventType || 'Evento de seguridad crítico'}
                  </div>
                  <div className="text-sm text-slate-500 mb-1">Detectado por: <span className="font-medium text-slate-700 dark:text-slate-300">SIEM + ML</span></div>
                  <div className="text-sm text-slate-500 mb-3">Nivel de riesgo: <span className="font-bold text-red-600">ALTO</span></div>
                  <div className="flex gap-2">
                    <Link href="/dashboard/incidents">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Crear incidente
                      </Button>
                    </Link>
                    <Link href="/dashboard/siem">
                      <Button size="sm" variant="outline">
                        Investigar evento
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              {openCriticalVulns.slice(0, 2).map((vuln) => (
                <div key={vuln.id} className="border border-orange-200 dark:border-orange-800 rounded-xl p-4 bg-orange-50/50 dark:bg-orange-900/10">
                  <div className="text-sm text-slate-500 mb-1">Incidente sugerido:</div>
                  <div className="font-semibold text-slate-900 dark:text-white mb-2">
                    {vuln.cveId || vuln.title} — {vuln.title}
                  </div>
                  <div className="text-sm text-slate-500 mb-1">Severidad: <span className="font-bold text-orange-600">{vuln.severity === 'CRITICAL' ? 'Crítica' : 'Alta'}</span></div>
                  <div className="text-sm text-slate-500 mb-3">Detectado: <span className="font-medium text-slate-700 dark:text-slate-300">Scanner</span></div>
                  <div className="flex gap-2">
                    <Link href="/dashboard/incidents">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                        Crear incidente
                      </Button>
                    </Link>
                    <Link href="/dashboard/vulnerabilities">
                      <Button size="sm" variant="outline">
                        Ver vulnerabilidad
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Scans */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3" />
                +12%
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalScans}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Escaneos</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {stats.completedScans} completados
            </div>
          </div>
        </div>

        {/* Security Score */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                <Lock className="h-5 w-5 text-white" />
              </div>
              {trend !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  trend > 0 
                    ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" 
                    : "text-red-500 bg-red-50 dark:bg-red-900/30"
                }`}>
                  {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <div className={`text-3xl font-bold ${getScoreColor(Number(securityScore))}`}>
                {securityScore}
              </div>
              <span className="text-sm text-slate-400">/100</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Puntuación Seguridad</div>
            <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getScoreBackground(Number(securityScore))}`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              {stats.criticalIncidents > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full animate-pulse">
                  <AlertCircle className="h-3 w-3" />
                  {stats.criticalIncidents} crítico{stats.criticalIncidents > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.openIncidents}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Incidentes Abiertos</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Requieren atención
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                <FileCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-full">
                ISO 27001
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              65%
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Cumplimiento</div>
            <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Actividad de Escaneos</h3>
              <p className="text-sm text-slate-500">Últimos 7 días</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                Escaneos
              </span>
            </div>
          </div>
          <ScanActivityChart data={scanActivity} />
        </div>

        {/* Incidents Pie */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Incidentes por Severidad</h3>
            <p className="text-sm text-slate-500">Distribución actual</p>
          </div>
          <IncidentPieChart data={incidentsBySeverity} />
        </div>
      </div>

      {/* Security Trend */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tendencia de Seguridad</h3>
            <p className="text-sm text-slate-500">Evolución de puntuación en los últimos escaneos</p>
          </div>
          <Link href="/dashboard/scans">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              Ver historial <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <SecurityTrendChart scans={user?.scans.slice(0, 15) || []} />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Scans */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Escaneos Recientes</h3>
                <p className="text-sm text-slate-500">Últimos análisis de seguridad</p>
              </div>
              <Link href="/dashboard/scans">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {user?.scans.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white mb-1">Sin escaneos</p>
                <p className="text-sm text-slate-500 mb-4">Comienza a proteger tu infraestructura</p>
                <Link href="/dashboard/scanner">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25">
                    Iniciar Scanner
                  </Button>
                </Link>
              </div>
            ) : (
              user?.scans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      scan.status === "COMPLETED" 
                        ? "bg-emerald-100 dark:bg-emerald-900/30" 
                        : scan.status === "PROCESSING"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      {scan.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : scan.status === "PROCESSING" ? (
                        <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                        {scan.targetUrl}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(scan.createdAt).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {scan.score && (
                      <div className={`text-lg font-bold ${
                        scan.score >= 80 ? "text-emerald-500" :
                        scan.score >= 60 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {scan.score}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Incidentes Activos</h3>
                <p className="text-sm text-slate-500">Requieren atención</p>
              </div>
              <Link href="/dashboard/incidents">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {user?.incidents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white mb-1">Todo en orden</p>
                <p className="text-sm text-slate-500">No hay incidentes que requieran atención</p>
              </div>
            ) : (
              user?.incidents.map((incident) => (
                <div key={incident.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      incident.severity === "CRITICAL" ? "bg-red-100 dark:bg-red-900/30" :
                      incident.severity === "HIGH" ? "bg-orange-100 dark:bg-orange-900/30" :
                      incident.severity === "MEDIUM" ? "bg-amber-100 dark:bg-amber-900/30" :
                      "bg-blue-100 dark:bg-blue-900/30"
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        incident.severity === "CRITICAL" ? "text-red-600" :
                        incident.severity === "HIGH" ? "text-orange-600" :
                        incident.severity === "MEDIUM" ? "text-amber-600" :
                        "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{incident.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{incident.category}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">
                          {new Date(incident.detectedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      incident.severity === "CRITICAL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      incident.severity === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      incident.severity === "MEDIUM" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 border border-slate-100 dark:border-slate-700">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Acciones Rápidas</h3>
          <p className="text-sm text-slate-500">Accede rápidamente a las funciones principales</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/scanner" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 w-fit mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Scanner</h4>
                <p className="text-sm text-slate-500">Analizar activos</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/siem" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 border-2 border-transparent hover:border-violet-500 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 w-fit mb-4 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">SIEM</h4>
                <p className="text-sm text-slate-500">Monitoreo en vivo</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/compliance" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 border-2 border-transparent hover:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 w-fit mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <FileCheck className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Cumplimiento</h4>
                <p className="text-sm text-slate-500">ISO 27001</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/risk-management" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 border-2 border-transparent hover:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 w-fit mb-4 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Riesgos</h4>
                <p className="text-sm text-slate-500">Gestión integral</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/committee" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 border-2 border-transparent hover:border-pink-500 transition-all duration-300 shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 w-fit mb-4 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Comité</h4>
                <p className="text-sm text-slate-500">Ciberseguridad</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Committee Members Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Comité de Ciberseguridad</h3>
            <p className="text-sm text-slate-500">Miembros clave y roles</p>
          </div>
          <Link href="/dashboard/committee">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Sección de committee members temporalmente deshabilitada */}
          <div className="col-span-full text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Users className="h-8 w-8 text-white" />
            </div>
            <p className="font-medium text-slate-900 dark:text-white mb-1">Sin miembros del comité</p>
            <p className="text-sm text-slate-500 mb-4">Agrega miembros para gestionar la gobernanza de ciberseguridad</p>
            <Link href="/dashboard/committee">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/25">
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Miembros
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Infrastructure & Assets Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Assets Summary */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Activos Monitoreados</h3>
              <p className="text-sm text-slate-500">Infraestructura actual</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Dominios</p>
                  <p className="text-xs text-slate-500">Activos web</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{uniqueDomains.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Server className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Escaneos</p>
                  <p className="text-xs text-slate-500">Análisis realizados</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalScans}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Database className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Vulnerabilidades</p>
                  <p className="text-xs text-slate-500">Detectadas</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{totalVulnerabilities}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <Cloud className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Críticas</p>
                  <p className="text-xs text-slate-500">Requieren atención</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{criticalVulnerabilities}</span>
            </div>
          </div>
        </div>

        {/* Threat Intelligence */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inteligencia de Amenazas</h3>
              <p className="text-sm text-slate-500">Últimas 24 horas</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/25">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            {recentThreats.length === 0 && recentVulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Sin amenazas recientes</p>
                <p className="text-xs text-slate-500 mt-1">Todo bajo control en las últimas 24h</p>
              </div>
            ) : (
              <>
                {recentThreats.slice(0, 2).map((threat) => (
                  <div key={threat.id} className={`p-4 rounded-xl border ${
                    threat.severity === "CRITICAL" ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800" :
                    threat.severity === "HIGH" ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800" :
                    "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800"
                  }`}>
                    <div className="flex items-start gap-3 mb-2">
                      {threat.severity === "CRITICAL" ? (
                        <Bug className="h-5 w-5 text-red-600 mt-0.5" />
                      ) : threat.severity === "HIGH" ? (
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      ) : (
                        <Wifi className="h-5 w-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          threat.severity === "CRITICAL" ? "text-red-900 dark:text-red-100" :
                          threat.severity === "HIGH" ? "text-orange-900 dark:text-orange-100" :
                          "text-blue-900 dark:text-blue-100"
                        }`}>{threat.title}</p>
                        <p className={`text-xs mt-1 ${
                          threat.severity === "CRITICAL" ? "text-red-700 dark:text-red-300" :
                          threat.severity === "HIGH" ? "text-orange-700 dark:text-orange-300" :
                          "text-blue-700 dark:text-blue-300"
                        }`}>{threat.description?.substring(0, 60) || 'Incidente de seguridad detectado'}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        threat.severity === "CRITICAL" ? "bg-red-600 text-white" :
                        threat.severity === "HIGH" ? "bg-orange-600 text-white" :
                        "bg-blue-600 text-white"
                      }`}>{threat.severity}</span>
                      <span className={`text-xs ${
                        threat.severity === "CRITICAL" ? "text-red-600 dark:text-red-400" :
                        threat.severity === "HIGH" ? "text-orange-600 dark:text-orange-400" :
                        "text-blue-600 dark:text-blue-400"
                      }`}>
                        {new Date(threat.createdAt).toLocaleString('es-ES', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {recentVulnerabilities.slice(0, 1).map((vuln) => (
                  <div key={vuln.id} className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-3 mb-2">
                      <Bug className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{vuln.cveId || vuln.title || 'Vulnerabilidad detectada'}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{vuln.description?.substring(0, 60) || 'Nueva vulnerabilidad en sistema'}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-600 text-white font-medium">{vuln.severity}</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {new Date(vuln.createdAt).toLocaleString('es-ES', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Estado del Sistema</h3>
              <p className="text-sm text-slate-500">Servicios monitoreados</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Red Principal</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operativo
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500">Uptime: 99.8%</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Almacenamiento</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Estable
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[67%] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500">67% utilizado</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">API Gateway</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-600">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  Operativo
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[95%] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500">95% rendimiento</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Firewall</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Activo
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[100%] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500">2,847 amenazas bloqueadas hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Target className="h-6 w-6" />
            </div>
            <TrendingUpIcon className="h-5 w-5 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{closedVulnerabilities}</div>
          <div className="text-sm opacity-90">Vulnerabilidades Cerradas</div>
          <div className="mt-3 text-xs opacity-75">
            {totalVulnerabilities > 0 
              ? `${Math.round((closedVulnerabilities / totalVulnerabilities) * 100)}% resueltas`
              : 'Sin vulnerabilidades'}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 p-6 text-white shadow-lg shadow-violet-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <Clock className="h-5 w-5 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{avgResponseTime > 0 ? avgResponseTime.toFixed(1) : '0'}h</div>
          <div className="text-sm opacity-90">Tiempo Medio de Respuesta</div>
          <div className="mt-3 text-xs opacity-75">
            {closedIncidents.length} incidentes resueltos
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Bell className="h-6 w-6" />
            </div>
            <Activity className="h-5 w-5 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{processedIncidents}</div>
          <div className="text-sm opacity-90">Incidentes Procesados</div>
          <div className="mt-3 text-xs opacity-75">Últimos 30 días</div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Users className="h-6 w-6" />
            </div>
            <CheckCircle2 className="h-5 w-5 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.completedScans}</div>
          <div className="text-sm opacity-90">Escaneos Completados</div>
          <div className="mt-3 text-xs opacity-75">
            {stats.totalScans > 0 
              ? `${Math.round((stats.completedScans / stats.totalScans) * 100)}% éxito`
              : 'Iniciando análisis'}
          </div>
        </div>
      </div>
    </div>
  );
}
