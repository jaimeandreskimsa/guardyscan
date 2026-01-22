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

    const members = await (prisma as any).committeeMember.findMany({
      where: { userId: user.id },
      orderBy: [
        { status: 'desc' }, // ACTIVE first
        { appointedDate: 'desc' }
      ],
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching committee members:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros del comité" },
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
    const { name, role, email, phone, department, responsibilities, notes } = body;

    if (!name || !role || !email) {
      return NextResponse.json(
        { error: "Nombre, rol y email son obligatorios" },
        { status: 400 }
      );
    }

    const member = await (prisma as any).committeeMember.create({
      data: {
        userId: user.id,
        name,
        role,
        email,
        phone: phone || null,
        department: department || null,
        responsibilities: responsibilities || null,
        notes: notes || null,
        appointedDate: new Date(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating committee member:", error);
    return NextResponse.json(
      { error: "Error al crear miembro del comité" },
      { status: 500 }
    );
  }
}
