// API para probar y configurar notificaciones

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  sendEmailNotification, 
  sendSlackNotification, 
  sendDiscordNotification 
} from "@/lib/notifications";

// POST /api/siem/notifications/test - Enviar notificación de prueba
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { channel, config } = await req.json();

    const testPayload = {
      title: "Prueba de Notificación - GuardyScan",
      message: "Esta es una notificación de prueba del sistema SIEM de GuardyScan. Si recibes este mensaje, la configuración es correcta.",
      severity: 'info' as const,
      source: "test",
      timestamp: new Date(),
      data: { test: true, user: session.user.email },
    };

    let result;

    switch (channel) {
      case 'email':
        if (!config.apiKey || !config.recipients?.length) {
          return NextResponse.json(
            { error: "Falta API Key de Resend o destinatarios" },
            { status: 400 }
          );
        }
        result = await sendEmailNotification(testPayload, {
          apiKey: config.apiKey,
          recipients: config.recipients,
        });
        break;

      case 'slack':
        if (!config.webhookUrl) {
          return NextResponse.json(
            { error: "Falta URL del webhook de Slack" },
            { status: 400 }
          );
        }
        result = await sendSlackNotification(testPayload, config.webhookUrl);
        break;

      case 'discord':
        if (!config.webhookUrl) {
          return NextResponse.json(
            { error: "Falta URL del webhook de Discord" },
            { status: 400 }
          );
        }
        result = await sendDiscordNotification(testPayload, config.webhookUrl);
        break;

      default:
        return NextResponse.json(
          { error: "Canal no válido. Usa: email, slack, discord" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Notificación de prueba enviada a ${channel}`,
        channel,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "Error enviando notificación", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/siem/notifications/test - Info de configuración
export async function GET() {
  return NextResponse.json({
    configured: {
      email: !!process.env.RESEND_API_KEY,
      slack: !!process.env.SLACK_WEBHOOK_URL,
      discord: !!process.env.DISCORD_WEBHOOK_URL,
    },
    setup: {
      email: {
        provider: "Resend (gratis: 100 emails/día)",
        signup: "https://resend.com",
        env_vars: ["RESEND_API_KEY", "ALERT_EMAIL_RECIPIENTS"],
      },
      slack: {
        provider: "Slack Incoming Webhooks (gratis)",
        setup: "https://api.slack.com/messaging/webhooks",
        env_vars: ["SLACK_WEBHOOK_URL"],
      },
      discord: {
        provider: "Discord Webhooks (gratis)",
        setup: "Server Settings > Integrations > Webhooks",
        env_vars: ["DISCORD_WEBHOOK_URL"],
      },
    },
  });
}
