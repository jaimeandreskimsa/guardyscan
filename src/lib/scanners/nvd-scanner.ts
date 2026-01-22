/**
 * NVD Scanner - Consulta la National Vulnerability Database (NIST)
 * https://nvd.nist.gov/developers/vulnerabilities
 * API pública y gratuita
 */

interface NVDVulnerability {
  cve: {
    id: string
    sourceIdentifier: string
    published: string
    lastModified: string
    vulnStatus: string
    descriptions: Array<{
      lang: string
      value: string
    }>
    metrics?: {
      cvssMetricV31?: Array<{
        cvssData: {
          version: string
          vectorString: string
          baseScore: number
          baseSeverity: string
        }
        exploitabilityScore: number
        impactScore: number
      }>
      cvssMetricV2?: Array<{
        cvssData: {
          version: string
          vectorString: string
          baseScore: number
        }
        baseSeverity: string
      }>
    }
    weaknesses?: Array<{
      source: string
      type: string
      description: Array<{
        lang: string
        value: string
      }>
    }>
    references?: Array<{
      url: string
      source: string
      tags?: string[]
    }>
    configurations?: Array<{
      nodes: Array<{
        operator: string
        cpeMatch: Array<{
          vulnerable: boolean
          criteria: string
          versionEndExcluding?: string
          versionStartIncluding?: string
        }>
      }>
    }>
  }
}

interface CVESearchResult {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  cvssScore?: number
  cvssVector?: string
  cweId?: string
  publishedDate: string
  lastModified: string
  references: string[]
  affectedProducts: string[]
  exploitabilityScore?: number
  impactScore?: number
}

// API base URL
const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'

// Rate limiting: NVD permite 5 requests por 30 segundos sin API key
let lastRequestTime = 0
const REQUEST_DELAY = 6000 // 6 segundos entre requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  return fetch(url)
}

/**
 * Mapear severidad CVSS a nuestro sistema
 */
function mapSeverity(baseSeverity?: string, cvssScore?: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' {
  if (baseSeverity) {
    const upper = baseSeverity.toUpperCase()
    if (upper === 'CRITICAL') return 'CRITICAL'
    if (upper === 'HIGH') return 'HIGH'
    if (upper === 'MEDIUM') return 'MEDIUM'
    if (upper === 'LOW') return 'LOW'
  }
  
  if (cvssScore !== undefined) {
    if (cvssScore >= 9.0) return 'CRITICAL'
    if (cvssScore >= 7.0) return 'HIGH'
    if (cvssScore >= 4.0) return 'MEDIUM'
    if (cvssScore >= 0.1) return 'LOW'
  }
  
  return 'INFO'
}

/**
 * Parsear respuesta NVD
 */
function parseNVDResponse(vuln: NVDVulnerability): CVESearchResult {
  const cve = vuln.cve
  
  // Obtener descripción en español o inglés
  const description = cve.descriptions.find(d => d.lang === 'es')?.value 
    || cve.descriptions.find(d => d.lang === 'en')?.value 
    || 'Sin descripción'

  // Obtener métricas CVSS (preferir v3.1)
  const cvssV3 = cve.metrics?.cvssMetricV31?.[0]
  const cvssV2 = cve.metrics?.cvssMetricV2?.[0]
  
  const cvssScore = cvssV3?.cvssData.baseScore ?? cvssV2?.cvssData.baseScore
  const cvssVector = cvssV3?.cvssData.vectorString ?? cvssV2?.cvssData.vectorString
  const baseSeverity = cvssV3?.cvssData.baseSeverity ?? cvssV2?.baseSeverity

  // Obtener CWE
  const cweId = cve.weaknesses?.[0]?.description?.[0]?.value

  // Obtener productos afectados
  const affectedProducts: string[] = []
  for (const config of cve.configurations || []) {
    for (const node of config.nodes) {
      for (const match of node.cpeMatch) {
        if (match.vulnerable) {
          // Extraer nombre del producto del CPE
          const parts = match.criteria.split(':')
          if (parts.length >= 5) {
            const vendor = parts[3]
            const product = parts[4]
            affectedProducts.push(`${vendor}/${product}`)
          }
        }
      }
    }
  }

  return {
    id: cve.id,
    title: `${cve.id}: ${description.substring(0, 100)}...`,
    description,
    severity: mapSeverity(baseSeverity, cvssScore),
    cvssScore,
    cvssVector,
    cweId,
    publishedDate: cve.published,
    lastModified: cve.lastModified,
    references: cve.references?.map(r => r.url) || [],
    affectedProducts: [...new Set(affectedProducts)],
    exploitabilityScore: cvssV3?.exploitabilityScore,
    impactScore: cvssV3?.impactScore
  }
}

/**
 * Buscar CVE por ID específico
 */
export async function searchCVE(cveId: string): Promise<CVESearchResult | null> {
  try {
    const response = await rateLimitedFetch(`${NVD_API_BASE}?cveId=${cveId}`)
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
      return parseNVDResponse(data.vulnerabilities[0])
    }
    
    return null
  } catch (error) {
    console.error('Error searching CVE:', error)
    throw error
  }
}

/**
 * Buscar vulnerabilidades por palabra clave
 */
export async function searchByKeyword(
  keyword: string,
  options: {
    resultsPerPage?: number
    startIndex?: number
  } = {}
): Promise<{ results: CVESearchResult[]; totalResults: number }> {
  const { resultsPerPage = 20, startIndex = 0 } = options
  
  try {
    const params = new URLSearchParams({
      keywordSearch: keyword,
      resultsPerPage: resultsPerPage.toString(),
      startIndex: startIndex.toString()
    })
    
    const response = await rateLimitedFetch(`${NVD_API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      results: (data.vulnerabilities || []).map(parseNVDResponse),
      totalResults: data.totalResults || 0
    }
  } catch (error) {
    console.error('Error searching NVD:', error)
    throw error
  }
}

/**
 * Buscar vulnerabilidades por producto (CPE)
 */
export async function searchByProduct(
  vendor: string,
  product: string,
  version?: string
): Promise<CVESearchResult[]> {
  try {
    // Construir CPE string
    let cpeName = `cpe:2.3:*:${vendor}:${product}`
    if (version) {
      cpeName += `:${version}`
    }
    cpeName += ':*:*:*:*:*:*:*'
    
    const params = new URLSearchParams({
      cpeName,
      resultsPerPage: '50'
    })
    
    const response = await rateLimitedFetch(`${NVD_API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return (data.vulnerabilities || []).map(parseNVDResponse)
  } catch (error) {
    console.error('Error searching by product:', error)
    throw error
  }
}

/**
 * Buscar vulnerabilidades recientes (últimos N días)
 */
export async function searchRecent(
  days: number = 7,
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): Promise<CVESearchResult[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const params = new URLSearchParams({
      pubStartDate: startDate.toISOString(),
      pubEndDate: endDate.toISOString(),
      resultsPerPage: '100'
    })
    
    if (severity) {
      params.set('cvssV3Severity', severity)
    }
    
    const response = await rateLimitedFetch(`${NVD_API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return (data.vulnerabilities || []).map(parseNVDResponse)
  } catch (error) {
    console.error('Error searching recent CVEs:', error)
    throw error
  }
}

/**
 * Buscar vulnerabilidades por CWE
 */
export async function searchByCWE(cweId: string): Promise<CVESearchResult[]> {
  try {
    const params = new URLSearchParams({
      cweId,
      resultsPerPage: '50'
    })
    
    const response = await rateLimitedFetch(`${NVD_API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return (data.vulnerabilities || []).map(parseNVDResponse)
  } catch (error) {
    console.error('Error searching by CWE:', error)
    throw error
  }
}

/**
 * Estadísticas de un conjunto de CVEs
 */
export function generateCVEStats(cves: CVESearchResult[]) {
  return {
    total: cves.length,
    bySeverity: {
      CRITICAL: cves.filter(c => c.severity === 'CRITICAL').length,
      HIGH: cves.filter(c => c.severity === 'HIGH').length,
      MEDIUM: cves.filter(c => c.severity === 'MEDIUM').length,
      LOW: cves.filter(c => c.severity === 'LOW').length,
      INFO: cves.filter(c => c.severity === 'INFO').length,
    },
    avgCvssScore: cves.filter(c => c.cvssScore).reduce((sum, c) => sum + (c.cvssScore || 0), 0) / 
                  cves.filter(c => c.cvssScore).length || 0,
    mostAffectedProducts: Object.entries(
      cves.flatMap(c => c.affectedProducts).reduce((acc, p) => {
        acc[p] = (acc[p] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }
}
