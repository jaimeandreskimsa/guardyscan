"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Eye, AlertTriangle, Activity, Brain, TrendingUp, TrendingDown,
  Clock, Bell, Settings, RefreshCw, Loader2, Zap, Target,
  Flame, BarChart3, ArrowUpRight, ArrowDownRight, Info, ChevronRight,
  ShieldAlert, ShieldCheck, ShieldX, Gauge, Radio, Siren, Bug,
  Globe, Lock, Server, Network, FileWarning, Skull, Search
} from "lucide-react";
import { SecurityEventsChart } from "@/components/siem/security-events-chart";
import { ThreatMapChart } from "@/components/siem/threat-map-chart";
import { AnomalyDetectionChart } from "@/components/siem/anomaly-detection-chart";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────
interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  source: string;
  destination?: string;
  message: string;
  timestamp: string;
  processed: boolean;
  correlated: boolean;
  correlationId?: string;
  details?: any;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  alertType: string;
  createdAt: string;
  resolvedAt?: string;
}

interface ThreatIntel {
  id: string;
  iocType: string;
  iocValue: string;
  threatType: string;
  severity: string;
  confidence: number;
  active: boolean;
  source: string;
  firstSeen: string;
  lastSeen: string;
  description?: string;
  tags?: any;
}

type ActiveTab = 'overview' | 'events' | 'alerts' | 'threats';

// ─── Risk Score Calculation ──────────────────────────────────────
const SEVERITY_WEIGHT: Record<string, number> = {
  CRITICAL: 10,
  HIGH: 7,
  MEDIUM: 4,
  LOW: 1,
};

function calculateRiskScore(
  events: SecurityEvent[],
  alerts: SecurityAlert[],
  threats: ThreatIntel[]
) {
  // 1. Threat score (40% weight) - based on active threats and their severity/confidence
  const activeThreats = threats.filter(t => t.active);
  const maxThreatScore = 100;
  const threatRaw = activeThreats.reduce((sum, t) => {
    const sevWeight = SEVERITY_WEIGHT[t.severity] || 1;
    const confFactor = (t.confidence || 50) / 100;
    return sum + sevWeight * confFactor * 2.5;
  }, 0);
  const threatScore = Math.min(threatRaw, maxThreatScore);

  // 2. Alert score (35% weight) - open/investigating alerts
  const openAlerts = alerts.filter(a => a.status === 'OPEN' || a.status === 'INVESTIGATING');
  const alertRaw = openAlerts.reduce((sum, a) => sum + (SEVERITY_WEIGHT[a.severity] || 1) * 3, 0);
  const alertScore = Math.min(alertRaw, 100);

  // 3. Event velocity score (25% weight) - high severity events in last 24h
  const now = Date.now();
  const recentEvents = events.filter(e => {
    const ts = new Date(e.timestamp).getTime();
    return (now - ts) < 24 * 60 * 60 * 1000;
  });
  const eventRaw = recentEvents.reduce((sum, e) => sum + (SEVERITY_WEIGHT[e.severity] || 1), 0);
  const eventScore = Math.min(eventRaw, 100);

  const composite = Math.round(
    threatScore * 0.40 +
    alertScore * 0.35 +
    eventScore * 0.25
  );

  return {
    total: Math.min(composite, 100),
    threatScore: Math.round(threatScore),
    alertScore: Math.round(alertScore),
    eventScore: Math.round(eventScore),
  };
}

function getRiskLevel(score: number) {
  if (score >= 80) return { label: 'Crítico', color: 'text-red-600', bg: 'bg-red-500', bgLight: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-500', icon: Skull };
  if (score >= 60) return { label: 'Alto', color: 'text-orange-600', bg: 'bg-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-500', icon: Flame };
  if (score >= 40) return { label: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-500', bgLight: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500', icon: AlertTriangle };
  if (score >= 20) return { label: 'Bajo', color: 'text-blue-600', bg: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', icon: ShieldCheck };
  return { label: 'Mínimo', color: 'text-green-600', bg: 'bg-green-500', bgLight: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500', icon: ShieldCheck };
}

// ─── Main Component ──────────────────────────────────────────────
export default function SiemPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [generatingEvent, setGeneratingEvent] = useState(false);

  useEffect(() => {
    loadSiemData();
  }, []);

  useEffect(() => {
    if (!realTimeEnabled) return;
    const interval = setInterval(loadSiemData, 8000);
    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  const loadSiemData = async () => {
    try {
      setLoading(true);
      const [eventsRes, alertsRes, threatsRes] = await Promise.all([
        fetch("/api/siem/events"),
        fetch("/api/siem/alerts"),
        fetch("/api/siem/threats"),
      ]);
      const [eventsData, alertsData, threatsData] = await Promise.all([
        eventsRes.json(),
        alertsRes.json(),
        threatsRes.json(),
      ]);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setThreats(Array.isArray(threatsData) ? threatsData : []);
    } catch (error) {
      console.error("Error loading SIEM data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoEvent = async () => {
    setGeneratingEvent(true);
    try {
      const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const types = ['anomaly', 'login', 'network', 'malware', 'file_access'];
      const messages = [
        'Múltiples intentos de login fallidos detectados',
        'Tráfico de red anómalo hacia IP externa desconocida',
        'Posible exfiltración de datos detectada',
        'Acceso no autorizado a archivo sensible',
        'Escaneo de puertos detectado desde IP sospechosa',
        'Conexión a servidor C2 conocido bloqueada',
        'Ejecución de script malicioso prevenida',
        'Escalamiento de privilegios no autorizado',
      ];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      await fetch("/api/siem/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: types[Math.floor(Math.random() * types.length)],
          severity,
          source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          destination: `10.0.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
          message: messages[Math.floor(Math.random() * messages.length)],
          details: {
            attempts: Math.floor(Math.random() * 50) + 5,
            timeWindow: "5 minutes",
            protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH'][Math.floor(Math.random() * 5)],
          },
        }),
      });
      await loadSiemData();
    } catch (error) {
      console.error("Error generating event:", error);
    } finally {
      setGeneratingEvent(false);
    }
  };

  const generateDemoThreat = async () => {
    setGeneratingEvent(true);
    try {
      const threatTypes = ['malware', 'phishing', 'c2', 'botnet'];
      const iocTypes = ['ip', 'domain', 'hash', 'url'];
      const severities = ['MEDIUM', 'HIGH', 'CRITICAL'];
      const iocType = iocTypes[Math.floor(Math.random() * iocTypes.length)];
      let iocValue = '';
      if (iocType === 'ip') iocValue = `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      else if (iocType === 'domain') iocValue = `malicious-${Date.now()}.evil.com`;
      else if (iocType === 'hash') iocValue = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      else iocValue = `https://evil-${Date.now()}.com/payload`;

      await fetch("/api/siem/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iocType,
          iocValue,
          threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          confidence: Math.floor(Math.random() * 40) + 60,
          source: ['external_feed', 'internal', 'manual'][Math.floor(Math.random() * 3)],
          description: 'IOC detectado por sistema de inteligencia de amenazas',
        }),
      });
      await loadSiemData();
    } catch (error) {
      console.error("Error generating threat:", error);
    } finally {
      setGeneratingEvent(false);
    }
  };

  // ─── Computed data ──────────────────────────────────────────
  const risk = useMemo(() => calculateRiskScore(events, alerts, threats), [events, alerts, threats]);
  const riskLevel = getRiskLevel(risk.total);
  const RiskIcon = riskLevel.icon;

  const criticalAlerts = alerts.filter(a => a.severity === "CRITICAL").length;
  const openAlerts = alerts.filter(a => a.status === "OPEN" || a.status === "INVESTIGATING").length;
  const activeThreats = threats.filter(t => t.active).length;

  const now = Date.now();
  const todayEvents = events.filter(e => (now - new Date(e.timestamp).getTime()) < 24 * 60 * 60 * 1000);
  const criticalEvents24h = todayEvents.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
  const correlatedEvents = events.filter(e => e.correlated).length;

  // Threat breakdown
  const threatsByType = threats.filter(t => t.active).reduce((acc: Record<string, number>, t) => {
    acc[t.threatType] = (acc[t.threatType] || 0) + 1;
    return acc;
  }, {});

  const severityBreakdown = {
    CRITICAL: alerts.filter(a => a.severity === 'CRITICAL' && (a.status === 'OPEN' || a.status === 'INVESTIGATING')).length,
    HIGH: alerts.filter(a => a.severity === 'HIGH' && (a.status === 'OPEN' || a.status === 'INVESTIGATING')).length,
    MEDIUM: alerts.filter(a => a.severity === 'MEDIUM' && (a.status === 'OPEN' || a.status === 'INVESTIGATING')).length,
    LOW: alerts.filter(a => a.severity === 'LOW' && (a.status === 'OPEN' || a.status === 'INVESTIGATING')).length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "HIGH": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "INVESTIGATING": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "RESOLVED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "FALSE_POSITIVE": return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const eventTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <Lock className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'malware': return <Bug className="h-4 w-4" />;
      case 'file_access': return <FileWarning className="h-4 w-4" />;
      case 'anomaly': return <Brain className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const threatTypeEmoji: Record<string, string> = {
    malware: '🦠',
    phishing: '🎣',
    c2: '💀',
    botnet: '🤖',
    spam: '📧',
  };

  // ─── Tab config ─────────────────────────────────────────────
  const tabs: { id: ActiveTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Panel General', icon: Gauge },
    { id: 'events', label: 'Eventos', icon: Activity, count: todayEvents.length },
    { id: 'alerts', label: 'Alertas', icon: Bell, count: openAlerts },
    { id: 'threats', label: 'Amenazas', icon: Target, count: activeThreats },
  ];

  return (
    <div className="space-y-6">
      {/* ════════════ HEADER ════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            Panel SIEM
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión de Seguridad, Amenazas y Riesgo en tiempo real
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/siem/alerts">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />Configurar Alertas
            </Button>
          </Link>
          <Button
            variant={realTimeEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className={realTimeEnabled ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Radio className={`mr-2 h-4 w-4 ${realTimeEnabled ? "animate-pulse" : ""}`} />
            {realTimeEnabled ? "Live ON" : "Live OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadSiemData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ════════════ RISK SCORE HERO ════════════ */}
      <Card className={`border-2 ${riskLevel.border} shadow-lg`}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main score */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="12" className="dark:stroke-gray-700" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className={`${riskLevel.bg.replace('bg-', 'stroke-')}`}
                    strokeDasharray={`${(risk.total / 100) * 327} 327`}
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${riskLevel.color}`}>{risk.total}</span>
                  <span className="text-xs text-gray-500 font-medium">/ 100</span>
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full ${riskLevel.bgLight}`}>
                <RiskIcon className={`h-4 w-4 ${riskLevel.color}`} />
                <span className={`text-sm font-bold ${riskLevel.color}`}>Riesgo {riskLevel.label}</span>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Desglose del Risk Score</h3>

              <div className="space-y-3">
                <ScoreBar label="Amenazas activas" score={risk.threatScore} weight="40%" icon={<Target className="h-4 w-4 text-purple-600" />}
                  detail={`${activeThreats} IOCs activos`} />
                <ScoreBar label="Alertas abiertas" score={risk.alertScore} weight="35%" icon={<Bell className="h-4 w-4 text-orange-600" />}
                  detail={`${openAlerts} sin resolver`} />
                <ScoreBar label="Eventos recientes (24h)" score={risk.eventScore} weight="25%" icon={<Activity className="h-4 w-4 text-blue-600" />}
                  detail={`${todayEvents.length} eventos, ${criticalEvents24h} críticos/altos`} />
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  El Risk Score se calcula ponderando amenazas (40%), alertas (35%) y eventos (25%), considerando severidad y confianza.
                </p>
              </div>
            </div>

            {/* Quick actions / threat summary */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Amenazas por tipo</h3>
              {Object.keys(threatsByType).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(threatsByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{threatTypeEmoji[type] || '⚠️'}</span>
                        <span className="capitalize">{type}</span>
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <ShieldCheck className="h-8 w-8 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-green-600 font-medium">Sin amenazas activas</p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={generateDemoEvent} disabled={generatingEvent}>
                  {generatingEvent ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                  Simular Evento
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={generateDemoThreat} disabled={generatingEvent}>
                  {generatingEvent ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Target className="h-3 w-3 mr-1" />}
                  Simular Amenaza
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ════════════ STAT CARDS ════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Alertas Críticas" value={criticalAlerts} icon={<Siren className="h-5 w-5 text-red-600" />}
          bgGrad="from-red-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Últimas 24h" />
        <StatCard title="Alertas Abiertas" value={openAlerts} icon={<Eye className="h-5 w-5 text-orange-600" />}
          bgGrad="from-orange-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Requiere atención" />
        <StatCard title="Eventos Hoy" value={todayEvents.length} icon={<Activity className="h-5 w-5 text-blue-600" />}
          bgGrad="from-blue-50 to-white dark:from-gray-800 dark:to-gray-900" sub={`${criticalEvents24h} alta severidad`} />
        <StatCard title="IOCs Activos" value={activeThreats} icon={<Target className="h-5 w-5 text-purple-600" />}
          bgGrad="from-purple-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Indicadores de compromiso" />
        <StatCard title="Correlacionados" value={correlatedEvents} icon={<Brain className="h-5 w-5 text-green-600" />}
          bgGrad="from-green-50 to-white dark:from-gray-800 dark:to-gray-900" sub="Eventos agrupados por ML" />
      </div>

      {/* ════════════ TABS ════════════ */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-200 dark:bg-gray-700'
                }`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ════════════ TAB: OVERVIEW ════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Alert severity breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <div key={sev} className={`p-4 rounded-xl border-l-4 ${
                sev === 'CRITICAL' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' :
                sev === 'HIGH' ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10' :
                sev === 'MEDIUM' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{sev}</span>
                  <span className={`text-2xl font-bold ${
                    sev === 'CRITICAL' ? 'text-red-600' : sev === 'HIGH' ? 'text-orange-600' : sev === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>{severityBreakdown[sev]}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">alertas abiertas</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Línea de Tiempo (24h)
                </CardTitle>
                <CardDescription>Eventos de seguridad por hora y severidad</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityEventsChart data={events.slice(-50)} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-purple-600" />
                  Distribución de Amenazas
                </CardTitle>
                <CardDescription>IOCs activos clasificados por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ThreatMapChart data={threats} />
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-green-600" />
                Detección de Anomalías (ML)
              </CardTitle>
              <CardDescription>Análisis de comportamiento y detección de patrones anómalos</CardDescription>
            </CardHeader>
            <CardContent>
              <AnomalyDetectionChart events={events} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════ TAB: EVENTS ════════════ */}
      {activeTab === 'events' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" />Eventos de Seguridad</CardTitle>
                <CardDescription>Actividad registrada por el motor SIEM</CardDescription>
              </div>
              <Button size="sm" onClick={generateDemoEvent} disabled={generatingEvent}>
                {generatingEvent ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                Simular
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState icon={<Activity className="h-16 w-16" />} title="Sin eventos" description="No hay eventos de seguridad registrados" />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {events.slice(0, 50).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`mt-0.5 p-2 rounded-lg ${
                      event.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                      event.severity === 'HIGH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                      event.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                    }`}>
                      {eventTypeIcon(event.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm capitalize">{event.eventType}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadge(event.severity)}`}>{event.severity}</span>
                        {event.correlated && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full flex items-center gap-1"><Brain className="h-3 w-3" />Correlado</span>}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{event.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{event.source}</span>
                        {event.destination && <span className="flex items-center gap-1"><Server className="h-3 w-3" />{event.destination}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(event.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' })}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <RiskBadge severity={event.severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ════════════ TAB: ALERTS ════════════ */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-orange-600" />Alertas de Seguridad</CardTitle>
                <CardDescription>Alertas generadas automáticamente a partir de eventos y correlaciones</CardDescription>
              </div>
              <Link href="/dashboard/siem/alerts">
                <Button size="sm" variant="outline"><Settings className="h-4 w-4 mr-1" />Configurar</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <EmptyState icon={<Bell className="h-16 w-16" />} title="Sin alertas" description="No hay alertas activas. El sistema crea alertas automáticamente para eventos de alta severidad." />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                    alert.severity === 'CRITICAL' ? 'border-l-red-500' : alert.severity === 'HIGH' ? 'border-l-orange-500' : alert.severity === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-blue-500'
                  } bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(alert.status)}`}>{
                            alert.status === 'OPEN' ? '🔴 Abierta' :
                            alert.status === 'INVESTIGATING' ? '🟡 Investigando' :
                            alert.status === 'RESOLVED' ? '🟢 Resuelta' : '⚪ Falso positivo'
                          }</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="capitalize flex items-center gap-1"><Zap className="h-3 w-3" />{alert.alertType}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(alert.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                      <RiskBadge severity={alert.severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ════════════ TAB: THREATS ════════════ */}
      {activeTab === 'threats' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-600" />Inteligencia de Amenazas</CardTitle>
                <CardDescription>Indicadores de Compromiso (IOC) y feeds de amenazas</CardDescription>
              </div>
              <Button size="sm" onClick={generateDemoThreat} disabled={generatingEvent}>
                {generatingEvent ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Target className="h-4 w-4 mr-1" />}
                Simular IOC
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {threats.length === 0 ? (
              <EmptyState icon={<Target className="h-16 w-16" />} title="Sin amenazas" description="No hay indicadores de compromiso activos" />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {threats.map((threat) => (
                  <div key={threat.id} className={`p-4 rounded-xl border ${threat.active ? 'border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-lg">{threatTypeEmoji[threat.threatType] || '⚠️'}</span>
                          <h4 className="font-semibold text-sm capitalize">{threat.threatType}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadge(threat.severity)}`}>{threat.severity}</span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full uppercase">{threat.iocType}</span>
                          {threat.active && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">Activo</span>}
                        </div>
                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{threat.iocValue}</p>
                        {threat.description && <p className="text-xs text-gray-500 mt-1">{threat.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Search className="h-3 w-3" />Fuente: {threat.source}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(threat.lastSeen).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm ${
                          threat.confidence >= 80 ? 'bg-red-500' : threat.confidence >= 60 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>
                          {threat.confidence}%
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 block">Confianza</span>
                      </div>
                    </div>
                  </div>
                ))}
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

function ScoreBar({ label, score, weight, icon, detail }: {
  label: string; score: number; weight: string; icon: React.ReactNode; detail: string;
}) {
  const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-orange-500' : score >= 20 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span className="font-medium text-gray-900 dark:text-white">{label}</span>
          <span className="text-xs text-gray-400">({weight})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{detail}</span>
          <span className="text-sm font-bold w-8 text-right">{score}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
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

function RiskBadge({ severity }: { severity: string }) {
  const score = SEVERITY_WEIGHT[severity] || 1;
  const colors = severity === 'CRITICAL' ? 'bg-red-600' : severity === 'HIGH' ? 'bg-orange-500' : severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500';
  return (
    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white ${colors}`}>
      <span className="text-sm font-bold">{score * 10}</span>
      <span className="text-[8px] leading-none">risk</span>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="mx-auto mb-4 opacity-30">{icon}</div>
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}
