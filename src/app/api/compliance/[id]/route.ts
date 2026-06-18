import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { frameworkId, implementationStatus, evidence, notes, responsible, targetDate, docType, fileName } = body;
    const fw = frameworkId || "LEY21663";

    const state = await (prisma as any).userComplianceState.upsert({
      where: { userId_frameworkId_controlId: { userId: session.user.id, frameworkId: fw, controlId: params.id } },
      update: {
        implementationStatus: implementationStatus ?? "NOT_STARTED",
        evidence: evidence ?? null,
        notes: notes ?? null,
        responsible: responsible ?? "",
        targetDate: targetDate ?? "",
        docType: docType ?? null,
        fileName: fileName ?? "",
        lastReviewed: new Date().toISOString().split("T")[0],
      },
      create: {
        userId: session.user.id,
        frameworkId: fw,
        controlId: params.id,
        implementationStatus: implementationStatus ?? "NOT_STARTED",
        evidence: evidence ?? null,
        notes: notes ?? null,
        responsible: responsible ?? "",
        targetDate: targetDate ?? "",
        docType: docType ?? null,
        fileName: fileName ?? "",
        lastReviewed: new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json(state);
  } catch (error) {
    console.error("Error saving compliance state:", error);
    return NextResponse.json({ error: "Error al guardar estado" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const frameworkId = searchParams.get("framework") || "LEY21663";

    await (prisma as any).userComplianceState.deleteMany({
      where: { userId: session.user.id, frameworkId, controlId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting compliance state:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
