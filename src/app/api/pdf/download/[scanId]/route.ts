import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePDF } from "@/lib/pdf-generator";

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

    // Check if user has purchased this PDF
    const purchase = await prisma.pdfPurchase.findFirst({
      where: {
        scanId: params.scanId,
        userId: user!.id,
      },
      include: {
        scan: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "No has comprado este reporte" },
        { status: 403 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(purchase.scan);

    return new NextResponse(pdfBuffer, {
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
