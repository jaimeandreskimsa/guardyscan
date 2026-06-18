import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const frameworkId = searchParams.get("framework") || "LEY21663";

    const states = await (prisma as any).userComplianceState.findMany({
      where: { userId: session.user.id, frameworkId },
      orderBy: { controlId: "asc" },
    });

    return NextResponse.json(states);
  } catch (error) {
    console.error("Error loading compliance states:", error);
    return NextResponse.json({ error: "Error al cargar controles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { frameworkId, controlId, title, description, domain, priority } = body;

    const control = await prisma.complianceControl.create({
      data: {
        frameworkId: frameworkId || "ISO27001",
        controlId,
        title: title || controlId,
        description: description || "",
        domain: domain || "General",
        priority: priority || "MEDIUM",
        category: domain,
      },
    });

    return NextResponse.json(control, { status: 201 });
  } catch (error) {
    console.error("Error creating compliance control:", error);
    return NextResponse.json(
      { error: "Error al crear control" },
      { status: 500 }
    );
  }
}
