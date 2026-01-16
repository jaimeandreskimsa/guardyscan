import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PDF_REPORT_PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { scanId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Check if scan exists and belongs to user
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
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

    // Check if already purchased
    const existingPurchase = await prisma.pdfPurchase.findFirst({
      where: { scanId, userId: user.id },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Ya has comprado este reporte" },
        { status: 400 }
      );
    }

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.subscription.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session for PDF purchase
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PDF_REPORT_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans/${scanId}?pdf_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans/${scanId}?pdf_canceled=true`,
      metadata: {
        userId: user.id,
        scanId,
        type: "pdf_report",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("PDF checkout error:", error);
    return NextResponse.json(
      { error: "Error al crear sesión de pago" },
      { status: 500 }
    );
  }
}
