import { NextRequest, NextResponse } from "next/server";
import { generateExecutiveReportPDF } from "@/lib/pdf-generator";
import { getReportData } from "@/lib/report-data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateReportAnalysis } from "@/lib/claude-report";
import { getLastDiagnostic } from "@/lib/claude";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await getReportData(userId);

    // Generar análisis con Claude (lenguaje técnico + ejecutivo)
    // Se guarda automáticamente en DB para uso como fallback futuro
    let claudeAnalysis = null;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        claudeAnalysis = await generateReportAnalysis(
          {
            company: data.company,
            period: data.period,
            summary: data.summary,
            scans: data.scans,
            incidents: data.incidents,
            vulnerabilities: data.vulnerabilities,
            compliance: data.compliance,
          },
          userId
        );
      } catch (e) {
        console.error("Claude report analysis failed, buscando análisis guardado:", e);
        // Fallback: último análisis guardado en la BD para este usuario
        const last = await getLastDiagnostic(userId, "report_analysis");
        if (last) {
          try { claudeAnalysis = JSON.parse(last); } catch (_) { /* ignorar */ }
        }
      }
    }

    const pdfBuffer = await generateExecutiveReportPDF({ ...data, claudeAnalysis });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Informe-Ejecutivo-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}



