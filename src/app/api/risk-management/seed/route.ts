import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

    // Sample Risk Assessments
    const sampleRisks = [
      {
        userId: user.id,
        title: "Vulnerabilidad crítica en servidor web",
        description: "Vulnerabilidad de ejecución remota de código en Apache HTTP Server",
        category: "TECHNICAL",
        probability: 4,
        impact: 5,
        riskScore: 20,
        inherentRisk: 20,
        residualRisk: 12,
        riskAppetite: 5.0,
        owner: "CISO",
        nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        title: "Fuga de datos por empleado",
        description: "Riesgo de filtración de información confidencial por personal interno",
        category: "OPERATIONAL",
        probability: 2,
        impact: 4,
        riskScore: 8,
        inherentRisk: 8,
        residualRisk: 4,
        riskAppetite: 3.0,
        owner: "HR Manager",
        nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        title: "Interrupción del centro de datos",
        description: "Caída del data center principal por falla eléctrica o desastre natural",
        category: "ENVIRONMENTAL",
        probability: 1,
        impact: 5,
        riskScore: 5,
        inherentRisk: 5,
        residualRisk: 2,
        riskAppetite: 2.0,
        owner: "IT Manager",
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        title: "Cumplimiento GDPR",
        description: "Incumplimiento de normativas de protección de datos",
        category: "COMPLIANCE",
        probability: 3,
        impact: 4,
        riskScore: 12,
        inherentRisk: 12,
        residualRisk: 6,
        riskAppetite: 4.0,
        owner: "DPO",
        nextReview: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    ];

    // Sample BIA Data
    const sampleBIA = [
      {
        userId: user.id,
        assetName: "Sistema de facturación",
        assetType: "APPLICATION",
        businessFunction: "Ventas y facturación",
        criticality: "CRITICAL",
        rto: 4,
        rpo: 1,
        mtpd: 24,
        financialImpact: 50000000,
        operationalImpact: "Pérdida total de capacidad de facturación",
        reputationalImpact: "Alto impacto en confianza del cliente",
        dependencies: "Base de datos principal, red corporativa",
        alternatives: "Sistema de facturación manual",
        lastReviewed: new Date(),
      },
      {
        userId: user.id,
        assetName: "Base de datos de clientes",
        assetType: "DATABASE",
        businessFunction: "Gestión de relaciones con clientes",
        criticality: "CRITICAL",
        rto: 2,
        rpo: 0.5,
        mtpd: 8,
        financialImpact: 75000000,
        operationalImpact: "Imposibilidad de atender clientes",
        reputationalImpact: "Muy alto impacto reputacional",
        dependencies: "Servidores principales, sistema de backup",
        alternatives: "Backup en sitio secundario",
        lastReviewed: new Date(),
      },
      {
        userId: user.id,
        assetName: "Portal web corporativo",
        assetType: "APPLICATION",
        businessFunction: "Marketing y ventas online",
        criticality: "HIGH",
        rto: 8,
        rpo: 4,
        mtpd: 48,
        financialImpact: 25000000,
        operationalImpact: "Pérdida de ventas online",
        reputationalImpact: "Impacto medio en imagen corporativa",
        dependencies: "CDN, servidores web, base de datos",
        alternatives: "Página de mantenimiento",
        lastReviewed: new Date(),
      },
    ];

    // Sample Third Party Risks
    const sampleThirdParty = [
      {
        userId: user.id,
        vendorName: "CloudProvider Inc.",
        vendorType: "CLOUD_PROVIDER",
        contractValue: 120000000,
        criticality: "CRITICAL",
        dataAccess: true,
        systemAccess: true,
        geographicLocation: "Estados Unidos",
        certifications: ["ISO27001", "SOC2", "GDPR"],
        riskScore: 25,
        securityRating: "B",
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        vendorName: "Payment Processor SA",
        vendorType: "FINANCIAL_SERVICE",
        contractValue: 80000000,
        criticality: "HIGH",
        dataAccess: true,
        systemAccess: false,
        geographicLocation: "Chile",
        certifications: ["PCI-DSS", "ISO27001"],
        riskScore: 20,
        securityRating: "A",
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        vendorName: "Analytics Corp",
        vendorType: "ANALYTICS",
        contractValue: 15000000,
        criticality: "MEDIUM",
        dataAccess: false,
        systemAccess: true,
        geographicLocation: "Brasil",
        certifications: ["ISO27001"],
        riskScore: 35,
        securityRating: "C",
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    // Create sample data
    const risks = await Promise.all(
      sampleRisks.map(risk => (prisma as any).riskAssessment.create({ data: risk }))
    );

    const biaData = await Promise.all(
      sampleBIA.map(bia => (prisma as any).businessImpactAnalysis.create({ data: bia }))
    );

    const thirdPartyData = await Promise.all(
      sampleThirdParty.map(tp => (prisma as any).thirdPartyRisk.create({ data: tp }))
    );

    // Create a sample Monte Carlo simulation
    const simulationData = {
      userId: user.id,
      name: "Análisis de riesgo cibernético Q1 2024",
      description: "Simulación Monte Carlo para evaluar pérdidas potenciales por incidentes de seguridad",
      riskFactors: [
        { name: "Ransomware", probability: 0.15, impact: 1000000 },
        { name: "Fuga de datos", probability: 0.08, impact: 2500000 },
        { name: "DDoS", probability: 0.25, impact: 500000 },
        { name: "Insider threat", probability: 0.05, impact: 1500000 },
      ],
      iterations: 10000,
      results: {
        results: [], // Would contain simulation results
        statistics: {
          mean: 450000,
          var95: 1200000,
          var99: 2100000,
          max: 4500000,
          min: 0,
        },
      },
      confidenceLevel: 0.95,
      var95: 1200000,
      var99: 2100000,
      expectedLoss: 450000,
      worstCase: 4500000,
      bestCase: 0,
      runDate: new Date(),
    };

    const simulation = await (prisma as any).monteCarloSimulation.create({
      data: simulationData
    });

    return NextResponse.json({
      message: "Datos de ejemplo creados exitosamente",
      data: {
        risks: risks.length,
        bia: biaData.length,
        thirdParty: thirdPartyData.length,
        simulation: simulation.id,
      }
    });

  } catch (error) {
    console.error("Error creating sample data:", error);
    return NextResponse.json(
      { error: "Error al crear datos de ejemplo" },
      { status: 500 }
    );
  }
}