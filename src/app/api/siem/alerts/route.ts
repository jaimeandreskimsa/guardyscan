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

    const alerts = await (prisma as any).securityAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching security alerts:", error);
    return NextResponse.json(
      { error: "Error al obtener alertas de seguridad" },
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
    const { title, description, severity, alertType, sourceEventId } = body;

    const alert = await (prisma as any).securityAlert.create({
      data: {
        userId: user.id,
        title,
        description,
        severity,
        alertType,
        sourceEventId: sourceEventId || null,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Error creating security alert:", error);
    return NextResponse.json(
      { error: "Error al crear alerta de seguridad" },
      { status: 500 }
    );
  }
}