// Sistema de Notificaciones - GuardyScan
// Soporta: Email (Resend), Slack, Discord

interface NotificationPayload {
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source?: string;
  timestamp?: Date;
  data?: Record<string, any>;
}

interface NotificationConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    apiKey?: string;
  };
  slack?: {
    enabled: boolean;
    webhookUrl?: string;
  };
  discord?: {
    enabled: boolean;
    webhookUrl?: string;
  };
}

// Colores por severidad
const SEVERITY_COLORS = {
  critical: '#dc2626', // Rojo
  high: '#ea580c',     // Naranja
  medium: '#eab308',   // Amarillo
  low: '#22c55e',      // Verde
  info: '#3b82f6',     // Azul
};

const SEVERITY_EMOJI = {
  critical: '🚨',
  high: '⚠️',
  medium: '📊',
  low: '📝',
  info: 'ℹ️',
};

// ============ EMAIL (Resend) ============
export async function sendEmailNotification(
  payload: NotificationPayload,
  config: { recipients: string[]; apiKey: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GuardyScan <alertas@guardyscan.com>',
        to: config.recipients,
        subject: `${SEVERITY_EMOJI[payload.severity]} [${payload.severity.toUpperCase()}] ${payload.title}`,
        html: generateEmailHTML(payload),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error enviando email' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function generateEmailHTML(payload: NotificationPayload): string {
  const color = SEVERITY_COLORS[payload.severity];
  const timestamp = payload.timestamp || new Date();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: ${color}; color: white; padding: 20px; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { padding: 20px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${color}20; color: ${color}; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { color: #6b7280; }
        .info-value { font-weight: 500; }
        .message { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${SEVERITY_EMOJI[payload.severity]} Alerta de Seguridad - GuardyScan</h1>
        </div>
        <div class="content">
          <span class="badge">${payload.severity.toUpperCase()}</span>
          <h2 style="margin: 15px 0 10px;">${payload.title}</h2>
          
          <div class="message">
            ${payload.message}
          </div>
          
          <div class="info-row">
            <span class="info-label">Fecha/Hora</span>
            <span class="info-value">${timestamp.toLocaleString('es-ES')}</span>
          </div>
          
          ${payload.source ? `
          <div class="info-row">
            <span class="info-label">Origen</span>
            <span class="info-value">${payload.source}</span>
          </div>
          ` : ''}
          
          ${payload.data ? `
          <div style="margin-top: 15px;">
            <strong>Detalles adicionales:</strong>
            <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(payload.data, null, 2)}</pre>
          </div>
          ` : ''}
          
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/siem" class="btn">
            Ver en Dashboard
          </a>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático de GuardyScan SIEM</p>
          <p>© ${new Date().getFullYear()} GuardyScan - Security Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============ SLACK ============
export async function sendSlackNotification(
  payload: NotificationPayload,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const color = SEVERITY_COLORS[payload.severity];
    const timestamp = payload.timestamp || new Date();
    
    const slackPayload = {
      attachments: [
        {
          color: color,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `${SEVERITY_EMOJI[payload.severity]} ${payload.title}`,
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: payload.message,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `*Severidad:* ${payload.severity.toUpperCase()} | *Hora:* ${timestamp.toLocaleString('es-ES')}${payload.source ? ` | *Origen:* ${payload.source}` : ''}`,
                },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🔍 Ver en Dashboard',
                    emoji: true,
                  },
                  url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/siem`,
                  style: 'primary',
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      return { success: false, error: 'Error enviando a Slack' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============ DISCORD ============
export async function sendDiscordNotification(
  payload: NotificationPayload,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const color = parseInt(SEVERITY_COLORS[payload.severity].replace('#', ''), 16);
    const timestamp = payload.timestamp || new Date();
    
    const discordPayload = {
      embeds: [
        {
          title: `${SEVERITY_EMOJI[payload.severity]} ${payload.title}`,
          description: payload.message,
          color: color,
          fields: [
            {
              name: '🎯 Severidad',
              value: payload.severity.toUpperCase(),
              inline: true,
            },
            {
              name: '🕐 Hora',
              value: timestamp.toLocaleString('es-ES'),
              inline: true,
            },
            ...(payload.source ? [{
              name: '📍 Origen',
              value: payload.source,
              inline: true,
            }] : []),
          ],
          footer: {
            text: 'GuardyScan SIEM',
          },
          timestamp: timestamp.toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      return { success: false, error: 'Error enviando a Discord' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============ NOTIFICACIÓN UNIVERSAL ============
export async function sendNotification(
  payload: NotificationPayload,
  config: NotificationConfig
): Promise<{ email?: boolean; slack?: boolean; discord?: boolean; errors: string[] }> {
  const results = { email: false, slack: false, discord: false, errors: [] as string[] };
  
  // Email
  if (config.email?.enabled && config.email.apiKey && config.email.recipients.length > 0) {
    const emailResult = await sendEmailNotification(payload, {
      recipients: config.email.recipients,
      apiKey: config.email.apiKey,
    });
    results.email = emailResult.success;
    if (!emailResult.success && emailResult.error) {
      results.errors.push(`Email: ${emailResult.error}`);
    }
  }
  
  // Slack
  if (config.slack?.enabled && config.slack.webhookUrl) {
    const slackResult = await sendSlackNotification(payload, config.slack.webhookUrl);
    results.slack = slackResult.success;
    if (!slackResult.success && slackResult.error) {
      results.errors.push(`Slack: ${slackResult.error}`);
    }
  }
  
  // Discord
  if (config.discord?.enabled && config.discord.webhookUrl) {
    const discordResult = await sendDiscordNotification(payload, config.discord.webhookUrl);
    results.discord = discordResult.success;
    if (!discordResult.success && discordResult.error) {
      results.errors.push(`Discord: ${discordResult.error}`);
    }
  }
  
  return results;
}

// ============ HELPER: Crear alerta desde evento SIEM ============
export function createAlertPayload(event: {
  type: string;
  severity: string;
  description: string;
  sourceIp?: string;
  data?: any;
}): NotificationPayload {
  return {
    title: `Alerta SIEM: ${event.type}`,
    message: event.description,
    severity: (event.severity as NotificationPayload['severity']) || 'medium',
    source: event.sourceIp,
    timestamp: new Date(),
    data: event.data,
  };
}
