import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// Endpoint de prueba para verificar configuración SMTP
// Solo para debugging - eliminar en producción
export async function GET(request: NextRequest) {
  try {
    // Verificar variables de entorno
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASSWORD,
    };

    console.log("📧 Configuración SMTP:", config);

    // Intentar enviar email de prueba
    const testEmail = "jaimegomez@kimsa.io"; // Email de prueba
    
    const result = await sendEmail({
      to: testEmail,
      subject: "Test Email - GuardyScan",
      html: "<h1>Email de Prueba</h1><p>Si recibes esto, el SMTP funciona correctamente.</p>",
    });

    return NextResponse.json({
      success: true,
      config,
      emailResult: result,
      message: "Revisa tu email en " + testEmail,
    });
  } catch (error: any) {
    console.error("❌ Error en test de email:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        hasPassword: !!process.env.SMTP_PASSWORD,
      }
    }, { status: 500 });
  }
}
