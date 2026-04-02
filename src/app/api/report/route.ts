import { NextRequest, NextResponse } from "next/server";
import { generateExecutiveReportPDF } from "@/lib/pdf-generator";
import { getReportData } from "@/lib/report-data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateReportAnalysis } from "@/lib/claude-report";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await getReportData(session.user.id);

    // Generar análisis con Claude (lenguaje técnico + ejecutivo)
    let claudeAnalysis = null;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        claudeAnalysis = await generateReportAnalysis({
          company: data.company,
          period: data.period,
          summary: data.summary,
          scans: data.scans,
          incidents: data.incidents,
          vulnerabilities: data.vulnerabilities,
          compliance: data.compliance,
        });
      } catch (e) {
        console.error("Claude report analysis failed, continuing without AI text:", e);
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


