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

    const sessions = await (prisma as any).committeeSession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching committee sessions:", error);
    return NextResponse.json(
      { error: "Error al obtener sesiones del comité" },
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
    const { topic, description, date, time, attendees, decisions, status } = body;

    if (!topic || !date) {
      return NextResponse.json(
        { error: "Tema y fecha son obligatorios" },
        { status: 400 }
      );
    }

    const committeeSession = await (prisma as any).committeeSession.create({
      data: {
        userId: user.id,
        topic,
        description: description || null,
        date: new Date(date),
        time: time || "10:00",
        attendees: attendees || null,
        decisions: decisions || null,
        status: status || "SCHEDULED",
      },
    });

    return NextResponse.json(committeeSession, { status: 201 });
  } catch (error) {
    console.error("Error creating committee session:", error);
    return NextResponse.json(
      { error: "Error al crear sesión del comité" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de sesión requerido" },
        { status: 400 }
      );
    }

    // Convert date string to Date if present
    if (updateData.date && typeof updateData.date === "string") {
      updateData.date = new Date(updateData.date);
    }

    const result = await (prisma as any).committeeSession.updateMany({
      where: { id, userId: user.id },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    const updated = await (prisma as any).committeeSession.findFirst({
      where: { id, userId: user.id },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating committee session:", error);
    return NextResponse.json(
      { error: "Error al actualizar sesión del comité" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de sesión requerido" },
        { status: 400 }
      );
    }

    await (prisma as any).committeeSession.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ message: "Sesión eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting committee session:", error);
    return NextResponse.json(
      { error: "Error al eliminar sesión del comité" },
      { status: 500 }
    );
  }
}
