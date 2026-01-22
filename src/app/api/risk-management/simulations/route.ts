import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { name, description, riskFactors, iterations, confidenceLevel } = body;

    // Run Monte Carlo simulation
    const simulationResults = runMonteCarloSimulation(riskFactors, iterations || 10000);

    const simulation = await (prisma as any).monteCarloSimulation.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
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