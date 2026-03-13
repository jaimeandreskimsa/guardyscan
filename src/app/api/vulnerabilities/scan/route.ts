import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ── Vulnerability catalog by category ────────────────────────────────────────
const VULNERABILITY_DATABASE = [
  // ── Web Application ───────────────────────────────────────────────────────
  {
    id: 'WEB-001',
    cveId: null,
    cweId: 'CWE-89',
    title: 'Inyección SQL (SQL Injection)',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    category: 'Injection',
    description: 'La aplicación construye consultas SQL concatenando datos del usuario sin sanitización. Un atacante puede manipular la consulta para extraer, modificar o eliminar datos de la base de datos.',
    affectedComponent: 'application',
    assetTypes: ['WEB', 'API', 'APPLICATION'],
    remediation: 'Usar consultas parametrizadas (prepared statements) u ORM. Nunca concatenar input del usuario en SQL. Aplicar principio de mínimo privilegio en la DB.',
    exploitAvailable: true,
    patchAvailable: false,
    references: ['https://owasp.org/www-community/attacks/SQL_Injection', 'https://cwe.mitre.org/data/definitions/89.html'],
    tags: ['OWASP-A03', 'Injection'],
  },
  {
    id: 'WEB-002',
    cveId: null,
    cweId: 'CWE-79',
    title: 'Cross-Site Scripting (XSS) Almacenado',
    severity: 'HIGH',
    cvssScore: 8.0,
    category: 'XSS',
    description: 'La aplicación almacena y renderiza contenido HTML/JS proporcionado por el usuario sin sanitizar, permitiendo a atacantes inyectar scripts maliciosos que se ejecutan en el navegador de otros usuarios.',
    affectedComponent: 'application',
    assetTypes: ['WEB', 'APPLICATION'],
    remediation: 'Sanitizar y codificar todo output HTML. Implementar Content Security Policy (CSP). Usar librerías como DOMPurify.',
    exploitAvailable: true,
    patchAvailable: false,
    references: ['https://owasp.org/www-community/attacks/xss/', 'https://cwe.mitre.org/data/definitions/79.html'],
    tags: ['OWASP-A03', 'XSS'],
  },
  {
    id: 'WEB-003',
    cveId: null,
    cweId: 'CWE-352',
    title: 'Cross-Site Request Forgery (CSRF)',
    severity: 'MEDIUM',
    cvssScore: 6.5,
    category: 'CSRF',
    description: 'La aplicación no valida tokens CSRF en formularios críticos, permitiendo a un atacante engañar a usuarios autenticados para que realicen acciones no deseadas.',
    affectedComponent: 'application',
    assetTypes: ['WEB', 'APPLICATION'],
    remediation: 'Implementar tokens CSRF en todos los formularios y peticiones que modifican estado. Verificar el header Origin/Referer. Usar SameSite=Strict en cookies.',
    exploitAvailable: false,
    patchAvailable: false,
    references: ['https://owasp.org/www-community/attacks/csrf'],
    tags: ['OWASP-A01', 'CSRF'],
  },
  {
    id: 'WEB-004',
    cveId: null,
    cweId: 'CWE-285',
    title: 'Control de Acceso Roto (IDOR)',
    severity: 'HIGH',
    cvssScore: 8.1,
    category: 'Access Control',
    description: 'La aplicación no valida correctamente que el usuario tenga permisos para acceder a recursos mediante referencias directas a objetos (IDOR), permitiendo acceder a datos de otros usuarios.',
    affectedComponent: 'application',
    assetTypes: ['WEB', 'API', 'APPLICATION'],
    remediation: 'Implementar control de acceso basado en roles (RBAC). Validar permisos en el servidor para cada recurso. No exponer IDs internos directamente.',
    exploitAvailable: true,
    patchAvailable: false,
    references: ['https://owasp.org/Top10/A01_2021-Broken_Access_Control/'],
    tags: ['OWASP-A01', 'Access Control', 'IDOR'],
  },
  {
    id: 'WEB-005',
    cveId: null,
    cweId: 'CWE-287',
    title: 'Autenticación Débil o Rota',
    severity: 'HIGH',
    cvssScore: 7.5,
    category: 'Authentication',
    description: 'La aplicación tiene mecanismos de autenticación débiles: permite contraseñas simples, no implementa bloqueo por intentos fallidos, o tiene tokens de sesión predecibles.',
    affectedComponent: 'authentication',
    assetTypes: ['WEB', 'API', 'APPLICATION'],
    remediation: 'Implementar política de contraseñas fuertes, bloqueo por intentos fallidos, autenticación multifactor (MFA) y tokens de sesión seguros y aleatorios.',
    exploitAvailable: true,
    patchAvailable: false,
    references: ['https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/'],
    tags: ['OWASP-A07', 'Authentication'],
  },
  {
    id: 'WEB-006',
    cveId: null,
    cweId: 'CWE-312',
    title: 'Datos Sensibles Expuestos',
    severity: 'HIGH',
    cvssScore: 7.5,
    category: 'Cryptographic Failures',
    description: 'La aplicación expone datos sensibles (PII, contraseñas, tokens) en logs, respuestas de API, o mensajes de error sin cifrado o enmascaramiento adecuado.',
    affectedComponent: 'application',
    assetTypes: ['WEB', 'API', 'APPLICATION', 'DATABASE'],
    remediation: 'Cifrar datos sensibles en tránsito y reposo. No registrar datos sensibles en logs. Implementar manejo de errores que no exponga detalles internos.',
    exploitAvailable: false,
    patchAvailable: false,
    references: ['https://owasp.org/Top10/A02_2021-Cryptographic_Failures/'],
    tags: ['OWASP-A02', 'Data Exposure'],
  },
  // ── Infrastructure / Network ───────────────────────────────────────────────
  {
    id: 'NET-001',
    cveId: null,
    cweId: 'CWE-319',
    title: 'Transmisión de Datos sin Cifrar (HTTP)',
    severity: 'HIGH',
    cvssScore: 7.4,
    category: 'Network Security',
    description: 'Servicios o APIs transmiten datos sensibles sobre HTTP en lugar de HTTPS, permitiendo a atacantes en posición de man-in-the-middle interceptar credenciales y datos.',
    affectedComponent: 'network',
    assetTypes: ['SERVER', 'WEB', 'NETWORK'],
    remediation: 'Forzar HTTPS en todos los servicios. Implementar HSTS. Redirigir HTTP a HTTPS.',
    exploitAvailable: true,
    patchAvailable: false,
    references: ['https://owasp.org/Top10/A02_2021-Cryptographic_Failures/'],
    tags: ['OWASP-A02', 'Network'],
  },
  {
    id: 'NET-002',
    cveId: null,
    cweId: 'CWE-732',
    title: 'Configuración de Red Insegura',
    severity: 'MEDIUM',
    cvssScore: 5.3,
    category: 'Misconfiguration',
    description: 'El servidor expone servicios innecesarios, tiene reglas de firewall permisivas o permite acceso desde rangos de IP amplios a servicios de administración.',
    affectedComponent: 'network',
    assetTypes: ['SERVER', 'NETWORK'],
    remediation: 'Implementar principio de mínimo privilegio en reglas de firewall. Deshabilitar servicios no necesarios. Restringir acceso administrativo por IP.',
    exploitAvailable: false,
    patchAvailable: false,
    references: ['https://owasp.org/Top10/A05_2021-Security_Misconfiguration/'],
    tags: ['OWASP-A05', 'Network', 'Misconfiguration'],
  },
  // ── CVEs conocidos ────────────────────────────────────────────────────────
  {
    id: 'CVE-001',
    cveId: 'CVE-2024-3094',
    cweId: 'CWE-506',
    title: 'XZ Utils Backdoor (CVE-2024-3094)',
    severity: 'CRITICAL',
    cvssScore: 10.0,
    category: 'Supply Chain',
    description: 'Backdoor malicioso insertado en xz-utils versiones 5.6.0 y 5.6.1. Permite ejecución remota de código sin autenticación en sistemas con sshd afectado.',
    affectedComponent: 'xz-utils',
    assetTypes: ['SERVER'],
    remediation: 'Actualizar xz-utils a versión 5.6.2 o superior. Verificar si la versión instalada está comprometida.',
    exploitAvailable: true,
    patchAvailable: true,
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-3094'],
    tags: ['Supply Chain', 'RCE', 'Backdoor'],
  },
  {
    id: 'CVE-002',
    cveId: 'CVE-2023-44487',
    cweId: 'CWE-400',
    title: 'HTTP/2 Rapid Reset DDoS (CVE-2023-44487)',
    severity: 'HIGH',
    cvssScore: 7.5,
    category: 'DoS',
    description: 'Vulnerabilidad en la implementación HTTP/2 que permite ataques de denegación de servicio mediante el envío masivo de peticiones RST_STREAM.',
    affectedComponent: 'http2-servers',
    assetTypes: ['SERVER', 'WEB', 'NETWORK'],
    remediation: 'Actualizar servidor web (nginx, Apache, etc.) a la versión parcheada. Aplicar límites de peticiones en el gateway/proxy.',
    exploitAvailable: true,
    patchAvailable: true,
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-44487'],
    tags: ['DoS', 'DDoS', 'HTTP/2'],
  },
  // ── Cloud / Container ─────────────────────────────────────────────────────
  {
    id: 'CLOUD-001',
    cveId: null,
    cweId: 'CWE-732',
    title: 'Bucket de Almacenamiento con Acceso Público',
    severity: 'HIGH',
    cvssScore: 8.1,
    category: 'Cloud Misconfiguration',
    description: 'Bucket de almacenamiento en la nube (S3, GCS, Azure Blob) configurado con acceso público, exponiendo potencialmente archivos sensibles.',
    affectedComponent: 'cloud-storage',
    assetTypes: ['CLOUD'],
    remediation: 'Revisar y restringir permisos de buckets. Habilitar Block Public Access en S3. Implementar políticas de bucket más restrictivas.',
    exploitAvailable: true,
    patchAvailable: false,
    references: ['https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html'],
    tags: ['Cloud', 'Storage', 'Data Exposure'],
  },
  {
    id: 'CLOUD-002',
    cveId: null,
    cweId: 'CWE-250',
    title: 'Contenedor Docker ejecutándose como root',
    severity: 'MEDIUM',
    cvssScore: 6.3,
    category: 'Container Security',
    description: 'Contenedores Docker ejecutándose con privilegios de root, lo que amplía el radio de impacto en caso de compromiso del contenedor.',
    affectedComponent: 'docker',
    assetTypes: ['CLOUD', 'SERVER'],
    remediation: 'Configurar USER en Dockerfile para ejecutar con usuario no-root. Usar --user flag en docker run. Implementar políticas de seguridad de pod en Kubernetes.',
    exploitAvailable: false,
    patchAvailable: false,
    references: ['https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user'],
    tags: ['Docker', 'Container', 'Privilege Escalation'],
  },
  // ── Dependency / Software ─────────────────────────────────────────────────
  {
    id: 'DEP-001',
    cveId: null,
    cweId: 'CWE-1104',
    title: 'Dependencias con Vulnerabilidades Conocidas',
    severity: 'HIGH',
    cvssScore: 7.5,
    category: 'Vulnerable Components',
    description: 'La aplicación utiliza dependencias (npm, pip, etc.) con vulnerabilidades conocidas y sin parchear, que pueden ser explotadas por atacantes.',
    affectedComponent: 'dependencies',
    assetTypes: ['APPLICATION', 'WEB'],
    remediation: 'Ejecutar npm audit o equivalente regularmente. Actualizar dependencias vulnerables. Implementar Dependabot o Snyk para monitoreo continuo.',
    exploitAvailable: false,
    patchAvailable: true,
    references: ['https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/'],
    tags: ['OWASP-A06', 'Dependencies', 'Supply Chain'],
  },
  // ── Endpoint / Workstation ─────────────────────────────────────────────────
  {
    id: 'END-001',
    cveId: null,
    cweId: 'CWE-359',
    title: 'Política de Contraseñas Débil',
    severity: 'MEDIUM',
    cvssScore: 5.5,
    category: 'Access Control',
    description: 'La organización no tiene una política de contraseñas que exija longitud mínima, complejidad y rotación periódica, aumentando el riesgo de accesos no autorizados.',
    affectedComponent: 'identity',
    assetTypes: ['ENDPOINT', 'SERVER', 'APPLICATION'],
    remediation: 'Implementar política de contraseñas: mínimo 12 caracteres, mezcla de tipos, sin reutilización. Habilitar MFA para cuentas críticas.',
    exploitAvailable: false,
    patchAvailable: false,
    references: ['https://pages.nist.gov/800-63-3/sp800-63b.html'],
    tags: ['Authentication', 'Identity'],
  },
]

// ── Determine which vulnerabilities apply to each asset type ──────────────────
function getVulnerabilitiesForAsset(assetType: string, scanType: string): typeof VULNERABILITY_DATABASE {
  const type = (assetType || 'SERVER').toUpperCase()

  // Filter by asset type compatibility
  let applicable = VULNERABILITY_DATABASE.filter(v =>
    v.assetTypes.includes(type) || v.assetTypes.includes('APPLICATION')
  )

  // For QUICK scan: only CRITICAL + HIGH
  if (scanType === 'QUICK') {
    applicable = applicable.filter(v => v.severity === 'CRITICAL' || v.severity === 'HIGH')
  }

  return applicable
}

// POST - Ejecutar escaneo de vulnerabilidades
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { assets, scanType = 'QUICK' } = await request.json()

    // assets: Array de { id, name, type, components: [] }
    const discoveredVulnerabilities: any[] = []

    // Scan each asset
    for (const asset of assets || [{ id: 'default', name: 'Sistema', type: 'SERVER' }]) {
      const applicableVulns = getVulnerabilitiesForAsset(asset.type || 'SERVER', scanType)

      for (const vuln of applicableVulns) {
        // Avoid duplicates
        const existing = await prisma.vulnerability.findFirst({
          where: {
            userId: session.user.id,
            title: vuln.title,
            assetId: asset.id,
            status: { notIn: ['RESOLVED', 'FALSE_POSITIVE'] },
          },
        })

        if (!existing) {
          const created = await prisma.vulnerability.create({
            data: {
              userId: session.user.id,
              title: vuln.title,
              description: vuln.description,
              severity: vuln.severity,
              status: 'OPEN',
              source: 'SCAN',
              cveId: vuln.cveId || null,
              cweId: vuln.cweId || null,
              cvssScore: vuln.cvssScore,
              assetId: asset.id,
              assetName: asset.name,
              assetType: asset.type || 'SERVER',
              exploitAvailable: vuln.exploitAvailable,
              patchAvailable: vuln.patchAvailable,
              remediation: vuln.remediation,
              references: vuln.references || [],
              tags: vuln.tags || [],
              discoveredAt: new Date(),
            },
          })
          discoveredVulnerabilities.push(created)
        }
      }
    }

    const metrics = {
      scannedAssets: assets?.length || 1,
      vulnerabilitiesFound: discoveredVulnerabilities.length,
      critical: discoveredVulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      high: discoveredVulnerabilities.filter(v => v.severity === 'HIGH').length,
      medium: discoveredVulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      low: discoveredVulnerabilities.filter(v => v.severity === 'LOW').length,
      scanType,
      completedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      metrics,
      vulnerabilities: discoveredVulnerabilities,
    })
  } catch (error) {
    console.error('Error running vulnerability scan:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

