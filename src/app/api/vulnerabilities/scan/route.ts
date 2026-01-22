import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Escáner de vulnerabilidades simulado (integrable con herramientas reales)
const VULNERABILITY_DATABASE = [
  {
    cveId: 'CVE-2024-3094',
    title: 'XZ Utils Backdoor',
    severity: 'CRITICAL',
    cvssScore: 10.0,
    description: 'Backdoor malicioso en xz-utils versiones 5.6.0 y 5.6.1',
    affectedComponent: 'xz-utils',
    affectedVersion: '5.6.0-5.6.1',
    fixedVersion: '5.6.2+',
    remediation: 'Actualizar a versión 5.6.2 o superior inmediatamente',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2024-21887',
    title: 'Ivanti Connect Secure Command Injection',
    severity: 'CRITICAL',
    cvssScore: 9.1,
    description: 'Vulnerabilidad de inyección de comandos en Ivanti Connect Secure',
    affectedComponent: 'ivanti-connect-secure',
    affectedVersion: '< 22.7R2.3',
    fixedVersion: '22.7R2.3+',
    remediation: 'Aplicar parche oficial de Ivanti',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2024-0204',
    title: 'GoAnywhere MFT Auth Bypass',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    description: 'Bypass de autenticación en GoAnywhere MFT',
    affectedComponent: 'goanywhere-mft',
    affectedVersion: '< 7.4.1',
    fixedVersion: '7.4.1+',
    remediation: 'Actualizar GoAnywhere MFT a versión 7.4.1',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2024-27198',
    title: 'JetBrains TeamCity Auth Bypass',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    description: 'Authentication bypass en JetBrains TeamCity',
    affectedComponent: 'teamcity',
    affectedVersion: '< 2023.11.4',
    fixedVersion: '2023.11.4+',
    remediation: 'Actualizar TeamCity inmediatamente',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2023-44487',
    title: 'HTTP/2 Rapid Reset DDoS',
    severity: 'HIGH',
    cvssScore: 7.5,
    description: 'Ataque de denegación de servicio mediante HTTP/2 rapid reset',
    affectedComponent: 'http2-servers',
    affectedVersion: 'multiple',
    fixedVersion: 'varies',
    remediation: 'Aplicar parches específicos del servidor web/proxy',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2024-1086',
    title: 'Linux Kernel Use-After-Free',
    severity: 'HIGH',
    cvssScore: 7.8,
    description: 'Use-after-free en nf_tables del kernel Linux',
    affectedComponent: 'linux-kernel',
    affectedVersion: '< 6.7.2',
    fixedVersion: '6.7.2+',
    remediation: 'Actualizar kernel Linux',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2024-23222',
    title: 'Apple WebKit Type Confusion',
    severity: 'HIGH',
    cvssScore: 8.8,
    description: 'Type confusion en WebKit permite ejecución de código',
    affectedComponent: 'webkit',
    affectedVersion: 'iOS < 17.3, macOS < 14.3',
    fixedVersion: 'iOS 17.3+, macOS 14.3+',
    remediation: 'Actualizar dispositivos Apple',
    exploitAvailable: true,
    patchAvailable: true,
  },
  {
    cveId: 'CVE-2024-21413',
    title: 'Microsoft Outlook RCE',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    description: 'Ejecución remota de código en Microsoft Outlook',
    affectedComponent: 'microsoft-outlook',
    affectedVersion: 'Office 2016-2021',
    fixedVersion: 'February 2024 patch',
    remediation: 'Aplicar parches de seguridad de febrero 2024',
    exploitAvailable: false,
    patchAvailable: true,
  }
]

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

    // Simular escaneo de cada activo
    for (const asset of assets || [{ id: 'default', name: 'Sistema', type: 'SERVER' }]) {
      // Buscar vulnerabilidades conocidas
      const vulnsToCreate = VULNERABILITY_DATABASE
        .filter(() => Math.random() > 0.4) // Simular detección aleatoria
        .map(vuln => ({
          userId: session.user.id,
          title: vuln.title,
          description: vuln.description,
          severity: vuln.severity,
          status: 'OPEN',
          source: 'SCAN',
          cveId: vuln.cveId,
          cvssScore: vuln.cvssScore,
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          exploitAvailable: vuln.exploitAvailable,
          patchAvailable: vuln.patchAvailable,
          remediation: vuln.remediation,
          references: [`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`],
          discoveredAt: new Date(),
        }))

      // Verificar duplicados antes de crear
      for (const vuln of vulnsToCreate) {
        const existing = await prisma.vulnerability.findFirst({
          where: {
            userId: session.user.id,
            cveId: vuln.cveId,
            assetId: vuln.assetId,
            status: { not: 'RESOLVED' }
          }
        })

        if (!existing) {
          const created = await prisma.vulnerability.create({ data: vuln })
          discoveredVulnerabilities.push(created)
        }
      }
    }

    // Calcular métricas del escaneo
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
