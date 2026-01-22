import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scanDependencies, parsePackageJson, parseRequirementsTxt, parseGoMod } from '@/lib/scanners/dependency-scanner'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { content, type, projectName } = await request.json()

    if (!content || !type) {
      return NextResponse.json(
        { error: 'Se requiere content y type (npm, pypi, go)' },
        { status: 400 }
      )
    }

    // Parsear dependencias según el tipo
    let dependencies: Record<string, string>
    let ecosystem: 'npm' | 'PyPI' | 'Go'

    switch (type.toLowerCase()) {
      case 'npm':
      case 'package.json':
        dependencies = parsePackageJson(content)
        ecosystem = 'npm'
        break
      case 'pypi':
      case 'python':
      case 'requirements.txt':
        dependencies = parseRequirementsTxt(content)
        ecosystem = 'PyPI'
        break
      case 'go':
      case 'go.mod':
        dependencies = parseGoMod(content)
        ecosystem = 'Go'
        break
      default:
        return NextResponse.json(
          { error: 'Tipo no soportado. Usar: npm, pypi, go' },
          { status: 400 }
        )
    }

    const depsCount = Object.keys(dependencies).length
    if (depsCount === 0) {
      return NextResponse.json(
        { error: 'No se encontraron dependencias en el archivo' },
        { status: 400 }
      )
    }

    // Escanear con OSV API
    const vulnerabilities = await scanDependencies(dependencies, ecosystem)

    // Guardar vulnerabilidades en BD
    const savedVulnerabilities = []
    for (const vuln of vulnerabilities) {
      // Evitar duplicados
      const existing = await prisma.vulnerability.findFirst({
        where: {
          userId: session.user.id,
          cveId: vuln.cveId || vuln.id,
          assetName: vuln.packageName,
          status: { not: 'RESOLVED' }
        }
      })

      if (!existing) {
        const saved = await prisma.vulnerability.create({
          data: {
            userId: session.user.id,
            title: vuln.title,
            description: vuln.description,
            severity: vuln.severity,
            status: 'OPEN',
            source: 'DEPENDENCY_SCAN',
            cveId: vuln.cveId,
            cvssScore: vuln.cvssScore,
            assetId: `dep-${vuln.packageName}`,
            assetName: `${vuln.packageName}@${vuln.installedVersion}`,
            assetType: 'DEPENDENCY',
            remediation: vuln.fixedVersion 
              ? `Actualizar a versión ${vuln.fixedVersion}` 
              : 'Revisar alternativas o aplicar mitigaciones',
            references: vuln.references,
            discoveredAt: new Date(),
          }
        })
        savedVulnerabilities.push(saved)
      }
    }

    // Estadísticas
    const stats = {
      dependenciesScanned: depsCount,
      vulnerabilitiesFound: vulnerabilities.length,
      newVulnerabilities: savedVulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      low: vulnerabilities.filter(v => v.severity === 'LOW').length,
      ecosystem,
      projectName: projectName || 'Unknown'
    }

    return NextResponse.json({
      success: true,
      stats,
      vulnerabilities: vulnerabilities.map(v => ({
        ...v,
        source: 'OSV (Google)'
      }))
    })
  } catch (error) {
    console.error('Error in dependency scan:', error)
    return NextResponse.json(
      { error: 'Error escaneando dependencias' },
      { status: 500 }
    )
  }
}
