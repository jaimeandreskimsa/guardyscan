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
    const { title, description, severity, category, affectedSystems, assignedTo, notes, status } = body;

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
