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

    const risks = await (prisma as any).riskAssessment.findMany({
      where: { userId: user.id },
      include: {
        controls: true,
        treatments: true,
      },
      orderBy: { riskScore: 'desc' },
    });

    return NextResponse.json(risks);
  } catch (error) {
    console.error("Error fetching risks:", error);
    return NextResponse.json(
      { error: "Error al obtener evaluaciones de riesgo" },
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
    const { title, description, category, probability, impact, owner } = body;

    // Calculate risk scores
    const riskScore = probability * impact;
    const inherentRisk = riskScore; // Before controls
    const residualRisk = riskScore * 0.7; // Assume 30% reduction from controls

    const risk = await (prisma as any).riskAssessment.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        probability,
        impact,
        riskScore,
        inherentRisk,
        residualRisk,
        riskAppetite: 2.0, // Default acceptable risk level
        owner: owner || null,
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    });

    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    console.error("Error creating risk assessment:", error);
    return NextResponse.json(
      { error: "Error al crear evaluación de riesgo" },
      { status: 500 }
    );
  }
}