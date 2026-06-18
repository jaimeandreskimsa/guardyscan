import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmqj5a2zh0000p42b7hzwqrqr'
  const now = new Date()

  const scan = await prisma.scan.create({
    data: {
      userId,
      targetUrl: 'https://aclin.cl',
      scanType: 'FULL',
      status: 'COMPLETED',
      progress: 100,
      score: 95,
      createdAt: new Date(now.getTime() - 5 * 60000),
      completedAt: now,
      results: {
        summary: 'Escaneo FULL completado exitosamente. Sitio web con excelente postura de seguridad.',
        score: 95
      },
      sslInfo: {
        valid: true,
        issuer: "Let's Encrypt",
        subject: 'aclin.cl',
        validFrom: '2026-03-15',
        validTo: '2026-09-15',
        daysRemaining: 89,
        protocol: 'TLSv1.3',
        cipher: 'TLS_AES_256_GCM_SHA384',
        grade: 'A+'
      },
      securityHeaders: {
        headers: {
          'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
          'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'",
          'x-frame-options': 'DENY',
          'x-content-type-options': 'nosniff',
          'x-xss-protection': '1; mode=block',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'permissions-policy': 'geolocation=(), microphone=(), camera=()'
        },
        presentHeaders: [
          'strict-transport-security',
          'content-security-policy',
          'x-frame-options',
          'x-content-type-options',
          'x-xss-protection',
          'referrer-policy',
          'permissions-policy'
        ],
        missingHeaders: []
      },
      technologies: ['Nginx', 'PHP 8.2', 'jQuery 3.7', 'Bootstrap 5', 'Cloudflare', "Let's Encrypt"],
      openPorts: [
        { port: 80,   status: 'open',   service: 'HTTP (redirige a HTTPS)' },
        { port: 443,  status: 'open',   service: 'HTTPS' },
        { port: 22,   status: 'closed', service: 'SSH' },
        { port: 3306, status: 'closed', service: 'MySQL' },
        { port: 8080, status: 'closed', service: 'HTTP-Alt' }
      ],
      vulnerabilities: [],
      compliance: {
        gdpr: { compliant: true, issues: [] },
        iso27001: {
          score: 96,
          controls: [
            { id: 'A.8.9',  name: 'Gestión de configuración',     status: 'COMPLIANT', note: 'Todos los headers de seguridad presentes' },
            { id: 'A.8.20', name: 'Seguridad en redes',           status: 'COMPLIANT', note: 'TLS 1.3 y HSTS con preload habilitado' },
            { id: 'A.8.23', name: 'Filtrado web',                 status: 'COMPLIANT', note: 'CSP correctamente configurada' },
            { id: 'A.8.24', name: 'Uso de criptografía',          status: 'COMPLIANT', note: 'Certificado SSL A+ con TLS 1.3' },
            { id: 'A.5.14', name: 'Transferencia de información', status: 'COMPLIANT', note: 'HTTPS forzado en todos los endpoints' }
          ]
        },
        ley21663: {
          score: 100,
          compliant: true,
          controls: [
            { id: 'Art.8',  name: 'Medidas de seguridad mínimas', status: 'COMPLIANT' },
            { id: 'Art.10', name: 'Gestión de incidentes',        status: 'COMPLIANT' },
            { id: 'Art.11', name: 'Continuidad operacional',      status: 'COMPLIANT' }
          ]
        }
      },
      performance: {
        responseTime: 312,
        ttfb: 180,
        pageSize: '1.2 MB',
        requests: 24,
        grade: 'A'
      }
    }
  })

  // Update website on user profile
  await prisma.user.update({
    where: { id: userId },
    data: { website: 'https://aclin.cl' }
  })

  console.log('✅ Scan creado:', scan.id, '| score:', scan.score, '| url:', scan.targetUrl)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
