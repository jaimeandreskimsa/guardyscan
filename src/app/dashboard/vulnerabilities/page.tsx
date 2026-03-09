'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldAlert, Search, RefreshCw, AlertTriangle, CheckCircle, Clock,
  Bug, Plus, Eye, Radar, ExternalLink, Shield, TrendingUp, TrendingDown,
  Target, Activity, Flame, Skull, ShieldCheck, Info, ChevronRight,
  Globe, Server, Database as DbIcon, Network, Laptop, Cloud, Code,
  FileWarning, Package, Container, Zap, BarChart3, ArrowRight,
  CircleDot, Loader2, Filter, Download, X
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────
interface Vulnerability {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  status: string
  source: string
  cveId?: string
  cweId?: string
  cvssScore?: number
  cvssVector?: string
  assetName?: string
  assetType?: string
  exploitAvailable?: boolean
  patchAvailable?: boolean
  remediation?: string
  priority?: string
  assignedTo?: string
  discoveredAt: string
  remediatedAt?: string
  publishedAt?: string
  references?: any
  tags?: any
  scanId?: string
}

interface Stats {
  bySeverity?: Record<string, number>
  byStatus?: Record<string, number>
  total?: number
}

type ActiveTab = 'overview' | 'list' | 'sources' | 'remediation'

// ─── Constants ────────────────────────────────────────────────────
const SEV = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', fill: '#ef4444', border: 'border-red-500', dot: 'bg-red-500', label: 'Crítica', weight: 10 },
  HIGH:     { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', fill: '#f97316', border: 'border-orange-500', dot: 'bg-orange-500', label: 'Alta', weight: 7 },
  MEDIUM:   { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', fill: '#eab308', border: 'border-yellow-500', dot: 'bg-yellow-500', label: 'Media', weight: 4 },
  LOW:      { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', fill: '#3b82f6', border: 'border-blue-500', dot: 'bg-blue-500', label: 'Baja', weight: 1 },
  INFO:     { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', fill: '#6b7280', border: 'border-gray-500', dot: 'bg-gray-500', label: 'Info', weight: 0 },
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; emoji: string }> = {
  OPEN:           { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Abierta', emoji: '🔴' },
  IN_PROGRESS:    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'En Progreso', emoji: '🟡' },
  REMEDIATED:     { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Remediada', emoji: '🟢' },
  RESOLVED:       { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Resuelta', emoji: '🟢' },
  ACCEPTED:       { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Aceptada', emoji: '🟣' },
  FALSE_POSITIVE: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: 'Falso Positivo', emoji: '⚪' },
}

const SOURCE_MAP: Record<string, { label: string; icon: any; color: string }> = {
  SCAN:            { label: 'Escaneo Web', icon: Globe, color: 'text-blue-600' },
  PORT_SCAN:       { label: 'Escaneo de Puertos', icon: Network, color: 'text-cyan-600' },
  CODE_SCAN:       { label: 'Análisis de Código', icon: Code, color: 'text-purple-600' },
  DEPENDENCY_SCAN: { label: 'Dependencias', icon: Package, color: 'text-orange-600' },
  DOCKER_SCAN:     { label: 'Docker', icon: Container, color: 'text-sky-600' },
  MANUAL:          { label: 'Manual', icon: Plus, color: 'text-gray-600' },
  PENTEST:         { label: 'Pentest', icon: Target, color: 'text-red-600' },
  BUG_BOUNTY:      { label: 'Bug Bounty', icon: Bug, color: 'text-green-600' },
  EXTERNAL_FEED:   { label: 'Feed Externo', icon: ExternalLink, color: 'text-indigo-600' },
}

const ASSET_ICONS: Record<string, any> = {
  SERVER: Server, WEB: Globe, DATABASE: DbIcon, NETWORK: Network,
  ENDPOINT: Laptop, API: Code, CLOUD: Cloud, MOBILE: Laptop,
}

// ─── Risk Level Calculation (semáforo) ───────────────────────────
function calculateRiskLevel(vulns: Vulnerability[], stats: Stats) {
  const open = vulns.filter(v => v.status === 'OPEN' || v.status === 'IN_PROGRESS')
  const critical = open.filter(v => v.severity === 'CRITICAL').length
  const high = open.filter(v => v.severity === 'HIGH').length
  const medium = open.filter(v => v.severity === 'MEDIUM').length

  const score = critical * 10 + high * 7 + medium * 4
  const activeCount = open.length

  // Last 30 days
  const now = Date.now()
  const last30 = vulns.filter(v => (now - new Date(v.discoveredAt).getTime()) < 30 * 24 * 60 * 60 * 1000)
  const criticalLast30 = last30.filter(v => v.severity === 'CRITICAL').length

  let level: 'critical' | 'high' | 'medium' | 'low' | 'minimal'
  if (critical > 0 || score >= 50) level = 'critical'
  else if (high > 0 || score >= 30) level = 'high'
  else if (medium > 0 || score >= 10) level = 'medium'
  else if (activeCount > 0) level = 'low'
  else level = 'minimal'

  return { level, score, activeCount, critical, high, medium, criticalLast30, last30Count: last30.length }
}

const RISK_CONFIG = {
  critical: { color: 'text-red-600', bg: 'bg-red-500', bgLight: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-500', label: 'Crítico', icon: Skull, semaphore: ['bg-red-500', 'bg-gray-300 dark:bg-gray-600', 'bg-gray-300 dark:bg-gray-600'] },
  high:     { color: 'text-orange-600', bg: 'bg-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-500', label: 'Alto', icon: Flame, semaphore: ['bg-red-500', 'bg-orange-400', 'bg-gray-300 dark:bg-gray-600'] },
  medium:   { color: 'text-yellow-600', bg: 'bg-yellow-500', bgLight: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500', label: 'Medio', icon: AlertTriangle, semaphore: ['bg-gray-300 dark:bg-gray-600', 'bg-yellow-400', 'bg-gray-300 dark:bg-gray-600'] },
  low:      { color: 'text-blue-600', bg: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', label: 'Bajo', icon: ShieldCheck, semaphore: ['bg-gray-300 dark:bg-gray-600', 'bg-gray-300 dark:bg-gray-600', 'bg-green-400'] },
  minimal:  { color: 'text-green-600', bg: 'bg-green-500', bgLight: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500', label: 'Mínimo', icon: ShieldCheck, semaphore: ['bg-gray-300 dark:bg-gray-600', 'bg-gray-300 dark:bg-gray-600', 'bg-green-500'] },
}

// ─── Impact & Compliance helpers ─────────────────────────────────
function getImpactForVuln(v: Vulnerability): string[] {
  const impacts: string[] = []
  const lower = (v.title + ' ' + (v.description || '') + ' ' + (v.cweId || '')).toLowerCase()

  if (v.exploitAvailable)
    impacts.push('Exploit público disponible — riesgo de explotación activa')
  if (v.severity === 'CRITICAL' || v.severity === 'HIGH') {
    impacts.push('Exposición de datos sensibles o credenciales')
    impacts.push('Posible ejecución remota de código o escalamiento de privilegios')
  }
  // Port-specific
  if (lower.includes('imap') || lower.includes('143'))
    impacts.push('Interceptación de credenciales de correo electrónico en texto plano')
  if ((lower.includes('http') && !lower.includes('https')) || lower.includes('puerto 80'))
    impacts.push('Interceptación de datos no cifrados en tránsito')
  if (lower.includes('ftp') || lower.includes('puerto 21'))
    impacts.push('Captura de credenciales y archivos transferidos sin cifrado')
  if (lower.includes('smtp') || lower.includes('puerto 25') || lower.includes('puerto 587'))
    impacts.push('Interceptación de correos electrónicos en tránsito')
  if (lower.includes('mysql') || lower.includes('3306') || lower.includes('postgres') || lower.includes('5432'))
    impacts.push('Acceso no autorizado a la base de datos')
  if (lower.includes('rdp') || lower.includes('3389'))
    impacts.push('Acceso remoto no autorizado al sistema')
  if (lower.includes('ssh') || lower.includes('puerto 22'))
    impacts.push('Superficie expuesta a ataques de fuerza bruta')
  // Web vulnerabilities
  if (lower.includes('xss') || lower.includes('cwe-79'))
    impacts.push('Inyección de scripts maliciosos en el navegador (XSS)')
  if (lower.includes('sql') || lower.includes('cwe-89'))
    impacts.push('Acceso no autorizado a la base de datos (SQL Injection)')
  if (lower.includes('ssl') || lower.includes('tls') || lower.includes('https') || lower.includes('cifr') || lower.includes('encrypt'))
    impacts.push('Riesgo de ataques Man-in-the-Middle (MITM)')
  if (lower.includes('header') || lower.includes('cors') || lower.includes('csp'))
    impacts.push('Reducción de las protecciones del navegador')
  if (lower.includes('dependency') || lower.includes('dependencia') || lower.includes('component') || lower.includes('outdated'))
    impacts.push('Uso de componentes con vulnerabilidades conocidas')
  // Always at the end
  impacts.push('Incumplimiento de buenas prácticas de seguridad')
  return [...new Set(impacts)]
}

function getComplianceForVuln(v: Vulnerability): string[] {
  const refs: string[] = []
  const lower = (v.title + ' ' + (v.description || '') + ' ' + (v.cweId || '')).toLowerCase()

  if (lower.includes('ssl') || lower.includes('tls') || lower.includes('crypto') || lower.includes('cipher') || lower.includes('cifr') || lower.includes('encrypt') || lower.includes('imap') || lower.includes('smtp') || lower.includes('ftp') || lower.includes('http')) {
    refs.push('ISO/IEC 27001: A.8.20 – Seguridad en las comunicaciones')
    refs.push('ISO/IEC 27001: A.8.24 – Uso de criptografía')
    refs.push('OWASP Top 10: A02 – Cryptographic Failures')
    if (lower.includes('imap') || lower.includes('smtp') || lower.includes('ftp'))
      refs.push('Buenas prácticas: Uso obligatorio de protocolos cifrados (TLS/SSL)')
    else if (lower.includes('http'))
      refs.push('Buenas prácticas: HTTPS Everywhere')
  }
  if (lower.includes('xss') || lower.includes('injection') || lower.includes('sql') || lower.includes('cwe-79') || lower.includes('cwe-89')) {
    refs.push('OWASP Top 10: A03 – Injection')
    refs.push('ISO/IEC 27001: A.8.28 – Codificación segura')
    refs.push('Buenas prácticas: Validación y sanitización de entradas')
  }
  if (lower.includes('auth') || lower.includes('login') || lower.includes('password') || lower.includes('credential')) {
    refs.push('OWASP Top 10: A07 – Identification and Authentication Failures')
    refs.push('ISO/IEC 27001: A.8.5 – Autenticación segura')
  }
  if (lower.includes('config') || lower.includes('header') || lower.includes('cors') || lower.includes('misconfiguration')) {
    refs.push('OWASP Top 10: A05 – Security Misconfiguration')
    refs.push('ISO/IEC 27001: A.8.9 – Gestión de configuración')
  }
  if (lower.includes('outdated') || lower.includes('vulnerable component') || lower.includes('dependency') || lower.includes('dependencia')) {
    refs.push('OWASP Top 10: A06 – Vulnerable and Outdated Components')
    refs.push('Buenas prácticas: Actualización periódica de dependencias')
  }
  if (lower.includes('access') || lower.includes('permission') || lower.includes('privilege')) {
    refs.push('OWASP Top 10: A01 – Broken Access Control')
    refs.push('ISO/IEC 27001: A.8.3 – Control de acceso')
  }
  if (lower.includes('puerto') || lower.includes('port') || lower.includes('abierto') || lower.includes('open')) {
    if (!refs.some(r => r.includes('A.8.20'))) refs.push('ISO/IEC 27001: A.8.20 – Seguridad en las comunicaciones')
    refs.push('Buenas prácticas: Principio de mínima exposición de servicios')
  }
  if (lower.includes('docker') || lower.includes('container') || lower.includes('imagen')) {
    refs.push('CIS Docker Benchmark: Sección 4 – Container Images')
    refs.push('Buenas prácticas: Escaneo de imágenes previo al despliegue')
  }
  if (refs.length === 0) {
    refs.push('ISO/IEC 27001: A.8.8 – Gestión de vulnerabilidades técnicas')
    refs.push('Buenas prácticas: Revisión y remediación periódica')
  }
  return [...new Set(refs)]
}

function getRemediationMeta(v: Vulnerability) {
  if (v.severity === 'CRITICAL') return { difficulty: 'Alta', time: '1–4 horas', reversible: 'Depende', impact: 'Alto' }
  if (v.severity === 'HIGH') return { difficulty: 'Media-Alta', time: '30 min–2 horas', reversible: 'Sí', impact: 'Medio' }
  if (v.severity === 'MEDIUM') return { difficulty: 'Baja-Media', time: '15–60 min', reversible: 'Sí', impact: 'Bajo' }
  return { difficulty: 'Baja', time: '< 15 min', reversible: 'Sí', impact: 'Bajo' }
}

function getEnrichedDescription(v: Vulnerability): string {
  if (v.description && v.description.length > 80) return v.description
  const lower = (v.title + ' ' + (v.description || '')).toLowerCase()
  const portMatch = lower.match(/puerto\s*(\d+)/i) || lower.match(/port\s*(\d+)/i)
  const port = portMatch ? portMatch[1] : null

  // Port scan enrichment
  if (v.source === 'PORT_SCAN' || lower.includes('puerto') || lower.includes('port')) {
    if (lower.includes('imap') || port === '143')
      return `El servidor acepta conexiones IMAP sin cifrar en el puerto ${port || '143'}. Esto permite que las credenciales de correo electrónico y los mensajes puedan ser interceptados por terceros durante el tránsito.`
    if ((lower.includes('http') && !lower.includes('https')) || port === '80')
      return `El servidor acepta conexiones HTTP sin cifrado en el puerto ${port || '80'}. Esto permite que la información transmitida pueda ser interceptada por terceros durante el tránsito.`
    if (lower.includes('ftp') || port === '21')
      return `El servidor expone el servicio FTP en el puerto ${port || '21'} sin cifrado. Las credenciales y archivos transferidos pueden ser capturados por un atacante en la red.`
    if (lower.includes('smtp') || port === '25' || port === '587')
      return `El servicio SMTP está disponible en el puerto ${port}. Sin la configuración TLS adecuada, los correos electrónicos en tránsito pueden ser interceptados o manipulados.`
    if (lower.includes('ssh') || port === '22')
      return `El servicio SSH está expuesto en el puerto ${port || '22'}. Aunque SSH proporciona cifrado, la exposición pública incrementa la superficie de ataque para intentos de fuerza bruta y escaneos automatizados.`
    if (lower.includes('mysql') || port === '3306')
      return `El servicio MySQL está accesible en el puerto ${port || '3306'}. La exposición de servicios de base de datos al exterior incrementa significativamente el riesgo de accesos no autorizados y exfiltración de datos.`
    if (lower.includes('postgres') || port === '5432')
      return `El servicio PostgreSQL está accesible en el puerto ${port || '5432'}. Los servicios de base de datos no deben estar expuestos directamente, ya que son objetivos frecuentes de ataques automatizados.`
    if (lower.includes('rdp') || port === '3389')
      return `El servicio RDP está expuesto en el puerto ${port || '3389'}. Este protocolo es frecuentemente objetivo de ataques de fuerza bruta y explotación de vulnerabilidades conocidas.`
    if (lower.includes('telnet') || port === '23')
      return `El servicio Telnet está activo en el puerto ${port || '23'}. Telnet transmite toda la información (incluyendo credenciales) en texto plano, lo que lo hace extremadamente inseguro.`
    if (lower.includes('dns') || port === '53')
      return `El servicio DNS está expuesto en el puerto ${port || '53'}. Un servidor DNS abierto puede ser utilizado para ataques de amplificación o envenenamiento de caché.`
    if (port)
      return `Se detectó el puerto ${port} abierto en el servidor. Los puertos expuestos innecesariamente incrementan la superficie de ataque del sistema y pueden permitir la enumeración de servicios.`
  }
  if (v.source === 'CODE_SCAN') {
    if (lower.includes('xss')) return 'Se detectó una posible vulnerabilidad de Cross-Site Scripting (XSS) en el código fuente. Un atacante podría inyectar scripts maliciosos que se ejecuten en el navegador de otros usuarios, permitiendo el robo de sesiones o datos sensibles.'
    if (lower.includes('sql')) return 'Se identificó un posible vector de inyección SQL en el código fuente. Un atacante podría manipular consultas a la base de datos para acceder, modificar o eliminar información sensible.'
    return 'Se identificó un patrón de código potencialmente inseguro durante el análisis estático del código fuente. Se recomienda revisar la lógica de seguridad asociada.'
  }
  if (v.source === 'DEPENDENCY_SCAN')
    return `Se identificó una dependencia con vulnerabilidades conocidas${v.cveId ? ` (${v.cveId})` : ''}. El uso de componentes con vulnerabilidades documentadas expone el sistema a ataques conocidos que pueden ser automatizados.`
  if (v.source === 'DOCKER_SCAN')
    return 'Se detectó una vulnerabilidad en la imagen Docker utilizada. Las imágenes con vulnerabilidades conocidas pueden comprometer la seguridad del contenedor, del host y de otros contenedores en el mismo entorno.'
  if (lower.includes('ssl') || lower.includes('tls') || lower.includes('certificate') || lower.includes('certificado'))
    return 'Se detectó una configuración insegura relacionada con el cifrado TLS/SSL. Esto puede permitir ataques de tipo Man-in-the-Middle (MITM) o exponer datos sensibles en tránsito.'
  if (lower.includes('header') || lower.includes('cors') || lower.includes('csp') || lower.includes('hsts'))
    return 'Se detectó la ausencia o configuración inadecuada de cabeceras de seguridad HTTP. Esto reduce las capas de protección del navegador contra ataques como XSS, clickjacking y MIME sniffing.'
  if (v.description && v.description.length > 0) return v.description
  return 'Vulnerabilidad detectada durante el proceso de análisis de seguridad. Se recomienda evaluar el riesgo y aplicar las medidas correctivas correspondientes.'
}

function getRiskMotivo(v: Vulnerability): string {
  const parts: string[] = []
  if (v.cveId) {
    parts.push(`Vulnerabilidad asociada a ${v.cveId}`)
    if (v.cvssScore != null) parts.push(`con puntuación CVSS de ${v.cvssScore.toFixed(1)}`)
  } else {
    parts.push('Vulnerabilidad de configuración detectada (no asociada a un CVE específico)')
  }
  if (v.exploitAvailable) parts.push('Existe exploit público conocido, lo que incrementa significativamente el riesgo')
  if (v.patchAvailable) parts.push('Parche disponible, se recomienda su aplicación inmediata')
  if (v.source === 'PORT_SCAN') parts.push('Identificada mediante escaneo de puertos')
  else if (v.source === 'CODE_SCAN') parts.push('Identificada mediante análisis estático de código')
  else if (v.source === 'DEPENDENCY_SCAN') parts.push('Identificada en las dependencias del proyecto')
  else if (v.source === 'DOCKER_SCAN') parts.push('Identificada en la imagen Docker')
  else if (v.source === 'SCAN') parts.push('Identificada mediante escaneo web automatizado')
  else if (v.source === 'MANUAL') parts.push('Registrada manualmente por el equipo de seguridad')
  else if (v.source === 'PENTEST') parts.push('Descubierta durante prueba de penetración')
  return parts.join('. ') + '.'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  // Connected module data
  const [siemEvents, setSiemEvents] = useState<any[]>([])
  const [threats, setThreats] = useState<any[]>([])
  const [scans, setScans] = useState<any[]>([])

  // ─── Fetch all data ─────────────────────────────────────────
  const fetchVulnerabilities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterSeverity) params.set('severity', filterSeverity)
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/vulnerabilities?${params.toString()}`)
      const data = await res.json()
      setVulnerabilities(data.vulnerabilities || [])
      setStats(data.stats || {})
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchConnected = async () => {
    try {
      const [evRes, thRes, scRes] = await Promise.all([
        fetch('/api/siem/events').then(r => r.json()).catch(() => []),
        fetch('/api/siem/threats').then(r => r.json()).catch(() => []),
        fetch('/api/scans').then(r => r.json()).catch(() => []),
      ])
      setSiemEvents(Array.isArray(evRes) ? evRes : [])
      setThreats(Array.isArray(thRes) ? thRes : [])
      setScans(Array.isArray(scRes) ? scRes : [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => { fetchVulnerabilities(); fetchConnected() }, [filterSeverity, filterStatus])

  const updateVulnerability = async (id: string, data: any) => {
    try {
      await fetch(`/api/vulnerabilities/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      fetchVulnerabilities()
      setSelectedVuln(null)
    } catch (e) { console.error(e) }
  }

  // ─── Computed ───────────────────────────────────────────────
  const filteredVulns = useMemo(() =>
    vulnerabilities.filter(v =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cveId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assetName?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [vulnerabilities, searchTerm])

  const risk = useMemo(() => calculateRiskLevel(vulnerabilities, stats), [vulnerabilities, stats])
  const riskCfg = RISK_CONFIG[risk.level]
  const RiskIcon = riskCfg.icon

  const openCount = (stats.byStatus?.OPEN || 0) + (stats.byStatus?.IN_PROGRESS || 0)
  const closedCount = (stats.byStatus?.REMEDIATED || 0) + (stats.byStatus?.RESOLVED || 0)

  // Source breakdown
  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    vulnerabilities.forEach(v => { map[v.source] = (map[v.source] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [vulnerabilities])

  // Priority chart data
  const priorityData = [
    { name: 'Críticas', value: stats.bySeverity?.CRITICAL || 0, fill: '#ef4444' },
    { name: 'Altas', value: stats.bySeverity?.HIGH || 0, fill: '#f97316' },
    { name: 'Medias', value: stats.bySeverity?.MEDIUM || 0, fill: '#eab308' },
    { name: 'Bajas', value: stats.bySeverity?.LOW || 0, fill: '#3b82f6' },
  ]

  // Remediation status data
  const remediationData = [
    { name: 'En progreso', value: stats.byStatus?.IN_PROGRESS || 0, fill: '#eab308' },
    { name: 'Abiertas', value: stats.byStatus?.OPEN || 0, fill: '#ef4444' },
    { name: 'Resueltas', value: (stats.byStatus?.REMEDIATED || 0) + (stats.byStatus?.RESOLVED || 0), fill: '#22c55e' },
    { name: 'Falso positivo', value: stats.byStatus?.FALSE_POSITIVE || 0, fill: '#6b7280' },
  ]

  // Trend data (last 6 months simulated from discoveredAt)
  const trendData = useMemo(() => {
    const months: Record<string, { month: string; nuevas: number; resueltas: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      months[key] = { month: key, nuevas: 0, resueltas: 0 }
    }
    vulnerabilities.forEach(v => {
      const d = new Date(v.discoveredAt)
      const key = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      if (months[key]) months[key].nuevas++
      if (v.remediatedAt) {
        const rd = new Date(v.remediatedAt)
        const rk = rd.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        if (months[rk]) months[rk].resueltas++
      }
    })
    return Object.values(months)
  }, [vulnerabilities])

  // SIEM correlation
  const relatedEvents = useMemo(() =>
    siemEvents.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').slice(0, 5)
  , [siemEvents])

  const activeIOCs = useMemo(() => threats.filter((t: any) => t.active).length, [threats])

  const recentScans = useMemo(() =>
    scans.filter((s: any) => s.status === 'COMPLETED').slice(0, 5)
  , [scans])

  // ─── Tabs ───────────────────────────────────────────────────
  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Panel General', icon: BarChart3 },
    { id: 'list', label: 'Vulnerabilidades', icon: ShieldAlert },
    { id: 'sources', label: 'Fuentes y Conexiones', icon: Activity },
    { id: 'remediation', label: 'Remediación', icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      {/* ════════════ HEADER ════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            Gestión de Vulnerabilidades
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Seguimiento, priorización y remediación de vulnerabilidades
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/scanner" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            <Radar className="h-4 w-4" />Ir al Scanner
          </Link>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
            <Plus className="h-4 w-4" />Agregar Manual
          </button>
          <button onClick={() => { fetchVulnerabilities(); fetchConnected() }} disabled={loading} className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ════════════ SEMÁFORO + RISK BANNER ════════════ */}
      <div className={`rounded-2xl border-2 ${riskCfg.border} shadow-lg overflow-hidden`}>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Semáforo */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center">
              <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-3 shadow-xl">
                <div className="space-y-2">
                  {riskCfg.semaphore.map((color, i) => (
                    <div key={i} className={`w-12 h-12 rounded-full ${color} transition-all duration-500 ${
                      !color.includes('gray') ? 'shadow-lg ring-2 ring-white/30 animate-pulse' : 'opacity-40'
                    }`} />
                  ))}
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full ${riskCfg.bgLight}`}>
                <RiskIcon className={`h-4 w-4 ${riskCfg.color}`} />
                <span className={`text-sm font-bold ${riskCfg.color}`}>Riesgo {riskCfg.label}</span>
              </div>
            </div>

            {/* Info principal */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nivel de Riesgo Actual: <span className={riskCfg.color}>{riskCfg.label}</span></h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {risk.activeCount} vulnerabilidad{risk.activeCount !== 1 ? 'es' : ''} activa{risk.activeCount !== 1 ? 's' : ''} · {risk.criticalLast30} crítica{risk.criticalLast30 !== 1 ? 's' : ''} · Últimos 30 días
              </p>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setActiveTab('list')} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Eye className="h-4 w-4" />Ver prioridades
                </button>
                <button onClick={() => setActiveTab('remediation')} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />Recomendaciones
                </button>
              </div>
            </div>

            {/* Quick stats in the banner */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Críticas" value={stats.bySeverity?.CRITICAL || 0} dotColor="bg-red-500" />
              <MiniStat label="Altas" value={stats.bySeverity?.HIGH || 0} dotColor="bg-orange-500" />
              <MiniStat label="Abiertas" value={openCount} dotColor="bg-yellow-500" />
              <MiniStat label="Cerradas" value={closedCount} dotColor="bg-green-500" />
            </div>
          </div>
        </div>

        {/* Connected modules strip */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Módulos conectados:</span>
            <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-blue-500" />SIEM: {relatedEvents.length} eventos recientes</span>
            <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-purple-500" />Amenazas: {activeIOCs} IOCs activos</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-cyan-500" />Escaneos: {recentScans.length} completados</span>
            <span className="flex items-center gap-1.5"><Radar className="h-3.5 w-3.5 text-indigo-500" />Fuentes: {sourceBreakdown.length} tipos</span>
          </div>
        </div>
      </div>

      {/* ════════════ TABS ════════════ */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          )
        })}
      </div>

      {/* ════════════ TAB: OVERVIEW ════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prioridad de Riesgos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />Prioridad de Riesgos
              </h3>
              <p className="text-xs text-gray-500 mb-4">Distribución por severidad de vulnerabilidades activas</p>
              {priorityData.every(d => d.value === 0) ? (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <div className="text-center"><ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-40" /><p className="text-sm">Sin vulnerabilidades</p></div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={priorityData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={2}>
                        {priorityData.filter(d => d.value > 0).map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {priorityData.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{d.name}</span>
                        </div>
                        <span className="text-sm font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Estado de Remediación */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />Estado de Remediación
              </h3>
              <p className="text-xs text-gray-500 mb-4">Progreso de resolución de vulnerabilidades</p>
              <div className="space-y-3">
                {remediationData.map(d => {
                  const total = Math.max(stats.total || 1, 1)
                  const pct = Math.round((d.value / total) * 100)
                  return (
                    <div key={d.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
                        </div>
                        <span className="font-semibold">{d.value} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: d.fill }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />Tendencia (6 meses)
            </h3>
            <p className="text-xs text-gray-500 mb-4">Nuevas vulnerabilidades vs resueltas por mes</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gNuevas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gResueltas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
                <YAxis fontSize={12} stroke="#6b7280" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend verticalAlign="top" height={30} />
                <Area type="monotone" dataKey="nuevas" stroke="#ef4444" fill="url(#gNuevas)" name="Nuevas" />
                <Area type="monotone" dataKey="resueltas" stroke="#22c55e" fill="url(#gResueltas)" name="Resueltas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Source breakdown mini cards */}
          {sourceBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Vulnerabilidades por fuente</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sourceBreakdown.map(([src, count]) => {
                  const info = SOURCE_MAP[src] || SOURCE_MAP.MANUAL
                  const SrcIcon = info.icon
                  return (
                    <div key={src} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <SrcIcon className={`h-5 w-5 ${info.color} mb-2`} />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-xs text-gray-500 mt-1">{info.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB: LIST ════════════ */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Buscar por título, CVE, activo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas las severidades</option>
                <option value="CRITICAL">Crítica</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Baja</option>
                <option value="INFO">Informativa</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Todos los estados</option>
                <option value="OPEN">Abierta</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="REMEDIATED">Remediada</option>
                <option value="ACCEPTED">Aceptada</option>
                <option value="FALSE_POSITIVE">Falso Positivo</option>
              </select>
              <span className="text-xs text-gray-500">{filteredVulns.length} resultado{filteredVulns.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Severidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vulnerabilidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fuente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Activo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CVSS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Cargando...</td></tr>
                  ) : filteredVulns.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center">
                      <Radar className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-medium mb-2">No hay vulnerabilidades</h3>
                      <p className="text-gray-500 text-sm mb-4">Ejecuta un escaneo para detectar vulnerabilidades automáticamente</p>
                      <Link href="/dashboard/scanner" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                        <Radar className="h-4 w-4" />Ir al Scanner
                      </Link>
                    </td></tr>
                  ) : filteredVulns.map(vuln => {
                    const sev = SEV[vuln.severity] || SEV.INFO
                    const st = STATUS_MAP[vuln.status] || STATUS_MAP.OPEN
                    const srcInfo = SOURCE_MAP[vuln.source] || SOURCE_MAP.MANUAL
                    const SrcIcon = srcInfo.icon
                    return (
                      <tr key={vuln.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}><div className={`w-2 h-2 rounded-full ${sev.dot}`} />{sev.label}</span></td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{vuln.title}</p>
                            {vuln.cveId && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{vuln.cveId}</p>}
                            <div className="flex gap-1.5 mt-1">
                              {vuln.exploitAvailable && <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded font-medium">⚡ Exploit</span>}
                              {vuln.patchAvailable && <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded font-medium">🔧 Parche</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-xs"><SrcIcon className={`h-3.5 w-3.5 ${srcInfo.color}`} />{srcInfo.label}</span></td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{vuln.assetName || '—'}</p>
                          {vuln.assetType && <p className="text-[10px] text-gray-500">{vuln.assetType}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {vuln.cvssScore != null ? (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                              vuln.cvssScore >= 9 ? 'bg-red-600' : vuln.cvssScore >= 7 ? 'bg-orange-500' : vuln.cvssScore >= 4 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>{vuln.cvssScore.toFixed(1)}</div>
                          ) : <span className="text-gray-400 text-sm">—</span>}
                        </td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>{st.emoji} {st.label}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(vuln.discoveredAt).toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedVuln(vuln)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB: SOURCES ════════════ */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Radar className="h-5 w-5 text-indigo-500" />Fuentes de Detección</h3>
              {sourceBreakdown.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Sin datos todavía</p>
              ) : (
                <div className="space-y-3">
                  {sourceBreakdown.map(([src, count]) => {
                    const info = SOURCE_MAP[src] || SOURCE_MAP.MANUAL
                    const SrcIcon = info.icon
                    const pct = Math.round((count / (stats.total || 1)) * 100)
                    return (
                      <div key={src} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2"><SrcIcon className={`h-4 w-4 ${info.color}`} />{info.label}</span>
                          <span className="font-semibold">{count} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* SIEM Connection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" />Eventos SIEM Relacionados</h3>
              {relatedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Sin eventos de alta severidad</p>
                  <Link href="/dashboard/siem" className="text-xs text-blue-500 hover:underline mt-2 inline-block">Ir al Panel SIEM →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedEvents.map((ev: any, i: number) => (
                    <div key={ev.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm">
                      <div className={`w-2.5 h-2.5 rounded-full ${ev.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ev.message}</p>
                        <p className="text-xs text-gray-500">{ev.source} · {new Date(ev.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ev.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{ev.severity}</span>
                    </div>
                  ))}
                  <Link href="/dashboard/siem" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-2">Ver todos los eventos <ArrowRight className="h-3 w-3" /></Link>
                </div>
              )}
            </div>
          </div>

          {/* Threat Intel & Recent Scans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-purple-500" />Inteligencia de Amenazas</h3>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-purple-600">{activeIOCs}</p>
                <p className="text-sm text-gray-500 mt-1">IOCs activos que pueden correlacionar con vulnerabilidades</p>
                <Link href="/dashboard/siem" className="text-xs text-purple-500 hover:underline mt-3 inline-flex items-center gap-1">Ver amenazas <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Globe className="h-5 w-5 text-cyan-500" />Últimos Escaneos Web</h3>
              {recentScans.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">Sin escaneos completados</p>
                  <Link href="/dashboard/scanner" className="text-xs text-cyan-500 hover:underline mt-2 inline-block">Ejecutar escaneo →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.targetUrl}</p>
                        <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('es-ES')}</p>
                      </div>
                      {s.score != null && (
                        <span className={`text-lg font-bold ${s.score >= 80 ? 'text-green-600' : s.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{s.score}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB: REMEDIATION ════════════ */}
      {activeTab === 'remediation' && (
        <div className="space-y-6">
          {/* Remediation priority list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold mb-1 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" />Prioridad de Remediación</h3>
            <p className="text-xs text-gray-500 mb-4">Vulnerabilidades abiertas ordenadas por severidad y disponibilidad de exploit</p>
            {(() => {
              const openVulns = vulnerabilities
                .filter(v => v.status === 'OPEN' || v.status === 'IN_PROGRESS')
                .sort((a, b) => {
                  const sa = (SEV[a.severity]?.weight || 0) + (a.exploitAvailable ? 5 : 0)
                  const sb = (SEV[b.severity]?.weight || 0) + (b.exploitAvailable ? 5 : 0)
                  return sb - sa
                })
              if (openVulns.length === 0) return (
                <div className="text-center py-12 text-gray-400">
                  <ShieldCheck className="h-16 w-16 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-lg">¡Todas las vulnerabilidades están resueltas!</p>
                  <p className="text-sm mt-1">Ejecuta un nuevo escaneo para verificar</p>
                </div>
              )
              return (
                <div className="space-y-3">
                  {openVulns.slice(0, 10).map((v, i) => {
                    const sev = SEV[v.severity] || SEV.INFO
                    const meta = getRemediationMeta(v)
                    return (
                      <div key={v.id} className={`p-4 rounded-xl border-l-4 ${sev.border} bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-semibold text-gray-500">#{i + 1}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sev.bg} ${sev.text}`}>{sev.label}</span>
                              {v.exploitAvailable && <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">⚡ Exploit disponible</span>}
                              {v.patchAvailable && <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">🔧 Parche disponible</span>}
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{v.title}</h4>
                            {v.cveId && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{v.cveId}</p>}
                            {v.remediation && (
                              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <p className="text-xs text-green-800 dark:text-green-300">💡 {v.remediation}</p>
                              </div>
                            )}
                            <div className="flex gap-4 mt-2 text-[11px] text-gray-500">
                              <span>⚙️ Dificultad: {meta.difficulty}</span>
                              <span>⏱ Tiempo: {meta.time}</span>
                              <span>📉 Impacto: {meta.impact}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => updateVulnerability(v.id, { status: 'IN_PROGRESS' })}
                              className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                              title="Marcar en progreso">🔄 Iniciar</button>
                            <button onClick={() => updateVulnerability(v.id, { status: 'REMEDIATED' })}
                              className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                              title="Marcar resuelta">✅ Resolver</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* ════════════ DETAIL MODAL ════════════ */}
      {selectedVuln && <VulnDetailModal vuln={selectedVuln} onClose={() => setSelectedVuln(null)} onUpdate={updateVulnerability} />}

      {/* ════════════ ADD MODAL ════════════ */}
      {showAddModal && <AddVulnModal onClose={() => setShowAddModal(false)} onSave={async (data) => {
        try {
          const res = await fetch('/api/vulnerabilities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          if (res.ok) { setShowAddModal(false); fetchVulnerabilities() }
          else alert('Error al crear la vulnerabilidad')
        } catch { alert('Error al crear la vulnerabilidad') }
      }} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function MiniStat({ label, value, dotColor }: { label: string; value: number; dotColor: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
      <div className={`w-3 h-3 rounded-full ${dotColor} mx-auto mb-1`} />
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  )
}

function VulnDetailModal({ vuln, onClose, onUpdate }: { vuln: Vulnerability; onClose: () => void; onUpdate: (id: string, data: any) => void }) {
  const sev = SEV[vuln.severity] || SEV.INFO
  const st = STATUS_MAP[vuln.status] || STATUS_MAP.OPEN
  const srcInfo = SOURCE_MAP[vuln.source] || SOURCE_MAP.MANUAL
  const SrcIcon = srcInfo.icon
  const impacts = getImpactForVuln(vuln)
  const compliance = getComplianceForVuln(vuln)
  const meta = getRemediationMeta(vuln)
  const enrichedDesc = getEnrichedDescription(vuln)
  const motivo = getRiskMotivo(vuln)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* ── Header ── */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-7 py-5 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sev.bg} ${sev.text}`}>{sev.label}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>{st.emoji} {st.label}</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  <SrcIcon className={`h-3.5 w-3.5 ${srcInfo.color}`} />{srcInfo.label}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{vuln.title}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                {vuln.assetName && <span className="flex items-center gap-1">📍 {vuln.assetName}{vuln.assetType ? ` (${vuln.assetType})` : ''}</span>}
                {vuln.cveId && (
                  <a href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    {vuln.cveId} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Contenido tipo reporte ── */}
        <div className="px-7 py-6 space-y-6">

          {/* ▸ Descripción */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Descripción</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{enrichedDesc}</p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* ▸ Impacto potencial */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Impacto potencial</h4>
            <ul className="space-y-1">
              {impacts.map((text, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0 select-none">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* ▸ Evaluación de riesgo */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Evaluación de riesgo</h4>
            <div className="space-y-1.5 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Severidad:</span>{' '}
                <span className={`font-semibold ${sev.text}`}>{sev.label}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">CVSS:</span>{' '}
                <span className="font-semibold">{vuln.cvssScore != null ? `${vuln.cvssScore.toFixed(1)} / 10.0` : 'No aplica'}</span>
              </p>
              {vuln.exploitAvailable && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Exploit:</span>{' '}
                  <span className="font-semibold text-red-600 dark:text-red-400">⚡ Disponible públicamente</span>
                </p>
              )}
              {vuln.patchAvailable && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Parche:</span>{' '}
                  <span className="font-semibold text-green-600 dark:text-green-400">🔧 Disponible</span>
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 pt-1">
                <span className="text-gray-500 dark:text-gray-400">Motivo:</span>{' '}
                {motivo}
              </p>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* ▸ Remediación recomendada */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Remediación recomendada</h4>
            {vuln.remediation ? (
              <>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{vuln.remediation}</p>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Detalles:</p>
                  <ul className="space-y-0.5">
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      <span>Dificultad: <span className="font-medium">{meta.difficulty}</span></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      <span>Impacto en el sistema: <span className="font-medium">{meta.impact}</span></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      <span>Reversible: <span className="font-medium">{meta.reversible}</span></span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      <span>Tiempo estimado: <span className="font-medium">{meta.time}</span></span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sin información de remediación disponible. Se recomienda evaluar con el equipo de seguridad.</p>
            )}
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* ▸ Cumplimiento y referencias */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Cumplimiento y referencias</h4>
            <ul className="space-y-1">
              {compliance.map((ref, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0 select-none">•</span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* ▸ Historial */}
          <section>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Historial</h4>
            <ul className="space-y-1">
              <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-400 select-none">•</span>
                <span>{fmtDate(vuln.discoveredAt)} — Vulnerabilidad detectada {vuln.source !== 'MANUAL' ? 'automáticamente' : 'manualmente'}</span>
              </li>
              {vuln.status !== 'OPEN' && (
                <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 select-none">•</span>
                  <span>{fmtDate(vuln.discoveredAt)} — Estado cambiado a &quot;{st.label}&quot;</span>
                </li>
              )}
              {vuln.remediatedAt && (
                <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 select-none">•</span>
                  <span>{fmtDate(vuln.remediatedAt)} — Vulnerabilidad remediada</span>
                </li>
              )}
            </ul>
          </section>

          {/* ▸ Acciones */}
          <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => onUpdate(vuln.id, { status: 'REMEDIATED' })} disabled={vuln.status === 'REMEDIATED' || vuln.status === 'RESOLVED'}
              className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">✅ Remediar</button>
            <button onClick={() => onUpdate(vuln.id, { status: 'IN_PROGRESS' })} disabled={vuln.status === 'IN_PROGRESS'}
              className="flex-1 min-w-[120px] px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">🔄 En progreso</button>
            <button onClick={() => onUpdate(vuln.id, { status: 'ACCEPTED' })} disabled={vuln.status === 'ACCEPTED'}
              className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">Aceptar riesgo</button>
            <button onClick={() => onUpdate(vuln.id, { status: 'FALSE_POSITIVE' })} disabled={vuln.status === 'FALSE_POSITIVE'}
              className="flex-1 min-w-[120px] px-4 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">Falso positivo</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddVulnModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({ title: '', description: '', severity: 'MEDIUM', cveId: '', cvssScore: '', assetName: '', assetType: 'SERVER', exploitAvailable: false, patchAvailable: false, remediation: '' })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) { alert('Título y descripción requeridos'); return }
    setSaving(true)
    await onSave({ ...form, cvssScore: form.cvssScore ? parseFloat(form.cvssScore) : undefined, source: 'MANUAL', status: 'OPEN' })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="h-6 w-6" />Agregar Vulnerabilidad Manual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Nombre de la vulnerabilidad"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Descripción detallada..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severidad</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="CRITICAL">Crítica</option><option value="HIGH">Alta</option><option value="MEDIUM">Media</option><option value="LOW">Baja</option><option value="INFO">Informativa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVE ID</label>
              <input type="text" value={form.cveId} onChange={e => setForm({ ...form, cveId: e.target.value })} placeholder="CVE-2024-XXXXX"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVSS Score</label>
              <input type="number" step="0.1" min="0" max="10" value={form.cvssScore} onChange={e => setForm({ ...form, cvssScore: e.target.value })} placeholder="0.0 - 10.0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Activo</label>
              <select value={form.assetType} onChange={e => setForm({ ...form, assetType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="SERVER">Servidor</option><option value="DATABASE">Base de Datos</option><option value="WEB">Aplicación Web</option><option value="NETWORK">Red</option><option value="ENDPOINT">Endpoint</option><option value="CLOUD">Cloud</option><option value="API">API</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Activo</label>
            <input type="text" value={form.assetName} onChange={e => setForm({ ...form, assetName: e.target.value })} placeholder="Nombre del activo afectado"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remediación</label>
            <textarea value={form.remediation} onChange={e => setForm({ ...form, remediation: e.target.value })} rows={2} placeholder="Pasos para remediar..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.exploitAvailable} onChange={e => setForm({ ...form, exploitAvailable: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-indigo-600" /><span className="text-sm">Exploit disponible</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.patchAvailable} onChange={e => setForm({ ...form, patchAvailable: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-indigo-600" /><span className="text-sm">Parche disponible</span></label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : <><Plus className="h-4 w-4" />Crear Vulnerabilidad</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
