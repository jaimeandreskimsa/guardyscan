import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar vulnerabilidades
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const assetId = searchParams.get('assetId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { userId: session.user.id }
    if (status) where.status = status
    if (severity) where.severity = severity
    if (assetId) where.assetId = assetId

    const [vulnerabilities, total] = await Promise.all([
      prisma.vulnerability.findMany({
        where,
        orderBy: [
          { severity: 'desc' },
          { discoveredAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vulnerability.count({ where })
    ])

    // Estadísticas
    const stats = await prisma.vulnerability.groupBy({
      by: ['severity', 'status'],
      where: { userId: session.user.id },
      _count: true
    })

    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
    const statusCounts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, ACCEPTED: 0, FALSE_POSITIVE: 0 }

    stats.forEach(s => {
      if (s.severity in severityCounts) {
        severityCounts[s.severity as keyof typeof severityCounts] += s._count
      }
      if (s.status in statusCounts) {
        statusCounts[s.status as keyof typeof statusCounts] += s._count
      }
    })

    return NextResponse.json({
      vulnerabilities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        bySeverity: severityCounts,
        byStatus: statusCounts,
        total
      }
    })
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear vulnerabilidad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Calcular CVSS score si no se proporciona
    let cvssScore = data.cvssScore

    if (!cvssScore && data.severity) {
      const severityScores = {
        CRITICAL: 9.5,
        HIGH: 7.5,
        MEDIUM: 5.5,
        LOW: 3.0,
        INFO: 0.0
      }
      cvssScore = severityScores[data.severity as keyof typeof severityScores] || 5.0
    }

    const vulnerability = await prisma.vulnerability.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        severity: data.severity || 'MEDIUM',
        status: 'OPEN',
        source: data.source || 'MANUAL',
        scanId: data.scanId,
        cveId: data.cveId,
        cweId: data.cweId,
        cvssScore,
        cvssVector: data.cvssVector,
        assetId: data.assetId,
        assetName: data.assetName,
        assetType: data.assetType,
        exploitAvailable: data.exploitAvailable || false,
        patchAvailable: data.patchAvailable || false,
        remediation: data.remediation,
        references: data.references || [],
        discoveredAt: new Date(),
      }
    })

    return NextResponse.json(vulnerability, { status: 201 })
  } catch (error) {
    console.error('Error creating vulnerability:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
