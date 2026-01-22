import nodemailer from 'nodemailer';

// Configuración del transporter SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.guardyscan.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || 'noreply@guardyscan.com',
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"GuardyScan" <${process.env.SMTP_USER || 'noreply@guardyscan.com'}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error };
  }
}

// Template para recuperación de contraseña
export function getPasswordResetEmailTemplate(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #ffffff; padding: 40px 30px; }
        .content p { margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 25px 0; font-weight: bold; }
        .button:hover { background: #5568d3; }
        .link-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea; word-break: break-all; margin: 20px 0; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        .footer a { color: #667eea; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Recuperación de Contraseña</h1>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en <strong>GuardyScan</strong>.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <div class="link-box">${resetUrl}</div>
          <div class="warning">
            <strong>⏰ Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
          </div>
          <p style="margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios y tu cuenta está segura.</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            Si tienes problemas con el botón, copia y pega el enlace de arriba en tu navegador.
          </p>
        </div>
        <div class="footer">
          <p><strong>GuardyScan</strong></p>
          <p>Plataforma de Ciberseguridad Empresarial</p>
          <p><a href="https://guardyscan.com">guardyscan.com</a></p>
          <p style="margin-top: 20px; color: #999;">
            © 2026 GuardyScan. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template para bienvenida
export function getWelcomeEmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { background: #ffffff; padding: 40px 30px; }
        .button { display: inline-block; background: #667eea; color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 25px 0; font-weight: bold; }
        .features { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature { margin: 15px 0; padding-left: 30px; position: relative; }
        .feature:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 18px; }
        .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Bienvenido a GuardyScan!</h1>
        </div>
        <div class="content">
          <p>Hola ${name || 'Usuario'},</p>
          <p>¡Gracias por unirte a <strong>GuardyScan</strong>! Tu cuenta ha sido creada exitosamente.</p>
          <div class="features">
            <h3 style="margin-top: 0;">¿Qué puedes hacer ahora?</h3>
            <div class="feature">Ejecutar escaneos de seguridad completos</div>
            <div class="feature">Gestionar vulnerabilidades</div>
            <div class="feature">Generar reportes de cumplimiento (ISO 27001, GDPR)</div>
            <div class="feature">Monitorear eventos de seguridad con SIEM</div>
            <div class="feature">Gestionar riesgos y continuidad de negocio</div>
          </div>
          <div style="text-align: center;">
            <a href="https://guardyscan.com/dashboard" class="button">Ir al Dashboard</a>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
          <p><strong>GuardyScan</strong></p>
          <p>Plataforma de Ciberseguridad Empresarial</p>
          <p>© 2026 GuardyScan. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
