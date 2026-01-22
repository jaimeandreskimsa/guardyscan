import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const events = await (prisma as any).securityEvent.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching security events:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos de seguridad" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { eventType, severity, source, destination, message, details } = body;

    // Basic ML-like anomaly detection
    const recentSimilarEvents = await (prisma as any).securityEvent.count({
      where: {
        userId: user.id,
        eventType,
        source,
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
    });

    // Generate correlation ID if multiple similar events
    let correlationId = null;
    if (recentSimilarEvents > 0) {
      correlationId = `corr_${Date.now()}_${eventType}`;
    }

    const event = await (prisma as any).securityEvent.create({
      data: {
        userId: user.id,
        eventType,
        severity,
        source,
        destination: destination || null,
        message,
        details: details || null,
        correlationId,
        correlated: recentSimilarEvents > 0,
      },
    });

    // Auto-create alert for high/critical events
    if (severity === "HIGH" || severity === "CRITICAL") {
      await (prisma as any).securityAlert.create({
        data: {
          userId: user.id,
          title: `${severity} Security Event Detected`,
          description: message,
          severity,
          alertType: "correlation",
          sourceEventId: event.id,
        },
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating security event:", error);
    return NextResponse.json(
      { error: "Error al crear evento de seguridad" },
      { status: 500 }
    );
  }
}