import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener suscripción del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // Si no existe, crear una suscripción FREE por defecto
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "FREE",
          status: "ACTIVE",
          scansLimit: -1,
          scansUsed: 0,
        },
      });
    }

    return NextResponse.json({
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      scansUsed: subscription.scansUsed,
      scansLimit: subscription.scansLimit,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Error al obtener la suscripción" },
      { status: 500 }
    );
  }
}
