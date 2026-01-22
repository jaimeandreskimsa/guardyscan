import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const control = await prisma.complianceControl.findUnique({
      where: { id: params.id },
    });

    if (!control) {
      return NextResponse.json(
        { error: "Control no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(control);
  } catch (error) {
    console.error("Error loading control:", error);
    return NextResponse.json(
      { error: "Error al cargar control" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { frameworkId, title, description, domain, priority } = body;
    
    let control;
    
    // Try to find existing control by controlId (e.g., "A.5.1" or "L1")
    const existing = await prisma.complianceControl.findFirst({
      where: {
        frameworkId: frameworkId || "clwxyz123",
        controlId: params.id,
      },
    });

    if (existing) {
      // Update existing
      control = await prisma.complianceControl.update({
        where: { id: existing.id },
        data: {
          title: title !== undefined ? title : existing.title,
          description: description !== undefined ? description : existing.description,
          domain: domain !== undefined ? domain : existing.domain,
          priority: priority !== undefined ? priority : existing.priority,
        },
      });
    } else {
      // Create new control if we have the required data
      if (!frameworkId || !title || !description || !domain) {
        return NextResponse.json(
          { error: "Faltan datos requeridos para crear el control" },
          { status: 400 }
        );
      }
      
      control = await prisma.complianceControl.create({
        data: {
          frameworkId,
          controlId: params.id,
          title,
          description,
          domain,
          category: domain,
          priority: priority || "MEDIUM",
        },
      });
    }

    return NextResponse.json(control);
  } catch (error) {
    console.error("Error updating control:", error);
    return NextResponse.json(
      { error: "Error al actualizar control" },
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

    await prisma.complianceControl.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting control:", error);
    return NextResponse.json(
      { error: "Error al eliminar control" },
      { status: 500 }
    );
  }
}
