import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScanAnalysis } from "@/lib/claude-report";
import { getLastDiagnostic, saveDiagnostic } from "@/lib/claude";

// Allow up to 60 seconds — Claude can take 15-30 s on first call
export const maxDuration = 60;

/**
 * GET /api/scans/[scanId]/analysis
 * Returns Claude AI analysis for a scan.
 * Strategy: serve cached DB result instantly if available, otherwise call Claude.
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

    // ── 1. Try cached result first (instant, no API cost) ──────────
    const cached = await getLastDiagnostic(user.id, `scan_analysis_${params.scanId}`);
    if (cached) {
      try {
        return NextResponse.json({ analysis: JSON.parse(cached), cached: true });
      } catch (_) { /* corrupted — regenerate below */ }
    }

    // ── 2. Also accept generic scan_analysis as fallback ──────────
    const genericCached = await getLastDiagnostic(user.id, "scan_analysis");
    if (genericCached) {
      try {
        const parsed = JSON.parse(genericCached);
        // Verify it has the expected keys before serving
        if (parsed.diagnosticoEjecutivo || parsed.analisisTecnico) {
          return NextResponse.json({ analysis: parsed, cached: true });
        }
      } catch (_) { /* corrupted, proceed */ }
    }

    // ── 3. No cache — call Claude ──────────────────────────────────
    const scanData = {
      domain: (scan as any).targetUrl || "Dominio",
      score: ((scan as any).score as number) || 0,
      vulnerabilities: ((scan as any).vulnerabilities as any[]) || [],
      openPorts: ((scan as any).openPorts as any[]) || [],
      technologies: ((scan as any).technologies as any[]) || [],
      sslInfo: ((scan as any).sslInfo as any) || {},
      securityHeaders: ((scan as any).securityHeaders as any) || {},
      performance: ((scan as any).performance as any) || {},
    };

    let analysis: any = null;
    try {
      analysis = await generateScanAnalysis(scanData, user.id);
      // Save with scan-specific key so future opens are instant
      if (analysis) {
        await saveDiagnostic({
          userId: user.id,
          type: `scan_analysis_${params.scanId}`,
          content: JSON.stringify(analysis),
          context: `${scanData.domain} — score ${scanData.score}`,
        });
      }
    } catch (claudeErr) {
      console.error("[analysis route] Claude and DB fallback both failed:", claudeErr);
      // Return null analysis — UI shows friendly message, not error
      return NextResponse.json({ analysis: null });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Scan analysis route error:", error);
    // Always return 200 with null so the UI shows the friendly empty state
    return NextResponse.json({ analysis: null });
  }
}
