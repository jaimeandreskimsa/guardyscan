// API de Ingestión de Logs - GuardyScan SIEM
// Recibe logs de sistemas externos via HTTP POST

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification, createAlertPayload } from "@/lib/notifications";

// API Key para autenticación (en producción usar una más segura)
const API_KEYS = new Set([
  process.env.SIEM_INGEST_API_KEY || 'gs_ingest_demo_key_2024',
]);

interface LogEntry {
  timestamp?: string;
  type: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source?: string;
  sourceIp?: string;
  description: string;
  data?: Record<string, any>;
  tags?: string[];
}

// POST /api/siem/ingest - Recibir logs externos
export async function POST(req: Request) {
  try {
    // Verificar API Key
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey || !API_KEYS.has(apiKey)) {
      return NextResponse.json(
        { error: "API Key inválida o faltante", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Soportar un solo log o array de logs
    const logs: LogEntry[] = Array.isArray(body) ? body : [body];
    
    if (logs.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron logs", code: "EMPTY_PAYLOAD" },
        { status: 400 }
      );
    }

    // Limitar a 100 logs por request
    if (logs.length > 100) {
      return NextResponse.json(
        { error: "Máximo 100 logs por request", code: "TOO_MANY_LOGS" },
        { status: 400 }
      );
    }

    const results = {
      received: logs.length,
      processed: 0,
      alerts_triggered: 0,
      errors: [] as string[],
    };

    // Obtener configuración de notificaciones (del primer usuario admin o config global)
    const notificationConfig = await getNotificationConfig();

    for (const log of logs) {
      try {
        // Validar campos requeridos
        if (!log.type || !log.description) {
          results.errors.push(`Log inválido: falta type o description`);
          continue;
        }

        // Mapear severidad
        const severity = mapSeverity(log.severity || 'info');

        // Crear evento en la base de datos
        const event = await prisma.securityEvent.create({
          data: {
            eventType: log.type,
            severity: severity,
            message: log.description,
            source: log.sourceIp || log.source || 'external',
            details: log.data || {},
            processed: true,
            userId: notificationConfig.userId,
          },
        });

        results.processed++;

        // Si es crítico o alto, crear alerta y notificar
        if (severity === 'CRITICAL' || severity === 'HIGH') {
          // Crear alerta
          await prisma.securityAlert.create({
            data: {
              sourceEventId: event.id,
              severity: severity,
              title: `[${log.type}] ${log.description.substring(0, 100)}`,
              description: log.description,
              status: 'OPEN',
              alertType: 'ingest',
              userId: notificationConfig.userId,
            },
          });

          results.alerts_triggered++;

          // Enviar notificaciones si están configuradas
          if (notificationConfig.enabled) {
            const alertPayload = createAlertPayload({
              type: log.type,
              severity: severity.toLowerCase(),
              description: log.description,
              sourceIp: log.sourceIp,
              data: log.data,
            });

            await sendNotification(alertPayload, notificationConfig.config);
          }
        }

      } catch (logError: any) {
        results.errors.push(`Error procesando log: ${logError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Error en ingestión de logs:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/siem/ingest - Info sobre el endpoint
export async function GET() {
  return NextResponse.json({
    name: "GuardyScan SIEM Log Ingestion API",
    version: "1.0.0",
    endpoints: {
      ingest: {
        method: "POST",
        url: "/api/siem/ingest",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY",
        },
        body: {
          type: "string (required) - Tipo de evento: login_failed, malware_detected, etc.",
          description: "string (required) - Descripción del evento",
          severity: "string (optional) - critical, high, medium, low, info",
          sourceIp: "string (optional) - IP de origen",
          source: "string (optional) - Nombre del sistema origen",
          data: "object (optional) - Datos adicionales",
          timestamp: "string (optional) - ISO 8601 timestamp",
        },
        example: {
          type: "login_failed",
          severity: "high",
          description: "Multiple failed login attempts detected",
          sourceIp: "192.168.1.100",
          source: "nginx",
          data: {
            attempts: 5,
            username: "admin",
            user_agent: "Mozilla/5.0..."
          }
        },
      },
    },
    rate_limits: {
      max_logs_per_request: 100,
      recommended_batch_size: 50,
    },
    supported_formats: ["json"],
  });
}

// Helpers
function mapSeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const map: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    info: 'LOW',
    warning: 'MEDIUM',
    error: 'HIGH',
    emergency: 'CRITICAL',
    alert: 'HIGH',
  };
  return map[severity.toLowerCase()] || 'LOW';
}

async function getNotificationConfig() {
  // Buscar usuario admin o el primer usuario
  const user = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  }) || await prisma.user.findFirst({
    select: { id: true },
  });

  // En producción, esto vendría de una tabla de configuración
  return {
    userId: user?.id || 'system',
    enabled: !!(process.env.RESEND_API_KEY || process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL),
    config: {
      email: {
        enabled: !!process.env.RESEND_API_KEY,
        apiKey: process.env.RESEND_API_KEY,
        recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
      },
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
      },
      discord: {
        enabled: !!process.env.DISCORD_WEBHOOK_URL,
        webhookUrl: process.env.DISCORD_WEBHOOK_URL,
      },
    },
  };
}
