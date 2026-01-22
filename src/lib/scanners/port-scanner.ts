/**
 * Port Scanner - Escaneo de puertos usando Node.js nativo
 * No requiere dependencias externas
 */

import * as net from 'net'
import * as dns from 'dns'
import { promisify } from 'util'

const dnsLookup = promisify(dns.lookup)

interface PortScanResult {
  port: number
  status: 'open' | 'closed' | 'filtered'
  service?: string
  banner?: string
  vulnerability?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
}

interface HostScanResult {
  host: string
  ip?: string
  scanTime: number
  ports: PortScanResult[]
  openPorts: number
  vulnerabilities: PortVulnerability[]
}

interface PortVulnerability {
  port: number
  service: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  recommendation: string
}

// Puertos comunes y sus servicios
const COMMON_PORTS: Record<number, { service: string; risk?: string }> = {
  20: { service: 'FTP-DATA' },
  21: { service: 'FTP', risk: 'Protocolo sin cifrado, considerar SFTP' },
  22: { service: 'SSH' },
  23: { service: 'Telnet', risk: 'CRÍTICO: Protocolo sin cifrado, deshabilitar inmediatamente' },
  25: { service: 'SMTP' },
  53: { service: 'DNS' },
  80: { service: 'HTTP', risk: 'Usar HTTPS en su lugar' },
  110: { service: 'POP3', risk: 'Usar POP3S con TLS' },
  111: { service: 'RPC', risk: 'Puede exponer información del sistema' },
  135: { service: 'MSRPC', risk: 'Puerto Windows expuesto' },
  139: { service: 'NetBIOS', risk: 'Puede permitir enumeración de recursos' },
  143: { service: 'IMAP', risk: 'Usar IMAPS con TLS' },
  443: { service: 'HTTPS' },
  445: { service: 'SMB', risk: 'Alto riesgo si está expuesto a Internet (EternalBlue, etc.)' },
  993: { service: 'IMAPS' },
  995: { service: 'POP3S' },
  1433: { service: 'MSSQL', risk: 'Base de datos expuesta - no recomendado' },
  1521: { service: 'Oracle', risk: 'Base de datos expuesta - no recomendado' },
  3306: { service: 'MySQL', risk: 'Base de datos expuesta - no recomendado' },
  3389: { service: 'RDP', risk: 'Alto riesgo si está expuesto a Internet (BlueKeep, etc.)' },
  5432: { service: 'PostgreSQL', risk: 'Base de datos expuesta - no recomendado' },
  5900: { service: 'VNC', risk: 'Escritorio remoto potencialmente inseguro' },
  6379: { service: 'Redis', risk: 'CRÍTICO si no tiene autenticación' },
  8080: { service: 'HTTP-Proxy' },
  8443: { service: 'HTTPS-Alt' },
  27017: { service: 'MongoDB', risk: 'CRÍTICO: A menudo sin autenticación por defecto' },
  27018: { service: 'MongoDB-Shard' },
}

// Puertos más críticos para escaneo rápido
const TOP_PORTS = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 
                   1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017]

// Todos los puertos conocidos
const ALL_KNOWN_PORTS = Object.keys(COMMON_PORTS).map(Number)

/**
 * Escanear un puerto específico
 */
async function scanPort(host: string, port: number, timeout: number = 2000): Promise<PortScanResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let banner = ''
    
    socket.setTimeout(timeout)
    
    socket.on('connect', () => {
      const portInfo = COMMON_PORTS[port]
      
      // Intentar obtener banner
      socket.on('data', (data) => {
        banner = data.toString().trim().substring(0, 200)
      })
      
      // Enviar probe para algunos servicios
      if ([21, 22, 25, 110, 143].includes(port)) {
        socket.write('\r\n')
      }
      
      // Dar tiempo para recibir banner
      setTimeout(() => {
        socket.destroy()
        resolve({
          port,
          status: 'open',
          service: portInfo?.service || 'unknown',
          banner: banner || undefined,
          vulnerability: portInfo?.risk,
          severity: portInfo?.risk ? (
            portInfo.risk.includes('CRÍTICO') ? 'CRITICAL' :
            portInfo.risk.includes('Alto') ? 'HIGH' : 'MEDIUM'
          ) : undefined
        })
      }, 300)
    })
    
    socket.on('timeout', () => {
      socket.destroy()
      resolve({ port, status: 'filtered' })
    })
    
    socket.on('error', () => {
      socket.destroy()
      resolve({ port, status: 'closed' })
    })
    
    socket.connect(port, host)
  })
}

/**
 * Resolver hostname a IP
 */
async function resolveHost(host: string): Promise<string | undefined> {
  try {
    // Si ya es una IP, retornarla
    if (net.isIP(host)) return host
    
    const result = await dnsLookup(host)
    return result.address
  } catch {
    return undefined
  }
}

/**
 * Escanear host completo
 */
export async function scanHost(
  host: string,
  options: {
    ports?: number[] | 'top' | 'common' | 'full'
    timeout?: number
    concurrency?: number
  } = {}
): Promise<HostScanResult> {
  const {
    ports = 'top',
    timeout = 2000,
    concurrency = 50
  } = options

  const startTime = Date.now()
  
  // Determinar puertos a escanear
  let portsToScan: number[]
  if (Array.isArray(ports)) {
    portsToScan = ports
  } else if (ports === 'top') {
    portsToScan = TOP_PORTS
  } else if (ports === 'common') {
    portsToScan = ALL_KNOWN_PORTS
  } else {
    // Full scan - 1 a 1024
    portsToScan = Array.from({ length: 1024 }, (_, i) => i + 1)
  }

  // Resolver IP
  const ip = await resolveHost(host)
  if (!ip) {
    throw new Error(`No se pudo resolver el host: ${host}`)
  }

  // Escanear puertos con concurrencia limitada
  const results: PortScanResult[] = []
  
  for (let i = 0; i < portsToScan.length; i += concurrency) {
    const batch = portsToScan.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(port => scanPort(ip, port, timeout))
    )
    results.push(...batchResults)
  }

  // Filtrar puertos abiertos
  const openPorts = results.filter(r => r.status === 'open')
  
  // Generar vulnerabilidades basadas en puertos abiertos
  const vulnerabilities: PortVulnerability[] = openPorts
    .filter(p => p.vulnerability)
    .map(p => ({
      port: p.port,
      service: p.service || 'unknown',
      title: `Puerto ${p.port} (${p.service}) abierto`,
      description: p.vulnerability!,
      severity: p.severity || 'MEDIUM',
      recommendation: getRecommendation(p.port, p.service || '')
    }))

  return {
    host,
    ip,
    scanTime: Date.now() - startTime,
    ports: results.filter(r => r.status === 'open'),
    openPorts: openPorts.length,
    vulnerabilities
  }
}

/**
 * Obtener recomendación según el servicio
 */
function getRecommendation(port: number, service: string): string {
  const recommendations: Record<number, string> = {
    21: 'Migrar a SFTP (puerto 22) o FTPS (puerto 990)',
    23: 'Deshabilitar Telnet y usar SSH en su lugar',
    80: 'Redirigir todo el tráfico a HTTPS (443)',
    110: 'Habilitar TLS/SSL para POP3 (puerto 995)',
    143: 'Habilitar TLS/SSL para IMAP (puerto 993)',
    135: 'Bloquear en firewall si no es necesario',
    139: 'Deshabilitar NetBIOS si no es requerido',
    445: 'Bloquear SMB del acceso externo, mantener actualizado contra vulnerabilidades',
    1433: 'No exponer bases de datos a Internet, usar VPN',
    1521: 'No exponer bases de datos a Internet, usar VPN',
    3306: 'No exponer bases de datos a Internet, usar VPN o túnel SSH',
    3389: 'Usar VPN o Gateway de escritorio remoto, habilitar NLA',
    5432: 'No exponer bases de datos a Internet, usar VPN o túnel SSH',
    5900: 'Usar VPN, configurar contraseña fuerte',
    6379: 'Habilitar autenticación, no exponer a Internet',
    27017: 'Habilitar autenticación, bind a localhost únicamente',
  }
  
  return recommendations[port] || `Revisar si el puerto ${port} necesita estar abierto`
}

/**
 * Escaneo rápido de puertos críticos
 */
export async function quickScan(host: string): Promise<HostScanResult> {
  return scanHost(host, {
    ports: 'top',
    timeout: 1500,
    concurrency: 24
  })
}

/**
 * Verificar si un puerto específico está abierto
 */
export async function checkPort(host: string, port: number): Promise<boolean> {
  const result = await scanPort(host, port, 3000)
  return result.status === 'open'
}
