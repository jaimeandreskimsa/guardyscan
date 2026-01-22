import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Actualizar rol de un miembro
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (solo OWNER puede cambiar roles)
    const myMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.orgId,
          userId: session.user.id
        }
      }
    });

    if (!myMembership || myMembership.role !== "OWNER") {
      return NextResponse.json({ error: "Solo el dueño puede cambiar roles" }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // No permitir cambiar rol del dueño
    const targetMember = await prisma.organizationMember.findUnique({
      where: { id: params.memberId }
    });

    if (!targetMember || targetMember.organizationId !== params.orgId) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    if (targetMember.role === "OWNER") {
      return NextResponse.json({ error: "No se puede cambiar el rol del dueño" }, { status: 400 });
    }

    const updatedMember = await prisma.organizationMember.update({
      where: { id: params.memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json({ error: "Error al actualizar el rol" }, { status: 500 });
  }
}

// DELETE - Eliminar miembro de la organización
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos
    const myMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.orgId,
          userId: session.user.id
        }
      }
    });

    const targetMember = await prisma.organizationMember.findUnique({
      where: { id: params.memberId }
    });

    if (!targetMember || targetMember.organizationId !== params.orgId) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    // El usuario puede eliminarse a sí mismo (salir de la org)
    const isSelf = targetMember.userId === session.user.id;
    
    // O puede eliminar si es OWNER o ADMIN
    const canRemove = myMembership && ["OWNER", "ADMIN"].includes(myMembership.role);

    if (!isSelf && !canRemove) {
      return NextResponse.json({ error: "No tienes permisos para eliminar miembros" }, { status: 403 });
    }

    // No permitir eliminar al dueño
    if (targetMember.role === "OWNER") {
      return NextResponse.json({ error: "No se puede eliminar al dueño de la organización" }, { status: 400 });
    }

    // Un ADMIN no puede eliminar a otro ADMIN (solo el OWNER)
    if (targetMember.role === "ADMIN" && myMembership?.role !== "OWNER") {
      return NextResponse.json({ error: "Solo el dueño puede eliminar administradores" }, { status: 403 });
    }

    await prisma.organizationMember.delete({
      where: { id: params.memberId }
    });

    return NextResponse.json({ message: "Miembro eliminado correctamente" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: "Error al eliminar miembro" }, { status: 500 });
  }
}
