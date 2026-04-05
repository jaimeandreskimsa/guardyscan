"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield, AlertTriangle, Activity, Clock, Bell, RefreshCw,
  BarChart3, Info, ShieldCheck, Gauge, Siren, Eye,
  Globe, Lock, Server, Network, CheckCircle, XCircle,
  Bug
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface ScanData {
  id: string;
  targetUrl: string;
  status: string;
  score: number | null;
  createdAt: string;
  completedAt?: string;
  sslInfo?: any;
  securityHeaders?: any;
  vulnerabilities?: any[];
  technologies?: any[];
  dnsRecords?: any;
  openPorts?: any[];
  firewall?: any;
  performance?: any;
  serverInfo?: any;
}

interface SecurityFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  icon: any;
}

// ─── Helpers ─────────────────────────────────────────────────────

function extractFindingsFromScans(scans: ScanData[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  scans.filter(s => s.status === 'COMPLETED').forEach(scan => {
    const ts = scan.completedAt || scan.createdAt;
    const src = scan.targetUrl;

    // SSL issues
    if (scan.sslInfo && !scan.sslInfo.valid) {
      findings.push({
        id: `ssl-${scan.id}`, severity: 'CRITICAL', category: 'ssl',
        title: 'Certificado SSL inválido',
        description: `El certificado SSL de ${src} no es válido. Los datos en tránsito están expuestos.`,
        source: src, timestamp: ts, icon: Lock,
      });
    } else if (scan.sslInfo?.daysRemaining != null && scan.sslInfo.daysRemaining < 30) {
      findings.push({
        id: `ssl-exp-${scan.id}`, severity: 'HIGH', category: 'ssl',
        title: 'Certificado SSL próximo a expirar',
        description: `El certificado de ${src} expira en ${scan.sslInfo.daysRemaining} días.`,
        source: src, timestamp: ts, icon: Lock,
      });
    }

    // Security headers
    const headerKeys = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy', 'x-xss-protection', 'referrer-policy'];
    const missingHeaders = headerKeys.filter(h => !scan.securityHeaders?.headers?.[h]);
    if (missingHeaders.length > 0) {
      const sev = missingHeaders.length >= 4 ? 'HIGH' : missingHeaders.length >= 2 ? 'MEDIUM' : 'LOW';
      findings.push({
        id: `headers-${scan.id}`, severity: sev as any, category: 'headers',
        title: `${missingHeaders.length} cabeceras de seguridad ausentes`,
        description: `Faltan: ${missingHeaders.map(h => h.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')).join(', ')}`,
        source: src, timestamp: ts, icon: Shield,
      });
    }

    // Vulnerabilities from scan
    (scan.vulnerabilities || []).forEach((v: any, i: number) => {
      findings.push({
        id: `vuln-${scan.id}-${i}`, severity: (v.severity || 'MEDIUM') as any, category: 'vulnerability',
        title: v.title || 'Vulnerabilidad detectada',
        description: v.description || v.recommendation || 'Sin descripción',
        source: src, timestamp: ts, icon: Bug,
      });
    });

    // Firewall
    if (scan.firewall) {
      if (!scan.firewall.waf || scan.firewall.waf === 'No detectado') {
        findings.push({
          id: `waf-${scan.id}`, severity: 'MEDIUM', category: 'firewall',
          title: 'Sin Web Application Firewall (WAF)',
          description: `No se detectó WAF en ${src}. La aplicación está expuesta a ataques directos.`,
          source: src, timestamp: ts, icon: Shield,
        });
      }
      if (!scan.firewall.ddos) {
        findings.push({
          id: `ddos-${scan.id}`, severity: 'MEDIUM', category: 'firewall',
          title: 'Sin protección Anti-DDoS',
          description: `${src} no tiene protección contra ataques de denegación de servicio.`,
          source: src, timestamp: ts, icon: Network,
        });
      }
    }

    // Open ports
    const ports = scan.openPorts || [];
    if (ports.length > 3) {
      findings.push({
        id: `ports-${scan.id}`, severity: ports.length > 6 ? 'HIGH' : 'MEDIUM', category: 'network',
        title: `${ports.length} puertos abiertos detectados`,
        description: `Puertos expuestos en ${src}: ${ports.map((p: any) => p.port).join(', ')}`,
        source: src, timestamp: ts, icon: Server,
      });
    }
  });

  const sevOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  findings.sort((a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9));
  return findings;
}

function calculateRiskFromScans(scans: ScanData[]) {
  const completed = scans.filter(s => s.status === 'COMPLETED' && s.score != null);
  if (completed.length === 0) return { total: 0, avgScore: 0, scansCount: 0 };
  const avgScore = Math.round(completed.reduce((s, sc) => s + (sc.score || 0), 0) / completed.length);
  // total = same security score shown in scanner (no inversion — both modules use same scale)
  return { total: avgScore, avgScore, scansCount: completed.length };
}

// Higher score = better security (same scale as Centro de Análisis)
function getRiskLevel(score: number) {
  if (score >= 85) return { label: 'Óptimo',    color: 'text-emerald-600', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-500', icon: ShieldCheck };
  if (score >= 70) return { label: 'Moderado',  color: 'text-amber-600',   bg: 'bg-amber-500',   bgLight: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-500',   icon: AlertTriangle };
  if (score >= 50) return { label: 'Alto',      color: 'text-orange-600',  bg: 'bg-orange-500',  bgLight: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-500',  icon: AlertTriangle };
  if (score >= 1)  return { label: 'Crítico',   color: 'text-red-600',     bg: 'bg-red-500',     bgLight: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-500',     icon: Siren };
  return             { label: 'Sin datos',  color: 'text-gray-500',    bg: 'bg-gray-400',    bgLight: 'bg-gray-50 dark:bg-gray-800',          border: 'border-gray-300',    icon: ShieldCheck };
}

const SEVERITY_CONFIG: Record<string, { color: string; badge: string; weight: number }> = {
  CRITICAL: { color: 'text-red-600', badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', weight: 10 },
  HIGH: { color: 'text-orange-600', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', weight: 7 },
  MEDIUM: { color: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', weight: 4 },
  LOW: { color: 'text-blue-600', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', weight: 1 },
  INFO: { color: 'text-gray-600', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', weight: 0 },
};

// ─── Main Component ──────────────────────────────────────────────
export default function SiemPage() {
  const { data: session } = useSession();
  const [scans, setScans] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'history'>('overview');
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/scans?limit=50");
      const data = await res.json();
      setScans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Computed ──────────────────────────────────────────────
  const completedScans = scans.filter(s => s.status === 'COMPLETED');
  const findings = useMemo(() => extractFindingsFromScans(scans), [scans]);
  const riskData = useMemo(() => calculateRiskFromScans(scans), [scans]);
  const riskLevel = getRiskLevel(riskData.total);
  const RiskIcon = riskLevel.icon;

  const severityCount = {
    CRITICAL: findings.filter(f => f.severity === 'CRITICAL').length,
    HIGH: findings.filter(f => f.severity === 'HIGH').length,
    MEDIUM: findings.filter(f => f.severity === 'MEDIUM').length,
    LOW: findings.filter(f => f.severity === 'LOW').length,
  };

  const categoryCount = findings.reduce((acc: Record<string, number>, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = useMemo(() => {
    const byDate: Record<string, { date: string; critical: number; high: number; medium: number; low: number }> = {};
    findings.forEach(f => {
      const d = new Date(f.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      if (!byDate[d]) byDate[d] = { date: d, critical: 0, high: 0, medium: 0, low: 0 };
      const key = f.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
      if (byDate[d][key] !== undefined) byDate[d][key]++;
    });
    return Object.values(byDate).slice(-10);
  }, [findings]);

  const tabs = [
    { id: 'overview' as const, label: 'Panel General', icon: Gauge, count: undefined },
    { id: 'findings' as const, label: 'Hallazgos', icon: AlertTriangle, count: findings.length },
    { id: 'history' as const, label: 'Historial', icon: Clock, count: completedScans.length },
  ];

  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    ssl: { label: 'Certificados SSL', icon: Lock, color: 'text-red-600' },
    headers: { label: 'Cabeceras HTTP', icon: Shield, color: 'text-indigo-600' },
    vulnerability: { label: 'Vulnerabilidades', icon: Bug, color: 'text-orange-600' },
    firewall: { label: 'Protección Perimetral', icon: Shield, color: 'text-rose-600' },
    network: { label: 'Servicios de Red', icon: Server, color: 'text-amber-600' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Monitoreo de Seguridad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Estado de seguridad basado en los análisis realizados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Risk Score Hero */}
      <Card className={`border-2 ${riskLevel.border} shadow-lg`}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score circle */}
            <div className="flex flex-col items-center justify-center">
              {/* Clickable score circle */}
              <button
                onClick={() => setShowScoreInfo(v => !v)}
                className="relative w-36 h-36 cursor-pointer focus:outline-none group"
                title="Ver explicación de la puntuación"
              >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="12" className="dark:stroke-gray-700" />
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="12" strokeLinecap="round"
                    className={riskLevel.bg.replace('bg-', 'stroke-')}
                    strokeDasharray={`${(riskData.total / 100) * 327} 327`}
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${riskLevel.color}`}>{riskData.total}</span>
                  <span className="text-xs text-gray-500 font-medium">/ 100</span>
                </div>
                {/* Hover hint ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-400/50 transition-all duration-200" />
              </button>

              <div className={`mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer ${riskLevel.bgLight}`} onClick={() => setShowScoreInfo(v => !v)}>
                <RiskIcon className={`h-4 w-4 ${riskLevel.color}`} />
                <span className={`text-sm font-bold ${riskLevel.color}`}>Seguridad {riskLevel.label}</span>
                <Info className="h-3.5 w-3.5 text-gray-400 ml-1" />
              </div>
              {riskData.scansCount > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Basado en {riskData.scansCount} escaneo{riskData.scansCount > 1 ? 's' : ''} · igual al Centro de Análisis
                </p>
              )}

              {/* Score explanation — inline, expands on click */}
              {showScoreInfo && (
                <div className="mt-4 w-full max-w-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Cómo se calcula</span>
                    <button onClick={() => setShowScoreInfo(false)} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Parte de <strong className="text-gray-800 dark:text-gray-200">100 puntos</strong>, se descuenta por cada problema:
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {[
                      { label: 'Cabecera HTTP faltante', deduction: '−5 pts', color: 'text-amber-600' },
                      { label: 'Vulnerabilidad detectada', deduction: '−10 pts', color: 'text-orange-600' },
                      { label: 'SSL inválido', deduction: '−20 pts', color: 'text-red-600' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                        <span className={`font-bold ${item.color}`}>{item.deduction}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-800 pt-3 space-y-1">
                    {[
                      { range: '85–100', label: 'Óptimo',   color: 'bg-emerald-500' },
                      { range: '70–84',  label: 'Moderado', color: 'bg-amber-500' },
                      { range: '50–69',  label: 'Alto',     color: 'bg-orange-500' },
                      { range: '0–49',   label: 'Crítico',  color: 'bg-red-500' },
                    ].map(r => (
                      <div key={r.range} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.color}`} />
                        <span className="text-gray-500 dark:text-gray-400 w-14">{r.range}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Severity breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Hallazgos por Severidad</h3>
              <div className="space-y-3">
                {([
                  { key: 'CRITICAL', label: 'Críticos', color: 'bg-red-500' },
                  { key: 'HIGH', label: 'Altos', color: 'bg-orange-500' },
                  { key: 'MEDIUM', label: 'Medios', color: 'bg-amber-500' },
                  { key: 'LOW', label: 'Bajos', color: 'bg-blue-500' },
                ] as const).map(({ key, label, color }) => {
                  const count = severityCount[key];
                  const total = findings.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                        <span className={`font-bold ${SEVERITY_CONFIG[key].color}`}>{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  La puntuación es la misma que muestra el Centro de Análisis.
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Hallazgos por Categoría</h3>
              {Object.keys(categoryCount).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                    const info = categoryLabels[cat] || { label: cat, icon: AlertTriangle, color: 'text-gray-600' };
                    const Icon = info.icon;
                    return (
                      <div key={cat} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <span className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${info.color}`} />
                          <span className="text-gray-700 dark:text-gray-300">{info.label}</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">Sin hallazgos</p>
                  <p className="text-xs text-gray-500 mt-1">Realiza un escaneo para ver resultados</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Escaneos" value={completedScans.length} icon={<Globe className="h-5 w-5 text-blue-600" />}
          bgGrad="from-blue-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Completados" />
        <StatCard title="Hallazgos Críticos" value={severityCount.CRITICAL} icon={<Siren className="h-5 w-5 text-red-600" />}
          bgGrad="from-red-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Acción urgente" />
        <StatCard title="Hallazgos Altos" value={severityCount.HIGH} icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
          bgGrad="from-orange-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Prioridad alta" />
        <StatCard title="Puntuación" value={riskData.avgScore} icon={<BarChart3 className="h-5 w-5 text-emerald-600" />}
          bgGrad="from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Score de seguridad" />
        <StatCard title="Total Hallazgos" value={findings.length} icon={<Eye className="h-5 w-5 text-purple-600" />}
          bgGrad="from-purple-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Detectados" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700'
                }`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { sev: 'CRITICAL', label: 'Crítico', bl: 'border-l-red-500', bg: 'bg-red-50/50 dark:bg-red-900/10', tc: 'text-red-600' },
              { sev: 'HIGH', label: 'Alto', bl: 'border-l-orange-500', bg: 'bg-orange-50/50 dark:bg-orange-900/10', tc: 'text-orange-600' },
              { sev: 'MEDIUM', label: 'Medio', bl: 'border-l-amber-500', bg: 'bg-amber-50/50 dark:bg-amber-900/10', tc: 'text-amber-600' },
              { sev: 'LOW', label: 'Bajo', bl: 'border-l-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10', tc: 'text-blue-600' },
            ] as const).map(({ sev, label, bl, bg, tc }) => (
              <div key={sev} className={`p-4 rounded-xl border-l-4 ${bl} ${bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
                  <span className={`text-2xl font-bold ${tc}`}>{severityCount[sev]}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">hallazgos detectados</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Chart */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Hallazgos por Escaneo
                </CardTitle>
                <CardDescription>Distribución por fecha de análisis</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <FindingsBarChart data={chartData} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Realiza escaneos para ver datos</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sites summary */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Estado por Sitio Analizado
                </CardTitle>
                <CardDescription>Resumen de cada URL escaneada</CardDescription>
              </CardHeader>
              <CardContent>
                {completedScans.length > 0 ? (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {completedScans.slice(0, 10).map(scan => {
                      const vulnCount = (scan.vulnerabilities || []).length;
                      const sslOk = scan.sslInfo?.valid;
                      const score = scan.score;
                      return (
                        <div key={scan.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                            score != null && score >= 85 ? 'bg-emerald-500' : score != null && score >= 70 ? 'bg-amber-500' : score != null && score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}>{score ?? '—'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{scan.targetUrl}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {sslOk ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                SSL
                              </span>
                              <span>{vulnCount} vuln{vulnCount !== 1 ? 's' : ''}</span>
                              <span>{new Date(scan.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Globe className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay escaneos completados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Critical findings */}
          {findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length > 0 && (
            <Card className="border-none shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Siren className="h-5 w-5 text-red-600" />
                  Hallazgos Críticos y Altos
                </CardTitle>
                <CardDescription>Requieren atención prioritaria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').slice(0, 15).map(finding => (
                    <FindingRow key={finding.id} finding={finding} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB: FINDINGS */}
      {activeTab === 'findings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Todos los Hallazgos de Seguridad
            </CardTitle>
            <CardDescription>Generados automáticamente a partir de los escaneos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {findings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShieldCheck className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Sin hallazgos</p>
                <p className="text-sm mt-1">Realiza un escaneo en el Scanner para ver hallazgos aquí</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                {findings.map(finding => (
                  <FindingRow key={finding.id} finding={finding} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB: HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Historial de Escaneos
            </CardTitle>
            <CardDescription>Todos los análisis realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {scans.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Globe className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Sin escaneos</p>
                <p className="text-sm mt-1">Ve al Scanner para realizar tu primer análisis</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                {scans.map(scan => {
                  const vulnCount = (scan.vulnerabilities || []).length;
                  const criticals = (scan.vulnerabilities || []).filter((v: any) => v.severity === 'CRITICAL').length;
                  const highs = (scan.vulnerabilities || []).filter((v: any) => v.severity === 'HIGH').length;
                  const sslOk = scan.sslInfo?.valid;
                  const headersActive = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy', 'x-xss-protection', 'referrer-policy']
                    .filter(h => scan.securityHeaders?.headers?.[h]).length;
                  return (
                    <div key={scan.id} className={`p-4 rounded-xl border ${
                      scan.status === 'COMPLETED' ? 'border-gray-200 dark:border-gray-700' : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-sm truncate">{scan.targetUrl}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              scan.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              scan.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {scan.status === 'COMPLETED' ? '✓ Completado' : scan.status === 'PROCESSING' ? '⏳ En progreso' : scan.status}
                            </span>
                          </div>
                          {scan.status === 'COMPLETED' && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                {sslOk ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                SSL {sslOk ? 'válido' : 'inválido'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />{headersActive}/6 cabeceras
                              </span>
                              <span className="flex items-center gap-1">
                                <Bug className="h-3 w-3" />
                                {vulnCount} vuln{vulnCount !== 1 ? 's' : ''}
                                {criticals > 0 && <span className="text-red-600 font-bold ml-1">({criticals} críticas)</span>}
                                {criticals === 0 && highs > 0 && <span className="text-orange-600 font-bold ml-1">({highs} altas)</span>}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(scan.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                          )}
                        </div>
                        {scan.score != null && (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                            scan.score >= 85 ? 'bg-emerald-500' : scan.score >= 70 ? 'bg-amber-500' : scan.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}>{scan.score}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

function FindingRow({ finding }: { finding: SecurityFinding }) {
  const config = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.INFO;
  const Icon = finding.icon;
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
      <div className={`mt-0.5 p-2 rounded-lg ${
        finding.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
        finding.severity === 'HIGH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
        finding.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
        'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm">{finding.title}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
            {finding.severity === 'CRITICAL' ? 'Crítico' : finding.severity === 'HIGH' ? 'Alto' : finding.severity === 'MEDIUM' ? 'Medio' : 'Bajo'}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{finding.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{finding.source}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(finding.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
      </div>
      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0 ${
        finding.severity === 'CRITICAL' ? 'bg-red-600' : finding.severity === 'HIGH' ? 'bg-orange-500' : finding.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
      }`}>
        <span className="text-sm font-bold">{config.weight * 10}</span>
        <span className="text-[8px] leading-none">risk</span>
      </div>
    </div>
  );
}

function FindingsBarChart({ data }: { data: { date: string; critical: number; high: number; medium: number; low: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.critical + d.high + d.medium + d.low), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const total = d.critical + d.high + d.medium + d.low;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{d.date}</span>
            <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {d.critical > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(d.critical / maxVal) * 100}%` }} />}
              {d.high > 0 && <div className="bg-orange-500 transition-all" style={{ width: `${(d.high / maxVal) * 100}%` }} />}
              {d.medium > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${(d.medium / maxVal) * 100}%` }} />}
              {d.low > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(d.low / maxVal) * 100}%` }} />}
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-6 text-right">{total}</span>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" />Crítico</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" />Alto</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" />Medio</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Bajo</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgGrad, sub }: {
  title: string; value: number; icon: React.ReactNode; bgGrad: string; sub: string;
}) {
  return (
    <Card className={`border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br ${bgGrad}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</span>
          <div className="p-1.5 rounded-lg bg-white/60 dark:bg-gray-700/60">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
