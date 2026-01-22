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

    const biaData = await (prisma as any).businessImpactAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { criticality: 'desc' },
    });

    return NextResponse.json(biaData);
  } catch (error) {
    console.error("Error fetching BIA data:", error);
    return NextResponse.json(
      { error: "Error al obtener análisis de impacto empresarial" },
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
    const { 
      assetName, 
      assetType, 
      businessFunction, 
      criticality, 
      rto, 
      rpo, 
      mtpd,
      financialImpact,
      operationalImpact,
      reputationalImpact,
      dependencies,
      alternatives
    } = body;

    const bia = await (prisma as any).businessImpactAnalysis.create({
      data: {
        userId: user.id,
        assetName,
        assetType,
        businessFunction,
        criticality,
        rto: rto || null,
        rpo: rpo || null,
        mtpd: mtpd || null,
        financialImpact: financialImpact || null,
        operationalImpact: operationalImpact || null,
        reputationalImpact: reputationalImpact || null,
        dependencies: dependencies || null,
        alternatives: alternatives || null,
        lastReviewed: new Date(),
      },
    });

    return NextResponse.json(bia, { status: 201 });
  } catch (error) {
    console.error("Error creating BIA:", error);
    return NextResponse.json(
      { error: "Error al crear análisis de impacto empresarial" },
      { status: 500 }
    );
  }
}