import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      autoScanEnabled: user.subscription.autoScanEnabled,
      autoScanUrl: user.subscription.autoScanUrl,
      lastAutoScan: user.subscription.lastAutoScan,
    });
  } catch (error) {
    console.error("Get auto-scan config error:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { autoScanEnabled, autoScanUrl } = await req.json();

    // Validate URL if provided
    if (autoScanUrl) {
      try {
        new URL(autoScanUrl);
      } catch {
        return NextResponse.json(
          { error: "URL inválida" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
    }

    // Only paid plans can enable auto-scan
    if (autoScanEnabled && user.subscription.plan === "FREE") {
      return NextResponse.json(
        { error: "El escaneo automático requiere un plan de pago" },
        { status: 403 }
      );
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        autoScanEnabled,
        autoScanUrl: autoScanUrl || null,
      },
    });

    return NextResponse.json({
      message: "Configuración actualizada",
      autoScanEnabled: updatedSubscription.autoScanEnabled,
      autoScanUrl: updatedSubscription.autoScanUrl,
    });
  } catch (error) {
    console.error("Update auto-scan config error:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
