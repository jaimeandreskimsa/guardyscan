"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Bell, Mail, MessageSquare, Webhook, 
  CheckCircle, XCircle, Loader2, Send,
  Copy, ExternalLink, Shield, Key,
  AlertTriangle, Settings, Zap
} from "lucide-react";

interface NotificationConfig {
  email: {
    enabled: boolean;
    apiKey: string;
    recipients: string;
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
  };
  discord: {
    enabled: boolean;
    webhookUrl: string;
  };
}

export default function AlertsConfigPage() {
  const [config, setConfig] = useState<NotificationConfig>({
    email: { enabled: false, apiKey: "", recipients: "" },
    slack: { enabled: false, webhookUrl: "" },
    discord: { enabled: false, webhookUrl: "" },
  });
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ channel: string; success: boolean; message: string } | null>(null);
  const [serverConfig, setServerConfig] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadServerConfig();
  }, []);

  const loadServerConfig = async () => {
    try {
      const response = await fetch("/api/siem/notifications/test");
      const data = await response.json();
      setServerConfig(data);
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const testNotification = async (channel: "email" | "slack" | "discord") => {
    setTesting(channel);
    setTestResult(null);

    try {
      let testConfig: any = {};
      
      if (channel === "email") {
        testConfig = {
          apiKey: config.email.apiKey,
          recipients: config.email.recipients.split(",").map(e => e.trim()),
        };
      } else if (channel === "slack") {
        testConfig = { webhookUrl: config.slack.webhookUrl };
      } else if (channel === "discord") {
        testConfig = { webhookUrl: config.discord.webhookUrl };
      }

      const response = await fetch("/api/siem/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, config: testConfig }),
      });

      const data = await response.json();
      
      setTestResult({
        channel,
        success: data.success,
        message: data.success ? "¡Notificación enviada correctamente!" : data.error,
      });
    } catch (error: any) {
      setTestResult({
        channel,
        success: false,
        message: error.message || "Error desconocido",
      });
    } finally {
      setTesting(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrls = {
    ingest: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/siem/ingest`,
    github: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/siem/webhook/github`,
    gitlab: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/siem/webhook/gitlab`,
    cloudflare: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/siem/webhook/cloudflare`,
    aws: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/siem/webhook/aws`,
    custom: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/siem/webhook/custom`,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            Configuración de Alertas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configura notificaciones por Email, Slack y Discord
          </p>
        </div>
      </div>

      {/* Notificaciones de Salida */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-500" />
              Email (Resend)
            </CardTitle>
            <CardDescription>
              100 emails gratis por día
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              {serverConfig?.configured?.email ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span>{serverConfig?.configured?.email ? "Configurado en servidor" : "No configurado"}</span>
            </div>

            <div>
              <label className="text-sm font-medium">API Key de Resend</label>
              <Input
                type="password"
                placeholder="re_xxxxxxxxxx"
                value={config.email.apiKey}
                onChange={(e) => setConfig(c => ({
                  ...c,
                  email: { ...c.email, apiKey: e.target.value }
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Destinatarios (separados por coma)</label>
              <Input
                type="text"
                placeholder="admin@empresa.com, seguridad@empresa.com"
                value={config.email.recipients}
                onChange={(e) => setConfig(c => ({
                  ...c,
                  email: { ...c.email, recipients: e.target.value }
                }))}
              />
            </div>

            <Button
              onClick={() => testNotification("email")}
              disabled={testing === "email" || !config.email.apiKey || !config.email.recipients}
              className="w-full"
            >
              {testing === "email" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Prueba
            </Button>

            {testResult?.channel === "email" && (
              <div className={`p-3 rounded-lg text-sm ${testResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {testResult.message}
              </div>
            )}

            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Obtener API Key gratis <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>

        {/* Slack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Slack
            </CardTitle>
            <CardDescription>
              Webhooks gratuitos e ilimitados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              {serverConfig?.configured?.slack ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span>{serverConfig?.configured?.slack ? "Configurado en servidor" : "No configurado"}</span>
            </div>

            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <Input
                type="password"
                placeholder="https://hooks.slack.com/services/..."
                value={config.slack.webhookUrl}
                onChange={(e) => setConfig(c => ({
                  ...c,
                  slack: { ...c.slack, webhookUrl: e.target.value }
                }))}
              />
            </div>

            <Button
              onClick={() => testNotification("slack")}
              disabled={testing === "slack" || !config.slack.webhookUrl}
              className="w-full"
            >
              {testing === "slack" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Prueba
            </Button>

            {testResult?.channel === "slack" && (
              <div className={`p-3 rounded-lg text-sm ${testResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {testResult.message}
              </div>
            )}

            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Crear Webhook de Slack <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>

        {/* Discord */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-500" />
              Discord
            </CardTitle>
            <CardDescription>
              Webhooks gratuitos e ilimitados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              {serverConfig?.configured?.discord ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span>{serverConfig?.configured?.discord ? "Configurado en servidor" : "No configurado"}</span>
            </div>

            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <Input
                type="password"
                placeholder="https://discord.com/api/webhooks/..."
                value={config.discord.webhookUrl}
                onChange={(e) => setConfig(c => ({
                  ...c,
                  discord: { ...c.discord, webhookUrl: e.target.value }
                }))}
              />
            </div>

            <Button
              onClick={() => testNotification("discord")}
              disabled={testing === "discord" || !config.discord.webhookUrl}
              className="w-full"
            >
              {testing === "discord" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Prueba
            </Button>

            {testResult?.channel === "discord" && (
              <div className={`p-3 rounded-lg text-sm ${testResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {testResult.message}
              </div>
            )}

            <p className="text-sm text-gray-500">
              Ve a tu servidor → Configuración → Integraciones → Webhooks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Entrantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-green-600" />
            Webhooks Entrantes (Recibir Logs)
          </CardTitle>
          <CardDescription>
            URLs para que tus sistemas envíen eventos al SIEM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* API de Ingestión */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-blue-500" />
                <span className="font-medium">API de Ingestión (con API Key)</span>
              </div>
              <div className="flex gap-2">
                <Input value={webhookUrls.ingest} readOnly className="text-xs" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.ingest, 'ingest')}
                >
                  {copied === 'ingest' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Header: <code className="bg-gray-100 px-1 rounded">x-api-key: gs_ingest_demo_key_2024</code>
              </p>
            </div>

            {/* GitHub */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-gray-700" />
                <span className="font-medium">GitHub Webhooks</span>
              </div>
              <div className="flex gap-2">
                <Input value={webhookUrls.github} readOnly className="text-xs" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.github, 'github')}
                >
                  {copied === 'github' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* GitLab */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="font-medium">GitLab Webhooks</span>
              </div>
              <div className="flex gap-2">
                <Input value={webhookUrls.gitlab} readOnly className="text-xs" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.gitlab, 'gitlab')}
                >
                  {copied === 'gitlab' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Cloudflare */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <span className="font-medium">Cloudflare</span>
              </div>
              <div className="flex gap-2">
                <Input value={webhookUrls.cloudflare} readOnly className="text-xs" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.cloudflare, 'cloudflare')}
                >
                  {copied === 'cloudflare' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* AWS */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">AWS (SNS/CloudWatch)</span>
              </div>
              <div className="flex gap-2">
                <Input value={webhookUrls.aws} readOnly className="text-xs" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.aws, 'aws')}
                >
                  {copied === 'aws' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Custom */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Custom (Cualquier JSON)</span>
              </div>
              <div className="flex gap-2">
                <Input value={webhookUrls.custom} readOnly className="text-xs" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrls.custom, 'custom')}
                >
                  {copied === 'custom' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo de uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Ejemplo: Enviar Log desde tu Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`# Usando curl
curl -X POST ${webhookUrls.ingest} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_ingest_demo_key_2024" \\
  -d '{
    "type": "login_failed",
    "severity": "high",
    "description": "5 intentos fallidos de login para usuario admin",
    "sourceIp": "192.168.1.100",
    "data": {
      "username": "admin",
      "attempts": 5
    }
  }'`}
          </pre>
        </CardContent>
      </Card>

      {/* Variables de entorno */}
      <Card>
        <CardHeader>
          <CardTitle>Variables de Entorno (.env)</CardTitle>
          <CardDescription>
            Para configuración permanente en el servidor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`# Notificaciones por Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxx
ALERT_EMAIL_RECIPIENTS=admin@empresa.com,seguridad@empresa.com

# Notificaciones por Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx

# Notificaciones por Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/xxx

# API Key para ingestión de logs (cambia en producción)
SIEM_INGEST_API_KEY=tu_api_key_segura_aqui`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
