import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { performSecurityScan } from "@/lib/scanner";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { targetUrl, scanType } = await req.json();

    if (!targetUrl) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    // Get user and subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Check scan limit
    const subscription = user.subscription!;
    const hasUnlimitedScans = subscription.plan === "FREE" || subscription.scansLimit === -1;
    if (!hasUnlimitedScans && subscription.scansUsed >= subscription.scansLimit) {
      return NextResponse.json(
        { error: "Límite de escaneos alcanzado. Actualiza tu plan." },
        { status: 403 }
      );
    }

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        targetUrl,
        scanType: scanType || "BASIC",
        status: "PENDING",
      },
    });

    // Perform scan asynchronously
    performSecurityScan(scan.id, targetUrl, scanType || "BASIC").catch((error) => {
      console.error("Error in performSecurityScan:", error);
    });

    // Update scans used
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { scansUsed: { increment: 1 } },
    });

    return NextResponse.json({ scanId: scan.id }, { status: 201 });
  } catch (error) {
    console.error("Scan creation error:", error);
    return NextResponse.json(
      { error: "Error al crear el escaneo" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const scans = await prisma.scan.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(scans);
  } catch (error) {
    console.error("Fetch scans error:", error);
    return NextResponse.json(
      { error: "Error al obtener escaneos" },
      { status: 500 }
    );
  }
}
