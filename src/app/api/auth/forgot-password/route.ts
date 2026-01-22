import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // TODO: Aquí deberías enviar el email con el enlace de recuperación
    // Por ahora, logueamos el enlace en desarrollo
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    console.log("🔐 Password Reset Link:", resetUrl);
    console.log("📧 Email:", email);

    // En producción, integrar con servicio de email (Resend, SendGrid, etc.)
    /*
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "noreply@guardyscan.com",
          to: email,
          subject: "Recuperación de Contraseña - GuardyScan",
          html: `
            <h2>Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
          `,
        }),
      });
    }
    */

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
