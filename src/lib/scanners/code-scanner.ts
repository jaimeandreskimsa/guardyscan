/**
 * Code Scanner - Análisis estático de código usando patrones regex
 * Detecta vulnerabilidades comunes en el código fuente
 */

interface CodeVulnerability {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  category: string
  file?: string
  line?: number
  column?: number
  code?: string
  recommendation: string
  cweId?: string
  owaspCategory?: string
}

interface SecurityPattern {
  id: string
  title: string
  pattern: RegExp
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  category: string
  description: string
  recommendation: string
  cweId: string
  owaspCategory: string
  languages: string[]
}

// Patrones de seguridad para detectar vulnerabilidades
const SECURITY_PATTERNS: SecurityPattern[] = [
  // SQL Injection
  {
    id: 'SQL_INJECTION',
    title: 'Posible SQL Injection',
    pattern: /(\$\{.*?\}|(\+\s*[\w]+\s*\+)|\bconcat\s*\()/gi,
    severity: 'CRITICAL',
    category: 'Injection',
    description: 'Concatenación de strings en consultas SQL puede permitir inyección SQL',
    recommendation: 'Usar prepared statements o parámetros seguros',
    cweId: 'CWE-89',
    owaspCategory: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'java', 'php']
  },
  {
    id: 'SQL_RAW_QUERY',
    title: 'Consulta SQL sin parametrizar',
    pattern: /\.(query|execute|raw|exec)\s*\(\s*[`'"].*(\$|%s|\+)/gi,
    severity: 'CRITICAL',
    category: 'Injection',
    description: 'Consulta SQL construida con interpolación de variables',
    recommendation: 'Usar ORM o prepared statements con parámetros',
    cweId: 'CWE-89',
    owaspCategory: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'java']
  },

  // XSS
  {
    id: 'XSS_INNERHTML',
    title: 'Uso de innerHTML/dangerouslySetInnerHTML',
    pattern: /(innerHTML\s*=|dangerouslySetInnerHTML|v-html\s*=|\[innerHTML\])/gi,
    severity: 'HIGH',
    category: 'XSS',
    description: 'Inserción directa de HTML puede permitir ataques XSS',
    recommendation: 'Sanitizar contenido o usar textContent/innerText',
    cweId: 'CWE-79',
    owaspCategory: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'html']
  },
  {
    id: 'XSS_DOCUMENT_WRITE',
    title: 'Uso de document.write',
    pattern: /document\.write\s*\(/gi,
    severity: 'HIGH',
    category: 'XSS',
    description: 'document.write puede ser explotado para XSS',
    recommendation: 'Usar métodos DOM seguros como createElement',
    cweId: 'CWE-79',
    owaspCategory: 'A03:2021-Injection',
    languages: ['javascript', 'typescript']
  },
  {
    id: 'XSS_EVAL',
    title: 'Uso de eval() o Function()',
    pattern: /\b(eval|Function)\s*\(/gi,
    severity: 'CRITICAL',
    category: 'Code Injection',
    description: 'eval() y Function() pueden ejecutar código malicioso',
    recommendation: 'Evitar eval(), usar JSON.parse() para datos',
    cweId: 'CWE-95',
    owaspCategory: 'A03:2021-Injection',
    languages: ['javascript', 'typescript']
  },

  // Hardcoded Secrets
  {
    id: 'HARDCODED_PASSWORD',
    title: 'Contraseña hardcodeada',
    pattern: /(password|passwd|pwd|secret|apikey|api_key|api-key)\s*[=:]\s*['"][^'"]{4,}['"]/gi,
    severity: 'CRITICAL',
    category: 'Secrets',
    description: 'Credenciales expuestas en el código fuente',
    recommendation: 'Usar variables de entorno o gestor de secretos',
    cweId: 'CWE-798',
    owaspCategory: 'A07:2021-Identification and Authentication Failures',
    languages: ['javascript', 'typescript', 'python', 'java', 'php', 'go']
  },
  {
    id: 'HARDCODED_TOKEN',
    title: 'Token o API Key hardcodeado',
    pattern: /(token|bearer|authorization|auth)\s*[=:]\s*['"][A-Za-z0-9_\-\.]{20,}['"]/gi,
    severity: 'CRITICAL',
    category: 'Secrets',
    description: 'Token de autenticación expuesto en código',
    recommendation: 'Almacenar tokens en variables de entorno',
    cweId: 'CWE-798',
    owaspCategory: 'A07:2021-Identification and Authentication Failures',
    languages: ['javascript', 'typescript', 'python', 'java', 'php', 'go']
  },
  {
    id: 'AWS_KEY',
    title: 'AWS Access Key expuesta',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    category: 'Secrets',
    description: 'Clave de acceso AWS expuesta',
    recommendation: 'Rotar la clave inmediatamente y usar IAM roles',
    cweId: 'CWE-798',
    owaspCategory: 'A07:2021-Identification and Authentication Failures',
    languages: ['*']
  },
  {
    id: 'PRIVATE_KEY',
    title: 'Clave privada en código',
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
    severity: 'CRITICAL',
    category: 'Secrets',
    description: 'Clave privada expuesta en el código',
    recommendation: 'Almacenar claves en archivos seguros fuera del repositorio',
    cweId: 'CWE-321',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    languages: ['*']
  },

  // Insecure Crypto
  {
    id: 'WEAK_HASH_MD5',
    title: 'Uso de MD5 (hash débil)',
    pattern: /\b(md5|MD5)\s*\(/gi,
    severity: 'HIGH',
    category: 'Cryptography',
    description: 'MD5 es criptográficamente inseguro',
    recommendation: 'Usar SHA-256, SHA-3, o bcrypt para contraseñas',
    cweId: 'CWE-328',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    languages: ['javascript', 'typescript', 'python', 'java', 'php', 'go']
  },
  {
    id: 'WEAK_HASH_SHA1',
    title: 'Uso de SHA-1 (hash débil)',
    pattern: /\b(sha1|SHA1)\s*\(/gi,
    severity: 'MEDIUM',
    category: 'Cryptography',
    description: 'SHA-1 tiene colisiones conocidas',
    recommendation: 'Usar SHA-256 o SHA-3',
    cweId: 'CWE-328',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    languages: ['javascript', 'typescript', 'python', 'java', 'php', 'go']
  },
  {
    id: 'WEAK_RANDOM',
    title: 'Generador de números aleatorios inseguro',
    pattern: /Math\.random\s*\(\)/gi,
    severity: 'MEDIUM',
    category: 'Cryptography',
    description: 'Math.random() no es criptográficamente seguro',
    recommendation: 'Usar crypto.randomBytes() o crypto.getRandomValues()',
    cweId: 'CWE-338',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    languages: ['javascript', 'typescript']
  },

  // Path Traversal
  {
    id: 'PATH_TRAVERSAL',
    title: 'Posible Path Traversal',
    pattern: /\.(readFile|writeFile|readdir|unlink|rmdir)\s*\([^)]*(\+|`|\$\{)/gi,
    severity: 'HIGH',
    category: 'Path Traversal',
    description: 'Construcción dinámica de rutas de archivos',
    recommendation: 'Validar y sanitizar rutas, usar path.resolve() con base fija',
    cweId: 'CWE-22',
    owaspCategory: 'A01:2021-Broken Access Control',
    languages: ['javascript', 'typescript']
  },

  // Command Injection
  {
    id: 'COMMAND_INJECTION',
    title: 'Posible Command Injection',
    pattern: /\b(exec|execSync|spawn|system|popen)\s*\([^)]*(\+|`|\$\{|%s)/gi,
    severity: 'CRITICAL',
    category: 'Command Injection',
    description: 'Ejecución de comandos con entrada no sanitizada',
    recommendation: 'Evitar ejecutar comandos con entrada del usuario',
    cweId: 'CWE-78',
    owaspCategory: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'php']
  },

  // Insecure Deserialize
  {
    id: 'UNSAFE_DESERIALIZE',
    title: 'Deserialización insegura',
    pattern: /\b(pickle\.load|yaml\.load|unserialize|JSON\.parse)\s*\([^)]*\)/gi,
    severity: 'HIGH',
    category: 'Deserialization',
    description: 'Deserialización de datos no confiables',
    recommendation: 'Validar origen de datos, usar yaml.safe_load()',
    cweId: 'CWE-502',
    owaspCategory: 'A08:2021-Software and Data Integrity Failures',
    languages: ['python', 'php', 'javascript']
  },

  // CORS
  {
    id: 'CORS_WILDCARD',
    title: 'CORS con wildcard',
    pattern: /Access-Control-Allow-Origin['":\s]*['"]\*['"]/gi,
    severity: 'MEDIUM',
    category: 'CORS',
    description: 'CORS permite cualquier origen',
    recommendation: 'Especificar orígenes permitidos explícitamente',
    cweId: 'CWE-942',
    owaspCategory: 'A05:2021-Security Misconfiguration',
    languages: ['javascript', 'typescript', 'python', 'java', 'php']
  },

  // Debug/Logging
  {
    id: 'DEBUG_ENABLED',
    title: 'Modo debug habilitado',
    pattern: /\b(DEBUG|debug)\s*[=:]\s*(true|True|1|['"]true['"])/gi,
    severity: 'LOW',
    category: 'Configuration',
    description: 'Modo debug activo puede exponer información sensible',
    recommendation: 'Deshabilitar debug en producción',
    cweId: 'CWE-489',
    owaspCategory: 'A05:2021-Security Misconfiguration',
    languages: ['*']
  },
  {
    id: 'CONSOLE_LOG_SENSITIVE',
    title: 'Logging de datos sensibles',
    pattern: /console\.(log|info|warn|error)\s*\([^)]*\b(password|token|secret|key|credential)/gi,
    severity: 'MEDIUM',
    category: 'Logging',
    description: 'Posible logging de información sensible',
    recommendation: 'No loggear datos sensibles',
    cweId: 'CWE-532',
    owaspCategory: 'A09:2021-Security Logging and Monitoring Failures',
    languages: ['javascript', 'typescript']
  },

  // HTTP Security
  {
    id: 'HTTP_INSECURE',
    title: 'Conexión HTTP insegura',
    pattern: /['"]http:\/\/(?!localhost|127\.0\.0\.1)/gi,
    severity: 'MEDIUM',
    category: 'Transport Security',
    description: 'Uso de HTTP en lugar de HTTPS',
    recommendation: 'Usar HTTPS para todas las conexiones externas',
    cweId: 'CWE-319',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    languages: ['*']
  },
  {
    id: 'SSL_VERIFY_DISABLED',
    title: 'Verificación SSL deshabilitada',
    pattern: /(rejectUnauthorized|verify|VERIFY_PEER)\s*[=:]\s*(false|False|0)/gi,
    severity: 'HIGH',
    category: 'Transport Security',
    description: 'Verificación de certificados SSL deshabilitada',
    recommendation: 'Mantener verificación SSL habilitada',
    cweId: 'CWE-295',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    languages: ['javascript', 'typescript', 'python', 'php']
  }
]

/**
 * Detectar lenguaje por extensión de archivo
 */
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'php': 'php',
    'go': 'go',
    'rb': 'ruby',
    'cs': 'csharp',
    'html': 'html',
    'vue': 'javascript',
    'svelte': 'javascript'
  }
  return langMap[ext || ''] || 'unknown'
}

/**
 * Escanear código fuente
 */
export function scanCode(
  code: string,
  filename: string = 'unknown'
): CodeVulnerability[] {
  const vulnerabilities: CodeVulnerability[] = []
  const language = detectLanguage(filename)
  const lines = code.split('\n')

  for (const pattern of SECURITY_PATTERNS) {
    // Verificar si el patrón aplica al lenguaje
    if (!pattern.languages.includes('*') && !pattern.languages.includes(language)) {
      continue
    }

    // Buscar coincidencias línea por línea para mejor ubicación
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const matches = line.match(pattern.pattern)
      
      if (matches) {
        for (const match of matches) {
          const column = line.indexOf(match)
          
          vulnerabilities.push({
            id: `${pattern.id}-${i + 1}`,
            title: pattern.title,
            description: pattern.description,
            severity: pattern.severity,
            category: pattern.category,
            file: filename,
            line: i + 1,
            column: column + 1,
            code: line.trim().substring(0, 100),
            recommendation: pattern.recommendation,
            cweId: pattern.cweId,
            owaspCategory: pattern.owaspCategory
          })
        }
      }
    }
  }

  // Deduplificar por línea
  const unique = vulnerabilities.filter((v, i, arr) => 
    arr.findIndex(x => x.file === v.file && x.line === v.line && x.title === v.title) === i
  )

  return unique
}

/**
 * Escanear múltiples archivos
 */
export function scanFiles(
  files: Array<{ name: string; content: string }>
): CodeVulnerability[] {
  const allVulnerabilities: CodeVulnerability[] = []

  for (const file of files) {
    const vulns = scanCode(file.content, file.name)
    allVulnerabilities.push(...vulns)
  }

  return allVulnerabilities
}

/**
 * Generar resumen del escaneo
 */
export function generateScanSummary(vulnerabilities: CodeVulnerability[]) {
  return {
    total: vulnerabilities.length,
    bySeverity: {
      CRITICAL: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      HIGH: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      MEDIUM: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      LOW: vulnerabilities.filter(v => v.severity === 'LOW').length,
      INFO: vulnerabilities.filter(v => v.severity === 'INFO').length,
    },
    byCategory: vulnerabilities.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byFile: vulnerabilities.reduce((acc, v) => {
      const file = v.file || 'unknown'
      acc[file] = (acc[file] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}
