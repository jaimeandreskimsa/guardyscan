// Webhook Universal - Recibe eventos de cualquier fuente
// Soporta: GitHub, GitLab, AWS, Cloudflare, Custom

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification, createAlertPayload } from "@/lib/notifications";

// POST /api/siem/webhook/[source] - Recibir webhooks
export async function POST(
  req: Request,
  { params }: { params: { source: string } }
) {
  try {
    const source = params.source.toLowerCase();
    const body = await req.text();
    let parsedBody: any;

    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = { raw: body };
    }

    // Extraer headers relevantes
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key.startsWith('x-') || key === 'user-agent' || key === 'content-type') {
        headers[key] = value;
      }
    });

    // Procesar según la fuente
    let event: { type: string; severity: string; description: string; data: any } | null = null;

    switch (source) {
      case 'github':
        event = processGitHubWebhook(parsedBody, headers);
        break;
      case 'gitlab':
        event = processGitLabWebhook(parsedBody, headers);
        break;
      case 'cloudflare':
        event = processCloudflareWebhook(parsedBody, headers);
        break;
      case 'aws':
        event = processAWSWebhook(parsedBody, headers);
        break;
      case 'custom':
      default:
        event = processCustomWebhook(parsedBody, headers, source);
        break;
    }

    if (!event) {
      return NextResponse.json({ 
        received: true, 
        processed: false, 
        reason: "Event type not monitored" 
      });
    }

    // Obtener usuario del sistema
    const user = await prisma.user.findFirst({
      where: { role: 'admin' },
    }) || await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: "No user configured" }, { status: 500 });
    }

    // Crear evento de seguridad
    const securityEvent = await prisma.securityEvent.create({
      data: {
        eventType: event.type,
        severity: mapSeverity(event.severity),
        message: event.description,
        source: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'webhook',
        details: { source, headers, body: parsedBody, ...event.data },
        processed: true,
        userId: user.id,
      },
    });

    // Si es crítico o alto, crear alerta
    if (event.severity === 'critical' || event.severity === 'high') {
      await prisma.securityAlert.create({
        data: {
          sourceEventId: securityEvent.id,
          severity: mapSeverity(event.severity),
          title: `[${source.toUpperCase()}] ${event.type}`,
          description: event.description,
          status: 'OPEN',
          alertType: 'webhook',
          userId: user.id,
        },
      });

      // Enviar notificaciones
      const notificationConfig = await getNotificationConfig();
      if (notificationConfig.enabled) {
        const alertPayload = createAlertPayload({
          type: `${source}: ${event.type}`,
          severity: event.severity,
          description: event.description,
          sourceIp: source,
          data: event.data,
        });
        await sendNotification(alertPayload, notificationConfig.config);
      }
    }

    return NextResponse.json({
      success: true,
      eventId: securityEvent.id,
      source,
      type: event.type,
      severity: event.severity,
    });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error processing webhook", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Info sobre webhooks disponibles
export async function GET(
  req: Request,
  { params }: { params: { source: string } }
) {
  return NextResponse.json({
    webhook: params.source,
    status: "active",
    usage: {
      url: `${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/api/siem/webhook/${params.source}`,
      method: "POST",
      content_type: "application/json",
    },
    supported_sources: [
      { name: "github", description: "GitHub repository events" },
      { name: "gitlab", description: "GitLab project events" },
      { name: "cloudflare", description: "Cloudflare security events" },
      { name: "aws", description: "AWS CloudWatch/SNS events" },
      { name: "custom", description: "Any custom JSON payload" },
    ],
  });
}

// ============ PROCESADORES POR FUENTE ============

function processGitHubWebhook(body: any, headers: Record<string, string>) {
  const eventType = headers['x-github-event'];
  
  const securityEvents: Record<string, { severity: string; description: string }> = {
    'push': { severity: 'low', description: `Push to ${body.repository?.full_name}: ${body.head_commit?.message || 'No message'}` },
    'pull_request': { severity: 'low', description: `PR ${body.action} in ${body.repository?.full_name}: ${body.pull_request?.title}` },
    'security_advisory': { severity: 'critical', description: `Security advisory: ${body.security_advisory?.summary}` },
    'secret_scanning_alert': { severity: 'critical', description: `Secret exposed in ${body.repository?.full_name}` },
    'code_scanning_alert': { severity: 'high', description: `Code vulnerability found: ${body.alert?.rule?.description}` },
    'dependabot_alert': { severity: 'high', description: `Dependabot: ${body.alert?.security_advisory?.summary}` },
    'repository_vulnerability_alert': { severity: 'high', description: `Vulnerability in ${body.repository?.full_name}` },
  };

  const eventConfig = securityEvents[eventType || ''];
  if (!eventConfig) return null;

  return {
    type: `github_${eventType}`,
    severity: eventConfig.severity,
    description: eventConfig.description,
    data: { repository: body.repository?.full_name, sender: body.sender?.login },
  };
}

function processGitLabWebhook(body: any, headers: Record<string, string>) {
  const eventType = headers['x-gitlab-event'];
  
  const events: Record<string, { type: string; severity: string }> = {
    'Push Hook': { type: 'gitlab_push', severity: 'low' },
    'Merge Request Hook': { type: 'gitlab_merge_request', severity: 'low' },
    'Pipeline Hook': { type: 'gitlab_pipeline', severity: 'low' },
    'Security Report': { type: 'gitlab_security', severity: 'high' },
  };

  const eventConfig = events[eventType || ''];
  if (!eventConfig) return null;

  return {
    type: eventConfig.type,
    severity: eventConfig.severity,
    description: `GitLab ${eventType}: ${body.project?.name || 'Unknown project'}`,
    data: { project: body.project?.name, user: body.user?.name },
  };
}

function processCloudflareWebhook(body: any, headers: Record<string, string>) {
  // Cloudflare security events
  const alertType = body.alert_type || body.data?.alert_type;
  
  const severityMap: Record<string, string> = {
    'ddos_attack': 'critical',
    'firewall_block': 'medium',
    'rate_limit': 'medium',
    'bot_detected': 'low',
    'waf_block': 'high',
  };

  return {
    type: `cloudflare_${alertType || 'event'}`,
    severity: severityMap[alertType] || 'medium',
    description: body.message || body.data?.message || `Cloudflare alert: ${alertType}`,
    data: { zone: body.zone?.name, ip: body.data?.client_ip },
  };
}

function processAWSWebhook(body: any, headers: Record<string, string>) {
  // AWS SNS/CloudWatch format
  const message = typeof body.Message === 'string' ? JSON.parse(body.Message) : body;
  
  // GuardDuty findings
  if (message.detail?.type?.includes('Finding')) {
    return {
      type: 'aws_guardduty',
      severity: mapAWSSeverity(message.detail?.severity),
      description: message.detail?.description || 'AWS GuardDuty finding',
      data: { accountId: message.account, region: message.region },
    };
  }
  
  // Security Hub
  if (message.detail?.findings) {
    const finding = message.detail.findings[0];
    return {
      type: 'aws_securityhub',
      severity: finding?.Severity?.Label?.toLowerCase() || 'medium',
      description: finding?.Title || 'AWS Security Hub finding',
      data: { accountId: message.account },
    };
  }

  return {
    type: 'aws_event',
    severity: 'low',
    description: body.Message || 'AWS notification',
    data: { subject: body.Subject },
  };
}

function processCustomWebhook(body: any, headers: Record<string, string>, source: string) {
  // Intenta extraer campos comunes
  return {
    type: body.type || body.event || body.event_type || `${source}_event`,
    severity: body.severity || body.level || body.priority || 'medium',
    description: body.description || body.message || body.text || JSON.stringify(body).substring(0, 200),
    data: body,
  };
}

// ============ HELPERS ============

function mapSeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const map: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };
  return map[severity.toLowerCase()] || 'LOW';
}

function mapAWSSeverity(severity: number): string {
  if (severity >= 7) return 'critical';
  if (severity >= 4) return 'high';
  if (severity >= 2) return 'medium';
  return 'low';
}

async function getNotificationConfig() {
  return {
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
