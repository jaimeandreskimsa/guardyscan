/**
 * Dependency Scanner - Usa OSV (Google Open Source Vulnerabilities) API
 * https://osv.dev/
 * 100% Gratis, sin límites
 */

interface OSVVulnerability {
  id: string
  summary: string
  details: string
  severity?: Array<{
    type: string
    score: string
  }>
  affected: Array<{
    package: {
      ecosystem: string
      name: string
    }
    ranges?: Array<{
      type: string
      events: Array<{ introduced?: string; fixed?: string }>
    }>
    versions?: string[]
  }>
  references?: Array<{
    type: string
    url: string
  }>
  aliases?: string[]
}

interface DependencyVulnerability {
  id: string
  cveId?: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  cvssScore?: number
  packageName: string
  installedVersion: string
  fixedVersion?: string
  ecosystem: string
  references: string[]
}

// Mapear severidad CVSS a nuestro sistema
function mapSeverity(cvssScore?: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' {
  if (!cvssScore) return 'MEDIUM'
  if (cvssScore >= 9.0) return 'CRITICAL'
  if (cvssScore >= 7.0) return 'HIGH'
  if (cvssScore >= 4.0) return 'MEDIUM'
  if (cvssScore >= 0.1) return 'LOW'
  return 'INFO'
}

// Extraer CVE ID de aliases
function extractCveId(vuln: OSVVulnerability): string | undefined {
  if (vuln.id.startsWith('CVE-')) return vuln.id
  return vuln.aliases?.find(a => a.startsWith('CVE-'))
}

// Extraer CVSS score
function extractCvssScore(vuln: OSVVulnerability): number | undefined {
  const severity = vuln.severity?.find(s => s.type === 'CVSS_V3')
  if (severity?.score) {
    // El score puede venir como "CVSS:3.1/AV:N/AC:L/..." con score al final
    const match = severity.score.match(/(\d+\.?\d*)\/?$/)
    if (match) return parseFloat(match[1])
  }
  return undefined
}

// Extraer versión fija
function extractFixedVersion(affected: OSVVulnerability['affected'][0]): string | undefined {
  for (const range of affected.ranges || []) {
    for (const event of range.events) {
      if (event.fixed) return event.fixed
    }
  }
  return undefined
}

/**
 * Escanear dependencias usando OSV API
 */
export async function scanDependencies(
  dependencies: Record<string, string>,
  ecosystem: 'npm' | 'PyPI' | 'Go' | 'Maven' | 'Cargo' | 'NuGet' = 'npm'
): Promise<DependencyVulnerability[]> {
  const vulnerabilities: DependencyVulnerability[] = []

  // OSV permite batch queries
  const queries = Object.entries(dependencies).map(([name, version]) => ({
    package: {
      ecosystem: ecosystem,
      name: name
    },
    version: version.replace(/[\^~>=<]/g, '') // Limpiar prefijos de versión
  }))

  try {
    // OSV batch query endpoint
    const response = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries })
    })

    if (!response.ok) {
      throw new Error(`OSV API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Procesar resultados
    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i]
      const [packageName, version] = Object.entries(dependencies)[i]
      
      if (result.vulns) {
        for (const vuln of result.vulns as OSVVulnerability[]) {
          const cvssScore = extractCvssScore(vuln)
          const cveId = extractCveId(vuln)
          const affected = vuln.affected?.[0]
          
          vulnerabilities.push({
            id: vuln.id,
            cveId,
            title: vuln.summary || `Vulnerabilidad en ${packageName}`,
            description: vuln.details || vuln.summary || 'Sin descripción disponible',
            severity: mapSeverity(cvssScore),
            cvssScore,
            packageName,
            installedVersion: version.replace(/[\^~>=<]/g, ''),
            fixedVersion: affected ? extractFixedVersion(affected) : undefined,
            ecosystem,
            references: vuln.references?.map(r => r.url) || []
          })
        }
      }
    }
  } catch (error) {
    console.error('Error scanning dependencies with OSV:', error)
    throw error
  }

  return vulnerabilities
}

/**
 * Parsear package.json y extraer dependencias
 */
export function parsePackageJson(content: string): Record<string, string> {
  try {
    const pkg = JSON.parse(content)
    return {
      ...pkg.dependencies,
      ...pkg.devDependencies
    }
  } catch {
    throw new Error('Invalid package.json format')
  }
}

/**
 * Parsear requirements.txt (Python)
 */
export function parseRequirementsTxt(content: string): Record<string, string> {
  const deps: Record<string, string> = {}
  const lines = content.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
    
    // Formato: package==version o package>=version
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)[=<>~!]+(.+)$/)
    if (match) {
      deps[match[1]] = match[2]
    } else if (trimmed.match(/^[a-zA-Z0-9_-]+$/)) {
      deps[trimmed] = 'latest'
    }
  }
  
  return deps
}

/**
 * Parsear go.mod
 */
export function parseGoMod(content: string): Record<string, string> {
  const deps: Record<string, string> = {}
  const lines = content.split('\n')
  let inRequire = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed === 'require (') {
      inRequire = true
      continue
    }
    if (trimmed === ')') {
      inRequire = false
      continue
    }
    
    if (inRequire || trimmed.startsWith('require ')) {
      const match = trimmed.match(/^(?:require\s+)?([^\s]+)\s+v?([^\s]+)/)
      if (match) {
        deps[match[1]] = match[2]
      }
    }
  }
  
  return deps
}
