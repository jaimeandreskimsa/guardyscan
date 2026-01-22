/**
 * Docker Scanner - Escaneo de imágenes Docker
 * Usa Trivy API o análisis local de Dockerfile
 */

interface DockerVulnerability {
  id: string
  cveId?: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  packageName: string
  installedVersion: string
  fixedVersion?: string
  layer?: string
  target?: string
}

interface DockerScanResult {
  image: string
  tag: string
  scanTime: number
  vulnerabilities: DockerVulnerability[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
    total: number
  }
  recommendations: string[]
}

interface DockerfileIssue {
  line: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  title: string
  description: string
  recommendation: string
}

// Patrones de seguridad para Dockerfile
const DOCKERFILE_PATTERNS = [
  {
    pattern: /^FROM\s+.*:latest/i,
    severity: 'MEDIUM' as const,
    title: 'Uso de tag :latest',
    description: 'Usar :latest puede causar builds no reproducibles y problemas de seguridad',
    recommendation: 'Especificar una versión concreta, ej: node:18.19.0-alpine'
  },
  {
    pattern: /^USER\s+root/i,
    severity: 'HIGH' as const,
    title: 'Container ejecuta como root',
    description: 'Ejecutar como root aumenta el riesgo de escalación de privilegios',
    recommendation: 'Crear y usar un usuario no privilegiado: USER node'
  },
  {
    pattern: /^RUN\s+.*curl\s+.*\|\s*(bash|sh)/i,
    severity: 'CRITICAL' as const,
    title: 'Curl a shell (instalación insegura)',
    description: 'Descargar y ejecutar scripts directamente es muy peligroso',
    recommendation: 'Descargar el script, verificar integridad, luego ejecutar'
  },
  {
    pattern: /^RUN\s+chmod\s+777/i,
    severity: 'HIGH' as const,
    title: 'Permisos 777 inseguros',
    description: 'Dar permisos de escritura a todos es inseguro',
    recommendation: 'Usar permisos mínimos necesarios, ej: chmod 755 o chmod 644'
  },
  {
    pattern: /^RUN\s+apt-get\s+install(?!.*--no-install-recommends)/i,
    severity: 'LOW' as const,
    title: 'apt-get sin --no-install-recommends',
    description: 'Instala paquetes innecesarios aumentando superficie de ataque',
    recommendation: 'Usar: apt-get install --no-install-recommends'
  },
  {
    pattern: /^RUN\s+.*&&\s*rm\s+-rf\s+\/var\/lib\/apt\/lists/i,
    severity: 'INFO' as const,
    title: '✓ Buena práctica: limpieza de cache apt',
    description: 'Limpiar cache reduce tamaño de imagen',
    recommendation: ''
  },
  {
    pattern: /^ENV\s+.*(?:PASSWORD|SECRET|KEY|TOKEN)\s*=/i,
    severity: 'CRITICAL' as const,
    title: 'Secretos en ENV',
    description: 'Variables de entorno con secretos son visibles en la imagen',
    recommendation: 'Usar Docker secrets, --env-file o build args con --secret'
  },
  {
    pattern: /^ADD\s+https?:\/\//i,
    severity: 'HIGH' as const,
    title: 'ADD con URL remota',
    description: 'ADD de URLs remotas puede introducir código no verificado',
    recommendation: 'Usar RUN curl/wget con verificación de checksum'
  },
  {
    pattern: /^EXPOSE\s+22\b/i,
    severity: 'MEDIUM' as const,
    title: 'Puerto SSH expuesto',
    description: 'SSH en containers generalmente no es necesario',
    recommendation: 'Usar docker exec para acceso, remover SSH'
  },
  {
    pattern: /^RUN\s+pip\s+install(?!.*--no-cache-dir)/i,
    severity: 'LOW' as const,
    title: 'pip install sin --no-cache-dir',
    description: 'Cache de pip aumenta tamaño de imagen innecesariamente',
    recommendation: 'Usar: pip install --no-cache-dir'
  },
  {
    pattern: /^RUN\s+npm\s+install(?!.*--production)/i,
    severity: 'LOW' as const,
    title: 'npm install incluye devDependencies',
    description: 'Instalar devDependencies en producción aumenta superficie de ataque',
    recommendation: 'Usar: npm ci --only=production o npm install --production'
  },
  {
    pattern: /^COPY\s+\.\s+\./,
    severity: 'MEDIUM' as const,
    title: 'COPY de todo el directorio',
    description: 'Puede copiar archivos sensibles (.env, .git, etc)',
    recommendation: 'Usar .dockerignore y copiar solo archivos necesarios'
  },
  {
    pattern: /^FROM\s+(?!.*alpine|.*slim|.*distroless)/i,
    severity: 'LOW' as const,
    title: 'Imagen base grande',
    description: 'Imágenes grandes tienen más superficie de ataque',
    recommendation: 'Considerar alpine, slim o distroless'
  }
]

// Base de datos de vulnerabilidades comunes en imágenes Docker
const KNOWN_VULNERABLE_IMAGES: Record<string, DockerVulnerability[]> = {
  'node:14': [
    {
      id: 'NODE14-EOL',
      title: 'Node.js 14 End of Life',
      description: 'Node.js 14 alcanzó EOL en abril 2023, no recibe actualizaciones de seguridad',
      severity: 'HIGH',
      packageName: 'node',
      installedVersion: '14.x',
      fixedVersion: '20.x LTS'
    }
  ],
  'node:16': [
    {
      id: 'NODE16-EOL',
      title: 'Node.js 16 End of Life',
      description: 'Node.js 16 alcanzó EOL en septiembre 2023',
      severity: 'HIGH',
      packageName: 'node',
      installedVersion: '16.x',
      fixedVersion: '20.x LTS'
    }
  ],
  'python:3.7': [
    {
      id: 'PYTHON37-EOL',
      title: 'Python 3.7 End of Life',
      description: 'Python 3.7 alcanzó EOL en junio 2023',
      severity: 'HIGH',
      packageName: 'python',
      installedVersion: '3.7',
      fixedVersion: '3.11+'
    }
  ],
  'ubuntu:18.04': [
    {
      id: 'UBUNTU1804-EOL',
      title: 'Ubuntu 18.04 LTS cerca de EOL',
      description: 'Ubuntu 18.04 standard support terminó, solo ESM disponible',
      severity: 'MEDIUM',
      packageName: 'ubuntu',
      installedVersion: '18.04',
      fixedVersion: '22.04 LTS'
    }
  ]
}

/**
 * Analizar Dockerfile por problemas de seguridad
 */
export function analyzeDockerfile(content: string): DockerfileIssue[] {
  const issues: DockerfileIssue[] = []
  const lines = content.split('\n')
  
  // Verificar si hay USER definido (no root)
  const hasNonRootUser = lines.some(line => 
    /^USER\s+(?!root)/i.test(line.trim())
  )
  
  if (!hasNonRootUser) {
    issues.push({
      line: 1,
      severity: 'HIGH',
      title: 'No hay USER no-root definido',
      description: 'El container ejecutará como root por defecto',
      recommendation: 'Agregar USER <nombre> antes de CMD/ENTRYPOINT'
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue

    for (const pattern of DOCKERFILE_PATTERNS) {
      if (pattern.pattern.test(line)) {
        // No agregar issues informativos (buenas prácticas)
        if (pattern.severity !== 'INFO') {
          issues.push({
            line: i + 1,
            severity: pattern.severity,
            title: pattern.title,
            description: pattern.description,
            recommendation: pattern.recommendation
          })
        }
      }
    }
  }

  // Verificar multistage build para imágenes de producción
  const fromCount = lines.filter(l => l.trim().startsWith('FROM ')).length
  if (fromCount === 1) {
    const hasDevDeps = lines.some(l => 
      /npm install|pip install|go build/i.test(l)
    )
    if (hasDevDeps) {
      issues.push({
        line: 1,
        severity: 'LOW',
        title: 'Considerar multi-stage build',
        description: 'Build tools pueden quedar en la imagen final',
        recommendation: 'Usar multi-stage build para separar build de runtime'
      })
    }
  }

  return issues
}

/**
 * Escanear imagen Docker por nombre
 * (Versión simplificada sin Trivy - usa base de datos local)
 */
export async function scanDockerImage(
  imageName: string
): Promise<DockerScanResult> {
  const startTime = Date.now()
  
  // Parsear nombre de imagen
  const [name, tag = 'latest'] = imageName.split(':')
  const imageKey = `${name}:${tag}`
  
  // Buscar vulnerabilidades conocidas
  const vulnerabilities: DockerVulnerability[] = []
  
  // Verificar en base de datos local
  for (const [image, vulns] of Object.entries(KNOWN_VULNERABLE_IMAGES)) {
    if (imageKey.includes(image) || image.includes(name)) {
      vulnerabilities.push(...vulns)
    }
  }

  // Generar recomendaciones
  const recommendations: string[] = []
  
  if (tag === 'latest') {
    recommendations.push('Especificar versión concreta en lugar de :latest')
  }
  
  if (!name.includes('alpine') && !name.includes('slim') && !name.includes('distroless')) {
    recommendations.push('Considerar usar imagen base más pequeña (alpine, slim, distroless)')
  }
  
  if (vulnerabilities.some(v => v.severity === 'CRITICAL' || v.severity === 'HIGH')) {
    recommendations.push('Actualizar a versiones más recientes para corregir vulnerabilidades')
  }

  const summary = {
    critical: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
    high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
    medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
    low: vulnerabilities.filter(v => v.severity === 'LOW').length,
    total: vulnerabilities.length
  }

  return {
    image: name,
    tag,
    scanTime: Date.now() - startTime,
    vulnerabilities,
    summary,
    recommendations
  }
}

/**
 * Escanear imagen con Trivy (si está instalado)
 * Requiere Trivy instalado: brew install trivy
 */
export async function scanWithTrivy(imageName: string): Promise<DockerScanResult | null> {
  // Esta función solo funciona si Trivy está instalado localmente
  // En producción, podrías usar Trivy como servicio o container
  
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    // Ejecutar Trivy
    const { stdout } = await execAsync(
      `trivy image --format json --severity HIGH,CRITICAL ${imageName}`,
      { timeout: 120000 }
    )
    
    const result = JSON.parse(stdout)
    const vulnerabilities: DockerVulnerability[] = []
    
    for (const res of result.Results || []) {
      for (const vuln of res.Vulnerabilities || []) {
        vulnerabilities.push({
          id: vuln.VulnerabilityID,
          cveId: vuln.VulnerabilityID,
          title: vuln.Title || vuln.VulnerabilityID,
          description: vuln.Description || '',
          severity: vuln.Severity?.toUpperCase() || 'MEDIUM',
          packageName: vuln.PkgName,
          installedVersion: vuln.InstalledVersion,
          fixedVersion: vuln.FixedVersion,
          target: res.Target
        })
      }
    }
    
    const [name, tag = 'latest'] = imageName.split(':')
    
    return {
      image: name,
      tag,
      scanTime: 0,
      vulnerabilities,
      summary: {
        critical: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
        high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
        medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
        low: vulnerabilities.filter(v => v.severity === 'LOW').length,
        total: vulnerabilities.length
      },
      recommendations: []
    }
  } catch (error) {
    // Trivy no está instalado o falló
    console.log('Trivy not available, using basic scan')
    return null
  }
}

/**
 * Escaneo completo: Trivy si disponible, si no análisis básico
 */
export async function fullDockerScan(
  imageName: string,
  dockerfileContent?: string
): Promise<{
  imageScan: DockerScanResult
  dockerfileIssues?: DockerfileIssue[]
}> {
  // Intentar Trivy primero
  let imageScan = await scanWithTrivy(imageName)
  
  // Si Trivy no está disponible, usar escaneo básico
  if (!imageScan) {
    imageScan = await scanDockerImage(imageName)
  }
  
  // Analizar Dockerfile si se proporciona
  let dockerfileIssues: DockerfileIssue[] | undefined
  if (dockerfileContent) {
    dockerfileIssues = analyzeDockerfile(dockerfileContent)
  }
  
  return {
    imageScan,
    dockerfileIssues
  }
}
