import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scanHost, quickScan } from '@/lib/scanners/port-scanner'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { host, scanType = 'quick', ports } = await request.json()

    if (!host) {
      return NextResponse.json(
        { error: 'Se requiere host (IP o dominio)' },
        { status: 400 }
      )
    }

    // Validar que no sea localhost para evitar auto-escaneo accidental
    const normalizedHost = host.toLowerCase().trim()
    if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1') {
      return NextResponse.json(
        { error: 'No se permite escanear localhost por seguridad' },
        { status: 400 }
      )
    }

    // Ejecutar escaneo
    let result
    if (scanType === 'quick') {
      result = await quickScan(normalizedHost)
    } else {
      result = await scanHost(normalizedHost, {
        ports: ports || (scanType === 'full' ? 'full' : 'common'),
        timeout: 3000,
        concurrency: 30
      })
    }

    // Guardar vulnerabilidades de puertos en BD
    const savedVulnerabilities = []
    for (const vuln of result.vulnerabilities) {
      const existing = await prisma.vulnerability.findFirst({
        where: {
          userId: session.user.id,
          assetName: normalizedHost,
          title: { contains: `Puerto ${vuln.port}` },
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
            source: 'PORT_SCAN',
            assetId: `host-${normalizedHost}`,
            assetName: normalizedHost,
            assetType: 'SERVER',
            remediation: vuln.recommendation,
            discoveredAt: new Date(),
          }
        })
        savedVulnerabilities.push(saved)
      }
    }

    return NextResponse.json({
      success: true,
      host: result.host,
      ip: result.ip,
      scanTime: result.scanTime,
      openPorts: result.ports.map(p => ({
        port: p.port,
        service: p.service,
        status: p.status,
        banner: p.banner
      })),
      vulnerabilities: result.vulnerabilities,
      stats: {
        totalPortsScanned: scanType === 'quick' ? 24 : (scanType === 'full' ? 1024 : 35),
        openPorts: result.openPorts,
        vulnerabilitiesFound: result.vulnerabilities.length,
        newVulnerabilities: savedVulnerabilities.length
      }
    })
  } catch (error: any) {
    console.error('Error in port scan:', error)
    return NextResponse.json(
      { error: error.message || 'Error escaneando puertos' },
      { status: 500 }
    )
  }
}
