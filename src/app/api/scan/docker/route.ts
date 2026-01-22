import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  analyzeDockerfile, 
  scanDockerImage, 
  fullDockerScan 
} from '@/lib/scanners/docker-scanner'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { type, imageName, dockerfile } = await request.json()

    switch (type) {
      case 'dockerfile':
        // Solo analizar Dockerfile
        if (!dockerfile) {
          return NextResponse.json({ error: 'Se requiere dockerfile' }, { status: 400 })
        }
        
        const dockerfileIssues = analyzeDockerfile(dockerfile)
        
        // Guardar issues críticos y altos
        const savedDockerfile = []
        for (const issue of dockerfileIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')) {
          const saved = await prisma.vulnerability.create({
            data: {
              userId: session.user.id,
              title: `Dockerfile: ${issue.title}`,
              description: `${issue.description}\n\nLínea ${issue.line}`,
              severity: issue.severity,
              status: 'OPEN',
              source: 'DOCKER_SCAN',
              assetId: 'dockerfile',
              assetName: 'Dockerfile',
              assetType: 'CONFIGURATION',
              remediation: issue.recommendation,
              discoveredAt: new Date(),
            }
          })
          savedDockerfile.push(saved)
        }

        return NextResponse.json({
          success: true,
          type: 'dockerfile',
          issues: dockerfileIssues,
          summary: {
            critical: dockerfileIssues.filter(i => i.severity === 'CRITICAL').length,
            high: dockerfileIssues.filter(i => i.severity === 'HIGH').length,
            medium: dockerfileIssues.filter(i => i.severity === 'MEDIUM').length,
            low: dockerfileIssues.filter(i => i.severity === 'LOW').length,
            total: dockerfileIssues.length
          },
          savedToDatabase: savedDockerfile.length
        })

      case 'image':
        // Escanear imagen Docker
        if (!imageName) {
          return NextResponse.json({ error: 'Se requiere imageName' }, { status: 400 })
        }

        const imageScan = await scanDockerImage(imageName)
        
        // Guardar vulnerabilidades
        const savedImage = []
        for (const vuln of imageScan.vulnerabilities) {
          const existing = await prisma.vulnerability.findFirst({
            where: {
              userId: session.user.id,
              cveId: vuln.cveId || vuln.id,
              assetName: imageName,
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
                source: 'DOCKER_SCAN',
                cveId: vuln.cveId,
                assetId: `docker-${imageName}`,
                assetName: imageName,
                assetType: 'CONTAINER',
                remediation: vuln.fixedVersion 
                  ? `Actualizar ${vuln.packageName} a versión ${vuln.fixedVersion}`
                  : 'Actualizar la imagen base a una versión más reciente',
                discoveredAt: new Date(),
              }
            })
            savedImage.push(saved)
          }
        }

        return NextResponse.json({
          success: true,
          type: 'image',
          image: imageScan.image,
          tag: imageScan.tag,
          scanTime: imageScan.scanTime,
          vulnerabilities: imageScan.vulnerabilities,
          summary: imageScan.summary,
          recommendations: imageScan.recommendations,
          savedToDatabase: savedImage.length
        })

      case 'full':
        // Escaneo completo (imagen + Dockerfile)
        if (!imageName) {
          return NextResponse.json({ error: 'Se requiere imageName' }, { status: 400 })
        }

        const fullResult = await fullDockerScan(imageName, dockerfile)
        
        return NextResponse.json({
          success: true,
          type: 'full',
          imageScan: fullResult.imageScan,
          dockerfileIssues: fullResult.dockerfileIssues,
          totalIssues: fullResult.imageScan.summary.total + (fullResult.dockerfileIssues?.length || 0)
        })

      default:
        return NextResponse.json(
          { error: 'Tipo no válido. Usar: dockerfile, image, full' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Error in Docker scan:', error)
    return NextResponse.json(
      { error: error.message || 'Error en escaneo Docker' },
      { status: 500 }
    )
  }
}
