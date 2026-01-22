import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scanCode, scanFiles, generateScanSummary } from '@/lib/scanners/code-scanner'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Puede recibir un solo archivo o múltiples
    let vulnerabilities
    
    if (body.files && Array.isArray(body.files)) {
      // Múltiples archivos: [{ name: 'file.js', content: '...' }]
      vulnerabilities = scanFiles(body.files)
    } else if (body.code && body.filename) {
      // Un solo archivo
      vulnerabilities = scanCode(body.code, body.filename)
    } else {
      return NextResponse.json(
        { error: 'Se requiere {code, filename} o {files: [{name, content}]}' },
        { status: 400 }
      )
    }

    // Generar resumen
    const summary = generateScanSummary(vulnerabilities)

    // Guardar vulnerabilidades críticas y altas en BD
    const savedVulnerabilities = []
    const criticalAndHigh = vulnerabilities.filter(
      v => v.severity === 'CRITICAL' || v.severity === 'HIGH'
    )

    for (const vuln of criticalAndHigh) {
      const saved = await prisma.vulnerability.create({
        data: {
          userId: session.user.id,
          title: `${vuln.title} en ${vuln.file}`,
          description: `${vuln.description}\n\nCódigo: ${vuln.code || 'N/A'}\nLínea: ${vuln.line}`,
          severity: vuln.severity,
          status: 'OPEN',
          source: 'CODE_SCAN',
          cweId: vuln.cweId,
          assetId: `code-${vuln.file}`,
          assetName: vuln.file || 'código',
          assetType: 'APPLICATION',
          remediation: vuln.recommendation,
          discoveredAt: new Date(),
        }
      })
      savedVulnerabilities.push(saved)
    }

    return NextResponse.json({
      success: true,
      summary,
      vulnerabilities: vulnerabilities.map(v => ({
        ...v,
        owaspTop10: v.owaspCategory
      })),
      savedToDatabase: savedVulnerabilities.length,
      scanType: 'SAST (Static Application Security Testing)'
    })
  } catch (error) {
    console.error('Error in code scan:', error)
    return NextResponse.json(
      { error: 'Error analizando código' },
      { status: 500 }
    )
  }
}
