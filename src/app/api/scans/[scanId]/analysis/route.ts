import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScanAnalysis } from "@/lib/claude-report";

/**
 * GET /api/scans/[scanId]/analysis
 * Generates (or fetches cached) Claude AI analysis for a specific scan.
 * Used by the "Ver Informe" modal to display non-technical explanations.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
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

    const scan = await prisma.scan.findFirst({
      where: { id: params.scanId, userId: user.id },
    });
    if (!scan) {
      return NextResponse.json({ error: "Escaneo no encontrado" }, { status: 404 });
    }

    const scanData = {
      domain: (scan as any).domain || (scan as any).targetUrl || "Dominio",
      score: ((scan as any).score as number) || 0,
      vulnerabilities: ((scan as any).vulnerabilities as any[]) || [],
      openPorts: ((scan as any).openPorts as any[]) || [],
      technologies: ((scan as any).technologies as any[]) || [],
      sslInfo: ((scan as any).sslInfo as any) || {},
      securityHeaders: ((scan as any).securityHeaders as any) || {},
      performance: ((scan as any).performance as any) || {},
      createdAt: scan.createdAt,
    };

    const analysis = await generateScanAnalysis(scanData, user.id);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Scan analysis error:", error);
    return NextResponse.json(
      { error: "No se pudo generar el análisis" },
      { status: 500 }
    );
  }
}
