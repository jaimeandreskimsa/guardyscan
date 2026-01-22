import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
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

    const member = await (prisma as any).committeeMember.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Miembro del comité no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching committee member:", error);
    return NextResponse.json(
      { error: "Error al obtener miembro del comité" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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

    const body = await request.json();
    const { name, role, email, phone, department, responsibilities, notes, status } = body;

    const member = await (prisma as any).committeeMember.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        name,
        role,
        email,
        phone: phone || null,
        department: department || null,
        responsibilities: responsibilities || null,
        notes: notes || null,
        status: status || "ACTIVE",
      },
    });

    if (member.count === 0) {
      return NextResponse.json(
        { error: "Miembro del comité no encontrado" },
        { status: 404 }
      );
    }

    const updatedMember = await (prisma as any).committeeMember.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating committee member:", error);
    return NextResponse.json(
      { error: "Error al actualizar miembro del comité" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
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

    await (prisma as any).committeeMember.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Miembro del comité eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting committee member:", error);
    return NextResponse.json(
      { error: "Error al eliminar miembro del comité" },
      { status: 500 }
    );
  }
}
