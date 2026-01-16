"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    autoScanEnabled: false,
    autoScanUrl: "",
    lastAutoScan: null as string | null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/auto-scan/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auto-scan/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoScanEnabled: config.autoScanEnabled,
          autoScanUrl: config.autoScanUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      toast({
        title: "✅ Configuración guardada",
        description: "El escaneo automático se ha configurado correctamente",
      });

      fetchConfig();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Auto-Scan Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Escaneo Automático Mensual</CardTitle>
              <CardDescription>
                Programa un escaneo automático cada día 1 de mes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-medium mb-1">Disponible solo para planes de pago</p>
                <p className="text-blue-700 dark:text-blue-300">
                  El escaneo automático ejecutará un análisis completo de la URL configurada
                  cada día 1 de mes. El escaneo consumirá 1 crédito de tu plan.
                </p>
              </div>
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">Activar escaneo automático</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ejecutar un escaneo el día 1 de cada mes
              </p>
            </div>
            <button
              onClick={() => setConfig({ ...config, autoScanEnabled: !config.autoScanEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoScanEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoScanEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="autoScanUrl" className="text-sm font-medium">
              URL para escanear automáticamente
            </label>
            <input
              id="autoScanUrl"
              type="url"
              value={config.autoScanUrl}
              onChange={(e) => setConfig({ ...config, autoScanUrl: e.target.value })}
              placeholder="https://tuempresa.com"
              disabled={!config.autoScanEnabled}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Esta URL será escaneada automáticamente cada mes
            </p>
          </div>

          {/* Last Auto Scan */}
          {config.lastAutoScan && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Último escaneo automático:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(config.lastAutoScan).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Next Scheduled Scan */}
          {config.autoScanEnabled && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900 dark:text-green-200">
                    Próximo escaneo programado
                  </p>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    {(() => {
                      const now = new Date();
                      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                      return nextMonth.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo funciona el escaneo automático?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                1
              </span>
              <span>Configura la URL de tu sitio web o aplicación</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                2
              </span>
              <span>Activa el escaneo automático (solo planes de pago)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                3
              </span>
              <span>Cada día 1 de mes, GuardyScan ejecutará automáticamente un escaneo completo</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                4
              </span>
              <span>Revisa los resultados en tu dashboard y recibe alertas si se detectan problemas</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                5
              </span>
              <span>El escaneo consumirá 1 crédito de tu plan mensual</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
