import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email";
import crypto from "crypto";

// Force rebuild to clear Prisma cache - v2
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log("📧 Solicitud de reset recibida para:", email);

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log("🔍 Usuario encontrado:", !!user);

    // Validar que el usuario exista
    if (!user) {
      console.log("⚠️ Usuario no existe");
      return NextResponse.json(
        { error: "No existe una cuenta registrada con este correo electrónico" },
        { status: 404 }
      );
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    console.log("🔑 Token generado, actualizando BD...");

    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    console.log("✅ Token guardado en BD");

    // Generar enlace de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    console.log("🔐 Enlace de reset:", resetUrl);

    // Enviar email con SMTP
    try {
      const emailHtml = getPasswordResetEmailTemplate(resetUrl);
      console.log("📤 Enviando email...");
      
      const result = await sendEmail({
        to: email,
        subject: "Recuperación de Contraseña - GuardyScan",
        html: emailHtml,
      });

      if (result.success) {
        console.log("✅ Email de recuperación enviado exitosamente");
      } else {
        console.error("❌ Error enviando email:", result.error);
      }
    } catch (emailError: any) {
      console.error("❌ Excepción al enviar email:", emailError.message);
      // No retornamos error para no revelar si el email existe
    }

    return NextResponse.json({
      message: "Si el correo existe, recibirás instrucciones para recuperar tu contraseña",
    });
  } catch (error: any) {
    console.error("❌ Error general en forgot-password:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
