import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Update incident including assignedTo and auto-set closedAt when status is CLOSED
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

    const body = await req.json();
    const {
      title, description, severity, category, affectedSystems, assignedTo, notes, status,
      origin, sourceUrl, linkedVulnerabilityId, immediateActions,
      impactFinancial, impactOperational, impactReputational
    } = body;

    // Verificar que el incidente pertenece al usuario
    const existingIncident = await prisma.incident.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: "Incidente no encontrado" },
        { status: 404 }
      );
    }

    const updateData: any = {
      title,
      description,
      severity,
      category,
      affectedSystems: affectedSystems || null,
      assignedTo: assignedTo || null,
      notes: notes || null,
      origin: origin || null,
      sourceUrl: sourceUrl || null,
      linkedVulnerabilityId: linkedVulnerabilityId || null,
      immediateActions: immediateActions || null,
      impactFinancial: impactFinancial || null,
      impactOperational: impactOperational || null,
      impactReputational: impactReputational || null,
    };

    // Si se cambia el estado a RESOLVED o CLOSED, actualizar resolvedAt
    if (status && (status === "RESOLVED" || status === "CLOSED") && !existingIncident.resolvedAt) {
      updateData.resolvedAt = new Date();
      updateData.status = status;
    } else if (status) {
      updateData.status = status;
    }

    // Si se cambia el estado a CLOSED, actualizar closedAt
    if (status === "CLOSED" && !(existingIncident as any).closedAt) {
      updateData.closedAt = new Date();
    }

    const incident = await prisma.incident.update({
      where: { id: params.id },
      data: updateData,
    });

    // Si el incidente se resuelve o cierra y tiene una vulnerabilidad vinculada,
    // actualizar automáticamente la vulnerabilidad a REMEDIATED
    const isNowResolved =
      (status === "RESOLVED" || status === "CLOSED") &&
      existingIncident.status !== "RESOLVED" &&
      existingIncident.status !== "CLOSED";

    const vulnId = updateData.linkedVulnerabilityId ?? existingIncident.linkedVulnerabilityId;

    if (isNowResolved && vulnId) {
      try {
        const vuln = await prisma.vulnerability.findFirst({
          where: { id: vulnId, userId: user.id },
        });
        if (vuln && vuln.status !== "REMEDIATED" && vuln.status !== "FALSE_POSITIVE") {
          await prisma.vulnerability.update({
            where: { id: vulnId },
            data: {
              status: "REMEDIATED",
              remediatedAt: new Date(),
            },
          });
        }
      } catch (vulnError) {
        // No bloqueamos la respuesta si falla la actualización de la vulnerabilidad
        console.error("Error actualizando vulnerabilidad vinculada:", vulnError);
      }
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Error al actualizar incidente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Verificar que el incidente pertenece al usuario
    const existingIncident = await prisma.incident.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: "Incidente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.incident.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting incident:", error);
    return NextResponse.json(
      { error: "Error al eliminar incidente" },
      { status: 500 }
    );
  }
}
