import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Maps vuln/incident severity to probability and monetary impact (€)
const SEVERITY_MAP: Record<string, { probability: number; impact: number }> = {
  CRITICAL: { probability: 0.85, impact: 500000 },
  HIGH:     { probability: 0.65, impact: 200000 },
  MEDIUM:   { probability: 0.40, impact:  75000 },
  LOW:      { probability: 0.20, impact:  20000 },
  INFO:     { probability: 0.10, impact:   5000 },
};

async function buildRiskFactorsFromScannedData(userId: string) {
  const [vulns, incidents] = await Promise.all([
    prisma.vulnerability.findMany({
      where: {
        userId,
        status: { notIn: ["REMEDIATED", "FALSE_POSITIVE", "RESOLVED"] },
      },
      select: { title: true, severity: true, assetName: true, cvssScore: true },
    }),
    prisma.incident.findMany({
      where: {
        userId,
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
      select: { title: true, severity: true, category: true },
    }),
  ]);

  const factors: any[] = [];

  // Vulnerabilities → risk factors
  for (const v of vulns) {
    const sev = v.severity?.toUpperCase() ?? "MEDIUM";
    const base = SEVERITY_MAP[sev] ?? SEVERITY_MAP.MEDIUM;
    // If CVSS score exists, refine the impact proportionally (scale: 1–10 → ×0.5–×1.5)
    const cvssMultiplier = v.cvssScore ? 0.5 + (v.cvssScore / 10) : 1;
    factors.push({
      name: v.assetName ? `[Vuln] ${v.title} (${v.assetName})` : `[Vuln] ${v.title}`,
      probability: base.probability,
      impact: Math.round(base.impact * cvssMultiplier),
      source: "vulnerability",
      severity: sev,
      distribution: "normal",
    });
  }

  // Incidents → risk factors (active incidents raise the probability)
  for (const inc of incidents) {
    const sev = inc.severity?.toUpperCase() ?? "MEDIUM";
    const base = SEVERITY_MAP[sev] ?? SEVERITY_MAP.MEDIUM;
    factors.push({
      name: `[Incidente] ${inc.title}`,
      probability: Math.min(base.probability + 0.15, 0.99), // active incidents are more likely to recur
      impact: Math.round(base.impact * 1.2),
      source: "incident",
      severity: sev,
      distribution: "normal",
    });
  }

  return factors;
}

// Simple Monte Carlo simulation function
function runMonteCarloSimulation(riskFactors: any[], iterations: number = 10000) {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    let totalLoss = 0;
    
    for (const factor of riskFactors) {
      // Simple random sampling for demonstration
      const probability = Math.random();
      
      if (probability <= factor.probability) {
        // Event occurs, apply impact with some variance
        const variance = 0.2; // 20% variance
        const impact = factor.impact * (1 + (Math.random() - 0.5) * variance);
        totalLoss += impact;
      }
    }
    
    results.push(totalLoss);
  }
  
  results.sort((a, b) => a - b);
  
  // Calculate statistics
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
  const var95Index = Math.floor(iterations * 0.95);
  const var99Index = Math.floor(iterations * 0.99);
  
  return {
    results: results.slice(0, 1000), // Return first 1000 for charting
    statistics: {
      mean,
      median: results[Math.floor(iterations * 0.5)],
      var95: results[var95Index],
      var99: results[var99Index],
      max: results[iterations - 1],
      min: results[0],
      standardDeviation: Math.sqrt(
        results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / iterations
      )
    }
  };
}

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

    const simulations = await (prisma as any).monteCarloSimulation.findMany({
      where: { userId: user.id },
      orderBy: { runDate: 'desc' },
      take: 10,
    });

    return NextResponse.json(simulations);
  } catch (error) {
    console.error("Error fetching simulations:", error);
    return NextResponse.json(
      { error: "Error al obtener simulaciones" },
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
    const { name, description, riskFactors: manualFactors, iterations, confidenceLevel, useScannedData } = body;

    // If useScannedData flag is set, build risk factors from real vuln/incident data
    let riskFactors = manualFactors;
    let simulationName = name;
    let simulationDescription = description;

    if (useScannedData) {
      riskFactors = await buildRiskFactorsFromScannedData(user.id);
      simulationName = `Simulación de datos escaneados — ${new Date().toLocaleDateString("es-ES")}`;
      simulationDescription = `Factores de riesgo generados automáticamente a partir de ${riskFactors.filter((f: any) => f.source === "vulnerability").length} vulnerabilidades activas y ${riskFactors.filter((f: any) => f.source === "incident").length} incidentes abiertos.`;

      if (riskFactors.length === 0) {
        return NextResponse.json(
          { error: "No hay vulnerabilidades ni incidentes activos para simular. Realiza un escaneo primero." },
          { status: 400 }
        );
      }
    }

    // Run Monte Carlo simulation
    const simulationResults = runMonteCarloSimulation(riskFactors, iterations || 10000);

    const simulation = await (prisma as any).monteCarloSimulation.create({
      data: {
        userId: user.id,
        name: simulationName,
        description: simulationDescription || null,
        riskFactors,
        iterations: iterations || 10000,
        results: simulationResults,
        confidenceLevel: confidenceLevel || 0.95,
        var95: simulationResults.statistics.var95,
        var99: simulationResults.statistics.var99,
        expectedLoss: simulationResults.statistics.mean,
        worstCase: simulationResults.statistics.max,
        bestCase: simulationResults.statistics.min,
        runDate: new Date(),
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    console.error("Error creating simulation:", error);
    return NextResponse.json(
      { error: "Error al crear simulación Monte Carlo" },
      { status: 500 }
    );
  }
}