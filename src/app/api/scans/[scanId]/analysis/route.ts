import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScanAnalysis } from "@/lib/claude-report";
import { getLastDiagnostic, saveDiagnostic } from "@/lib/claude";

// Claude can take 15–30 s — give Vercel enough time
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/scans/[scanId]/analysis?force=true
 * Returns Claude AI analysis for a scan.
 * - Serves DB-cached result instantly (zero latency, zero API cost)
 * - ?force=true bypasses cache and regenerates (used by Retry button)
 * - Pre-generation happens in scanner.ts after scan completes
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

    const force = request.nextUrl.searchParams.get("force") === "true";

    // ── 1. Scan-specific cache (instant) ──────────────────────────
    if (!force) {
      const cached = await getLastDiagnostic(user.id, `scan_analysis_${params.scanId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.diagnosticoEjecutivo) {
            return NextResponse.json({ analysis: parsed, cached: true });
          }
        } catch (_) { /* corrupted, regenerate */ }
      }
    }

    // ── 2. Call Claude with full scan data ─────────────────────────
    const scanData = {
      domain: (scan as any).targetUrl || "Dominio",
      score: ((scan as any).score as number) || 0,
      vulnerabilities: ((scan as any).vulnerabilities as any[]) || [],
      openPorts: ((scan as any).openPorts as any[]) || [],
      technologies: ((scan as any).technologies as any[]) || [],
      sslInfo: ((scan as any).sslInfo as any) || {},
      securityHeaders: ((scan as any).securityHeaders as any) || {},
      performance: ((scan as any).performance as any) || {},
      firewall: ((scan as any).firewall as any) || {},
      compliance: ((scan as any).compliance as any) || {},
      dnsRecords: ((scan as any).dnsRecords as any) || {},
      cookies: ((scan as any).cookies as any) || {},
    };

    let analysis: any = null;
    try {
      analysis = await generateScanAnalysis(scanData, user.id);
      if (analysis) {
        // Save with scan-specific key — next open is instant
        await saveDiagnostic({
          userId: user.id,
          type: `scan_analysis_${params.scanId}`,
          content: JSON.stringify(analysis),
          context: `${scanData.domain} — score ${scanData.score}`,
        });
      }
    } catch (claudeErr) {
      console.error("[analysis route] Claude failed:", claudeErr);
      return NextResponse.json({ analysis: null });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[analysis route] Unexpected error:", error);
    return NextResponse.json({ analysis: null });
  }
}

