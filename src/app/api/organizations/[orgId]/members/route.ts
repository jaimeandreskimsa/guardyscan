import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// GET - Obtener miembros de una organización
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar acceso
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.orgId,
          userId: session.user.id
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a esta organización" }, { status: 403 });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: params.orgId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      },
      orderBy: { joinedAt: "asc" }
    });

    const invitations = await prisma.organizationInvitation.findMany({
      where: { 
        organizationId: params.orgId,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ members, invitations });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Error al obtener miembros" }, { status: 500 });
  }
}

// POST - Invitar nuevo miembro
export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (OWNER o ADMIN)
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.orgId,
          userId: session.user.id
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json({ error: "No tienes permisos para invitar miembros" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "MEMBER" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      // Verificar si ya es miembro
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: params.orgId,
            userId: existingUser.id
          }
        }
      });

      if (existingMember) {
        return NextResponse.json({ error: "Este usuario ya es miembro de la organización" }, { status: 400 });
      }

      // Agregar directamente como miembro
      const newMember = await prisma.organizationMember.create({
        data: {
          organizationId: params.orgId,
          userId: existingUser.id,
          role: role
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } }
        }
      });

      return NextResponse.json({ 
        type: "member_added",
        member: newMember,
        message: "Usuario agregado como miembro" 
      }, { status: 201 });
    }

    // El usuario no existe, crear invitación
    const existingInvitation = await prisma.organizationInvitation.findUnique({
      where: {
        organizationId_email: {
          organizationId: params.orgId,
          email: email.toLowerCase()
        }
      }
    });

    if (existingInvitation) {
      // Actualizar invitación existente
      const invitation = await prisma.organizationInvitation.update({
        where: { id: existingInvitation.id },
        data: {
          role: role,
          token: randomBytes(32).toString("hex"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        }
      });

      return NextResponse.json({ 
        type: "invitation_updated",
        invitation,
        message: "Invitación actualizada" 
      });
    }

    // Crear nueva invitación
    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: params.orgId,
        email: email.toLowerCase(),
        role: role,
        token: randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      }
    });

    return NextResponse.json({ 
      type: "invitation_sent",
      invitation,
      message: "Invitación enviada (el usuario debe registrarse primero)" 
    }, { status: 201 });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json({ error: "Error al invitar miembro" }, { status: 500 });
  }
}
