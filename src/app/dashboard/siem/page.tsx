"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, AlertTriangle, Activity, Brain, TrendingUp, Clock, Users, Bell, Settings } from "lucide-react";
import { SecurityEventsChart } from "@/components/siem/security-events-chart";
import { ThreatMapChart } from "@/components/siem/threat-map-chart";
import { AnomalyDetectionChart } from "@/components/siem/anomaly-detection-chart";
import Link from "next/link";

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  source: string;
  message: string;
  timestamp: Date;
  processed: boolean;
}

interface SecurityAlert {
  id: string;
  title: string;
  severity: string;
  status: string;
  alertType: string;
  createdAt: Date;
}

interface ThreatIntel {
  id: string;
  iocType: string;
  iocValue: string;
  threatType: string;
  severity: string;
  active: boolean;
}

export default function SiemPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  useEffect(() => {
    loadSiemData();
    
    // Real-time updates every 10 seconds
    if (realTimeEnabled) {
      const interval = setInterval(loadSiemData, 10000);
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  const loadSiemData = async () => {
    try {
      setLoading(true);
      const [eventsRes, alertsRes, threatsRes] = await Promise.all([
        fetch("/api/siem/events"),
        fetch("/api/siem/alerts"),
        fetch("/api/siem/threats")
      ]);

      const eventsData = await eventsRes.json();
      const alertsData = await alertsRes.json();
      const threatsData = await threatsRes.json();

      setEvents(eventsData || []);
      setAlerts(alertsData || []);
      setThreats(threatsData || []);
    } catch (error) {
      console.error("Error loading SIEM data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoEvent = async () => {
    try {
      await fetch("/api/siem/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "anomaly",
          severity: "HIGH",
          source: `192.168.1.${Math.floor(Math.random() * 255)}`,
          message: `Suspicious activity detected: Multiple failed login attempts from ${Math.floor(Math.random() * 100)} different IPs`,
          details: {
            attempts: Math.floor(Math.random() * 50) + 10,
            timeWindow: "5 minutes",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        })
      });
      loadSiemData();
    } catch (error) {
      console.error("Error generating demo event:", error);
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === "CRITICAL").length;
  const openAlerts = alerts.filter(a => a.status === "OPEN").length;
  const todayEvents = events.filter(e => {
    const today = new Date();
    const eventDate = new Date(e.timestamp);
    return eventDate.toDateString() === today.toDateString();
  }).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Panel SIEM
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Información de Seguridad y Gestión de Eventos
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/siem/alerts">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Configurar Alertas
            </Button>
          </Link>
          <Button 
            variant={realTimeEnabled ? "default" : "outline"}
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          >
            <Activity className="mr-2 h-4 w-4" />
            {realTimeEnabled ? "Live ON" : "Live OFF"}
          </Button>
          <Button onClick={generateDemoEvent}>
            <Shield className="mr-2 h-4 w-4" />
            Generar Evento
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Alertas Críticas
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {criticalAlerts}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Alertas Abiertas
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              {openAlerts}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Requiere atención
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Eventos Hoy
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {todayEvents}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Eventos de seguridad
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Inteligencia de Amenazas
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {threats.filter(t => t.active).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              IOCs Activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Línea de Tiempo de Eventos de Seguridad
            </CardTitle>
            <CardDescription>Monitoreo de eventos en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <SecurityEventsChart data={events.slice(-50)} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Mapa de Inteligencia de Amenazas
            </CardTitle>
            <CardDescription>Amenazas activas por origen</CardDescription>
          </CardHeader>
          <CardContent>
            <ThreatMapChart data={threats} />
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            Detección de Anomalías con ML
          </CardTitle>
          <CardDescription>Análisis de comportamiento con Machine Learning</CardDescription>
        </CardHeader>
        <CardContent>
          <AnomalyDetectionChart events={events} />
        </CardContent>
      </Card>

      {/* Recent Events & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Eventos de Seguridad Recientes
            </CardTitle>
            <CardDescription>Últimas actividades de seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se detectaron eventos</p>
                <Button onClick={generateDemoEvent} className="mt-4">
                  Generar Evento Demo
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(event.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{event.eventType}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {event.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{event.source}</span>
                        <span>•</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas de Seguridad Activas
            </CardTitle>
            <CardDescription>Alertas que requieren investigación</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay alertas activas</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {alerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge variant={alert.status === "OPEN" ? "destructive" : "secondary"} className="text-xs">
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{alert.alertType}</span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}