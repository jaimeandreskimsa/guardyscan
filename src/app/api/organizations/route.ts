import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Límites de organizaciones por plan
const ORG_LIMITS: Record<string, number> = {
  FREE: 1,
  BASIC: 1,
  PROFESSIONAL: 1,
  ENTERPRISE: 30,
};

// GET - Obtener organizaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener plan del usuario
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });
    const plan = subscription?.plan || "FREE";
    const orgLimit = ORG_LIMITS[plan] || 1;

    // Obtener organizaciones donde el usuario es dueño o miembro
    const ownedOrganizations = await prisma.organization.findMany({
      where: { ownerId: session.user.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        _count: { select: { members: true, invitations: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const memberOrganizations = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true } }
          }
        }
      }
    });

    return NextResponse.json({
      owned: ownedOrganizations,
      member: memberOrganizations.map(m => ({
        ...m.organization,
        myRole: m.role
      })),
      limits: {
        plan,
        maxOrganizations: orgLimit,
        currentCount: ownedOrganizations.length,
        canCreate: ownedOrganizations.length < orgLimit
      }
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Error al obtener organizaciones" }, { status: 500 });
  }
}

// POST - Crear nueva organización
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar el plan del usuario y límite de organizaciones
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    const plan = subscription?.plan || "FREE";
    const orgLimit = ORG_LIMITS[plan] || 1;

    // Contar organizaciones actuales del usuario
    const currentOrgCount = await prisma.organization.count({
      where: { ownerId: session.user.id }
    });

    if (currentOrgCount >= orgLimit) {
      const planName = plan === "ENTERPRISE" ? "Enterprise" : 
                       plan === "PROFESSIONAL" ? "Profesional" :
                       plan === "BASIC" ? "Básico" : "Gratuito";
      
      if (plan === "ENTERPRISE") {
        return NextResponse.json({ 
          error: `Has alcanzado el límite de ${orgLimit} empresas para el plan ${planName}` 
        }, { status: 403 });
      } else {
        return NextResponse.json({ 
          error: `Tu plan ${planName} solo permite 1 empresa. Actualiza al plan Enterprise para crear hasta 30 empresas.` 
        }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, description, website, industry, size } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre es requerido (mínimo 2 caracteres)" }, { status: 400 });
    }

    // Generar slug único
    let baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        website: website?.trim() || null,
        industry: industry || null,
        size: size || null,
        ownerId: session.user.id
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } }
      }
    });

    // Agregar al dueño como miembro OWNER
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        role: "OWNER"
      }
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json({ error: "Error al crear la organización" }, { status: 500 });
  }
}
