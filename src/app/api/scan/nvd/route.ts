import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  searchCVE, 
  searchByKeyword, 
  searchByProduct, 
  searchRecent,
  generateCVEStats 
} from '@/lib/scanners/nvd-scanner'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { type, cveId, keyword, vendor, product, version, days, severity } = await request.json()

    let results: any[] = []
    let totalResults = 0

    switch (type) {
      case 'cve':
        // Buscar CVE específico
        if (!cveId) {
          return NextResponse.json({ error: 'Se requiere cveId' }, { status: 400 })
        }
        const cve = await searchCVE(cveId)
        if (cve) {
          results = [cve]
          totalResults = 1
        }
        break

      case 'keyword':
        // Buscar por palabra clave
        if (!keyword) {
          return NextResponse.json({ error: 'Se requiere keyword' }, { status: 400 })
        }
        const keywordResults = await searchByKeyword(keyword)
        results = keywordResults.results
        totalResults = keywordResults.totalResults
        break

      case 'product':
        // Buscar por producto/software
        if (!vendor || !product) {
          return NextResponse.json({ error: 'Se requiere vendor y product' }, { status: 400 })
        }
        results = await searchByProduct(vendor, product, version)
        totalResults = results.length
        break

      case 'recent':
        // Vulnerabilidades recientes
        results = await searchRecent(days || 7, severity)
        totalResults = results.length
        break

      default:
        return NextResponse.json(
          { error: 'Tipo no válido. Usar: cve, keyword, product, recent' },
          { status: 400 }
        )
    }

    // Generar estadísticas
    const stats = generateCVEStats(results)

    // Opcionalmente guardar CVEs seleccionados como vulnerabilidades a trackear
    // (no guardamos automáticamente para no llenar la BD con CVEs públicos)

    return NextResponse.json({
      success: true,
      type,
      totalResults,
      results: results.slice(0, 50), // Limitar respuesta
      stats,
      source: 'NVD (National Vulnerability Database)',
      note: 'Para agregar a tracking, use POST /api/vulnerabilities'
    })
  } catch (error: any) {
    console.error('Error in NVD search:', error)
    return NextResponse.json(
      { error: error.message || 'Error consultando NVD' },
      { status: 500 }
    )
  }
}

// GET para buscar rápido por CVE ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cveId = searchParams.get('cve')

    if (!cveId) {
      return NextResponse.json(
        { error: 'Se requiere parámetro cve' },
        { status: 400 }
      )
    }

    const result = await searchCVE(cveId)
    
    if (!result) {
      return NextResponse.json(
        { error: 'CVE no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching CVE:', error)
    return NextResponse.json(
      { error: error.message || 'Error consultando NVD' },
      { status: 500 }
    )
  }
}
