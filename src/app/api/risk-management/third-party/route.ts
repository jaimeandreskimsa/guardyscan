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

    const thirdParties = await (prisma as any).thirdPartyRisk.findMany({
      where: { userId: user.id },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    return NextResponse.json(thirdParties);
  } catch (error) {
    console.error("Error fetching third-party risks:", error);
    return NextResponse.json(
      { error: "Error al obtener riesgos de terceros" },
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
      vendorName,
      vendorType,
      contractValue,
      criticality,
      dataAccess,
      systemAccess,
      geographicLocation,
      certifications,
      securityRating
    } = body;

    // Calculate risk score based on various factors
    let riskScore = 0;
    
    // Base risk by criticality
    switch (criticality) {
      case "CRITICAL": riskScore += 40; break;
      case "HIGH": riskScore += 30; break;
      case "MEDIUM": riskScore += 20; break;
      case "LOW": riskScore += 10; break;
    }

    // Add risk for data/system access
    if (dataAccess) riskScore += 20;
    if (systemAccess) riskScore += 15;

    // Reduce risk for certifications
    if (certifications && certifications.length > 0) {
      riskScore -= certifications.length * 5;
    }

    // Adjust by security rating
    if (securityRating) {
      switch (securityRating) {
        case "A": riskScore -= 15; break;
        case "B": riskScore -= 10; break;
        case "C": riskScore -= 5; break;
        case "D": riskScore += 10; break;
        case "F": riskScore += 20; break;
      }
    }

    riskScore = Math.max(0, Math.min(100, riskScore)); // Clamp between 0-100

    const thirdParty = await (prisma as any).thirdPartyRisk.create({
      data: {
        userId: user.id,
        vendorName,
        vendorType,
        contractValue: contractValue || null,
        criticality,
        dataAccess: dataAccess || false,
        systemAccess: systemAccess || false,
        geographicLocation: geographicLocation || null,
        certifications: certifications || null,
        riskScore,
        securityRating: securityRating || null,
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    return NextResponse.json(thirdParty, { status: 201 });
  } catch (error) {
    console.error("Error creating third-party risk:", error);
    return NextResponse.json(
      { error: "Error al crear riesgo de terceros" },
      { status: 500 }
    );
  }
}