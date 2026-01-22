import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener detalles de una organización
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.orgId },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } }
          },
          orderBy: { joinedAt: "asc" }
        },
        invitations: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" }
        },
        _count: { select: { members: true, invitations: true } }
      }
    });

    if (!organization) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario tiene acceso
    const isMember = organization.members.some(m => m.userId === session.user.id);
    const isOwner = organization.ownerId === session.user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: "No tienes acceso a esta organización" }, { status: 403 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Error al obtener la organización" }, { status: 500 });
  }
}

// PUT - Actualizar organización
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario es dueño o admin
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.orgId,
          userId: session.user.id
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json({ error: "No tienes permisos para editar esta organización" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, website, industry, size, logo } = body;

    const organization = await prisma.organization.update({
      where: { id: params.orgId },
      data: {
        name: name?.trim(),
        description: description?.trim() || null,
        website: website?.trim() || null,
        industry: industry || null,
        size: size || null,
        logo: logo || null
      }
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json({ error: "Error al actualizar la organización" }, { status: 500 });
  }
}

// DELETE - Eliminar organización
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo el dueño puede eliminar
    const organization = await prisma.organization.findUnique({
      where: { id: params.orgId }
    });

    if (!organization) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    if (organization.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Solo el dueño puede eliminar la organización" }, { status: 403 });
    }

    await prisma.organization.delete({
      where: { id: params.orgId }
    });

    return NextResponse.json({ message: "Organización eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json({ error: "Error al eliminar la organización" }, { status: 500 });
  }
}
