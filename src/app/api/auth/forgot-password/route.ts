import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

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

    // Por seguridad, siempre respondemos con éxito aunque el usuario no exista
    // Esto evita que atacantes puedan enumerar emails válidos
    if (!user) {
      return NextResponse.json({
        message: "Si el correo existe, recibirás instrucciones para recuperar tu contraseña",
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generar enlace de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    // Log para debugging
    console.log("🔐 Generando enlace de reset para:", email);

    // Enviar email con SMTP
    try {
      const emailHtml = getPasswordResetEmailTemplate(resetUrl);
      const result = await sendEmail({
        to: email,
        subject: "Recuperación de Contraseña - GuardyScan",
        html: emailHtml,
      });

      if (result.success) {
        console.log("✅ Email de recuperación enviado a:", email);
      } else {
        console.error("❌ Error enviando email:", result.error);
        // Log del enlace en caso de fallo del email (para debugging)
        console.log("🔐 Password Reset Link (backup):", resetUrl);
      }
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // Log del enlace en caso de error
      console.log("🔐 Password Reset Link (backup):", resetUrl);
      // No retornamos error para no revelar si el email existe
    }

    return NextResponse.json({
      message: "Si el correo existe, recibirás instrucciones para recuperar tu contraseña",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
