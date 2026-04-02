import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePDF } from "@/lib/pdf-generator";
import { generateScanAnalysis } from "@/lib/claude-report";

// Claude can take 15-30 s — give Vercel enough time
export const maxDuration = 60;

export async function GET(
  req: Request,
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

    // Get the scan directly (user must own the scan)
    const scan = await prisma.scan.findFirst({
      where: {
        id: params.scanId,
        userId: user.id,
        status: "COMPLETED",
      },
    });

    if (!scan) {
      return NextResponse.json(
        { error: "Escaneo no encontrado o no completado" },
        { status: 404 }
      );
    }

    // Prepare scan data for PDF generation
    const scanData = {
      ...scan,
      domain: scan.targetUrl,          // generatePDF reads .domain
      vulnerabilities: (scan.vulnerabilities as any[]) || [],
      technologies: (scan.technologies as string[]) || [],
      openPorts: (scan.openPorts as any[]) || [],
      sslInfo: (scan.sslInfo as any) || {},
      securityHeaders: (scan.securityHeaders as any) || {},
      compliance: (scan.compliance as any) || {},
      performance: (scan.performance as any) || {},
      firewall: (scan.firewall as any) || {},
      dnsRecords: (scan.dnsRecords as any) || {},
      cookies: (scan.cookies as any) || {},
    };

    // Generate Claude analysis — this becomes the AI narrative page in the PDF
    let claudeAnalysis = null;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        claudeAnalysis = await generateScanAnalysis(
          {
            domain: scan.targetUrl,
            score: (scan.score as number) || 0,
            vulnerabilities: scanData.vulnerabilities,
            openPorts: scanData.openPorts,
            technologies: scanData.technologies,
            sslInfo: scanData.sslInfo,
            headers: scanData.securityHeaders,
          },
          user.id
        );
      } catch (e) {
        console.error("[PDF] Claude analysis failed, generating PDF without AI page:", e);
      }
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(scanData as any, claudeAnalysis);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="GuardyScan-Report-${params.scanId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Error al generar PDF" },
      { status: 500 }
    );
  }
}
