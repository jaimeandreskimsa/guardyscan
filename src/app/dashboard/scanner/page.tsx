'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Shield, Package, Network, Code, Database, Search, Play,
  AlertTriangle, CheckCircle, Clock, RefreshCw, FileCode, Globe,
  Server, Lock, Zap, FileText, BarChart3, Eye, Download,
  Loader2, Map, Container, ExternalLink, Radar, Activity,
  TrendingUp, ShieldCheck, HelpCircle
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────
type ScanType = 'dependencies' | 'ports' | 'code' | 'nvd' | 'docker'
type ActiveTab = 'web' | 'technical' | 'history'

interface ScanResult {
  success: boolean
  stats?: any
  summary?: any
  vulnerabilities?: any[]
  issues?: any[]
  results?: any[]
  error?: string
}

// ─── Constants ───────────────────────────────────────────────────
const TECHNICAL_SCANS = [
  { id: 'ports' as ScanType, name: 'Puertos y Servicios', emoji: '🌐', description: 'Detecta servicios expuestos en tu servidor', time: '2–5 min', category: 'Red' },
  { id: 'dependencies' as ScanType, name: 'Dependencias', emoji: '📦', description: 'Analiza librerías con vulnerabilidades conocidas', time: '1–3 min', category: 'Código' },
  { id: 'code' as ScanType, name: 'Código Fuente (SAST)', emoji: '💻', description: 'Revisa tu código fuente buscando fallos de seguridad', time: '1–7 min', category: 'Código' },
  { id: 'nvd' as ScanType, name: 'CVE / NVD', emoji: '🛡️', description: 'Busca vulnerabilidades conocidas en la base de datos NIST', time: '1–2 min', category: 'Inteligencia' },
  { id: 'docker' as ScanType, name: 'Docker', emoji: '🐳', description: 'Analiza Dockerfiles e imágenes de contenedores', time: '3–10 min', category: 'Infraestructura' },
]

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  INFO: 'bg-gray-100 text-gray-800 border-gray-300',
}

// ─── Risk Level Helper ───────────────────────────────────────────
function getRiskLevel(score: number | null | undefined) {
  if (score == null) return { label: 'Sin datos', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', description: 'Evaluación pendiente de completar' }
  if (score >= 85) return { label: 'Riesgo Bajo', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700', description: 'Su infraestructura presenta un nivel de protección óptimo. Se recomienda mantener las buenas prácticas actuales.' }
  if (score >= 70) return { label: 'Riesgo Moderado', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700', description: 'Se identificaron áreas de mejora. Se recomienda priorizar las correcciones sugeridas a corto plazo.' }
  if (score >= 50) return { label: 'Riesgo Alto', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700', description: 'Existen vulnerabilidades que requieren atención prioritaria para proteger la continuidad del negocio.' }
  return { label: 'Riesgo Crítico', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', description: 'Se requiere acción inmediata. La organización está expuesta a amenazas que pueden afectar operaciones críticas.' }
}

// ─── Main Component ──────────────────────────────────────────────
export default function ScannerPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<ActiveTab>('web')

  // ── Web scan state ──
  const [targetUrl, setTargetUrl] = useState('')
  const [webLoading, setWebLoading] = useState(false)
  const [webMessage, setWebMessage] = useState('')

  // ── History state ──
  const [scans, setScans] = useState<any[]>([])
  const [selectedScan, setSelectedScan] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  // ── Technical scan state ──
  const [selectedTechnical, setSelectedTechnical] = useState<ScanType | null>(null)
  const [techScanning, setTechScanning] = useState(false)
  const [techResult, setTechResult] = useState<ScanResult | null>(null)

  // Technical form states
  const [depContent, setDepContent] = useState('')
  const [depType, setDepType] = useState('npm')
  const [portHost, setPortHost] = useState('')
  const [portScanType, setPortScanType] = useState('quick')
  const [codeContent, setCodeContent] = useState('')
  const [codeFilename, setCodeFilename] = useState('code.js')
  const [nvdType, setNvdType] = useState('keyword')
  const [nvdQuery, setNvdQuery] = useState('')
  const [dockerType, setDockerType] = useState('dockerfile')
  const [dockerContent, setDockerContent] = useState('')
  const [dockerImage, setDockerImage] = useState('')

  // ── Load scans ──
  const loadScans = async () => {
    try {
      const res = await fetch('/api/scans')
      const data = await res.json()
      setScans(Array.isArray(data) ? data : [])
    } catch { setScans([]) }
  }

  // ── Auto-fill URL from ?url= query param or user profile website ──
  // Also read ?tab= to open directly on history after wizard scan
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab | null
    if (tabParam && ['web', 'technical', 'history'].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    const urlParam = searchParams.get('url')
    if (urlParam) {
      setTargetUrl(urlParam)
      return
    }
    // Fall back to the website saved in the user profile
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.website) setTargetUrl(data.website)
      })
      .catch(() => {})
  }, [searchParams])

  useEffect(() => { loadScans() }, [])

  // Auto-refresh while processing
  useEffect(() => {
    if (!scans.some(s => s.status === 'PROCESSING' || s.status === 'PENDING')) return
    const interval = setInterval(loadScans, 3000)
    return () => clearInterval(interval)
  }, [scans])

  // ── Web scan handler ──
  const handleWebScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setWebLoading(true)
    setWebMessage('')
    try {
      let url = targetUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url

      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url, scanType: 'FULL' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el escaneo')

      setWebMessage('¡Evaluación iniciada! Puede consultar el progreso en la pestaña Historial.')
      setTargetUrl('')
      loadScans()
      setTimeout(() => setActiveTab('history'), 1500)
    } catch (err: any) {
      setWebMessage(err.message)
    } finally {
      setWebLoading(false)
    }
  }

  // ── Technical scan handler ──
  const runTechnicalScan = async () => {
    if (!selectedTechnical) return
    setTechScanning(true)
    setTechResult(null)
    try {
      let endpoint = ''
      let body: any = {}
      switch (selectedTechnical) {
        case 'dependencies':
          endpoint = '/api/scan/dependencies'
          body = { content: depContent, type: depType }
          break
        case 'ports':
          endpoint = '/api/scan/ports'
          body = { host: portHost, scanType: portScanType }
          break
        case 'code':
          endpoint = '/api/scan/code'
          body = { code: codeContent, filename: codeFilename }
          break
        case 'nvd':
          endpoint = '/api/scan/nvd'
          body = nvdType === 'cve' ? { type: 'cve', cveId: nvdQuery }
               : nvdType === 'keyword' ? { type: 'keyword', keyword: nvdQuery }
               : { type: 'recent', days: 7 }
          break
        case 'docker':
          endpoint = '/api/scan/docker'
          body = dockerType === 'dockerfile'
            ? { type: 'dockerfile', dockerfile: dockerContent }
            : { type: 'image', imageName: dockerImage }
          break
      }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setTechResult(await res.json())
    } catch {
      setTechResult({ success: false, error: 'Error ejecutando escaneo' })
    } finally {
      setTechScanning(false)
    }
  }

  // ── PDF Download ──
  const handleDownloadPdf = async (scanId: string) => {
    setDownloadingPdf(scanId)
    try {
      const res = await fetch(`/api/pdf/download/${scanId}`)
      if (!res.ok) {
        if (res.status === 403) { alert('Para descargar el informe profesional en PDF, primero debe adquirirlo.'); return }
        const err = await res.json(); throw new Error(err.error || 'Error al descargar')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `GuardyScan-Informe-${scanId}.pdf`
      document.body.appendChild(a); a.click()
      window.URL.revokeObjectURL(url); document.body.removeChild(a)
    } catch (err: any) {
      alert(err.message || 'Error al descargar el informe')
    } finally { setDownloadingPdf(null) }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      FAILED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || colors.PENDING
  }

  // ─── TABS ──────────────────────────────────────────────────────
  const tabs: { id: ActiveTab; label: string; icon: any; description: string }[] = [
    { id: 'web', label: 'Evaluación Web', icon: Globe, description: 'Análisis integral de un sitio web' },
    { id: 'technical', label: 'Scanner Técnico', icon: Radar, description: 'Evaluaciones especializadas por área' },
    { id: 'history', label: 'Historial', icon: Clock, description: 'Registro de evaluaciones' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Centro de Evaluación de Seguridad
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Evalúe sitios web, código fuente, dependencias, puertos y más desde un solo panel de control
        </p>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const count = tab.id === 'history' ? scans.length : undefined
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {tab.label}
                    {count !== undefined && count > 0 && (
                      <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{count}</span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</p>
                </div>
              </div>
              {isActive && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 rounded-full" />}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB 1: Evaluación Web Completa                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'web' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Evaluación Integral de Sitio Web
              </CardTitle>
              <CardDescription>
                Ingrese una URL para obtener un diagnóstico completo: certificados, DNS, cabeceras, tecnologías, rendimiento, vulnerabilidades, firewall y cumplimiento normativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWebScan} className="space-y-4">
                {webMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    webMessage.includes('iniciada') || webMessage.includes('exitosamente')
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>{webMessage}</div>
                )}

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="ejemplo.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" disabled={webLoading} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    {webLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Evaluando...</>
                    ) : (
                      <><Search className="h-4 w-4 mr-2" />Iniciar Evaluación</>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                    📋 Áreas de evaluación incluidas:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800 dark:text-blue-400">
                    <div className="flex items-center gap-1.5"><Server className="h-3 w-3" /> Infraestructura</div>
                    <div className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Certificados SSL/TLS</div>
                    <div className="flex items-center gap-1.5"><Network className="h-3 w-3" /> Resolución DNS</div>
                    <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Cabeceras HTTP</div>
                    <div className="flex items-center gap-1.5"><Code className="h-3 w-3" /> Stack Tecnológico</div>
                    <div className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> Rendimiento</div>
                    <div className="flex items-center gap-1.5"><Database className="h-3 w-3" /> Servicios de Red</div>
                    <div className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> Vulnerabilidades</div>
                    <div className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Cookies y sesiones</div>
                    <div className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Firewall / WAF</div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Cumplimiento</div>
                    <div className="flex items-center gap-1.5"><BarChart3 className="h-3 w-3" /> Índice de seguridad</div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick stats from recent evaluations */}
          {scans.filter(s => s.status === 'COMPLETED').length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Últimas evaluaciones completadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scans.filter(s => s.status === 'COMPLETED').slice(0, 3).map((scan) => {
                  const risk = getRiskLevel(scan.score)
                  return (
                    <button
                      key={scan.id}
                      onClick={() => { setSelectedScan(scan); setShowDetails(true) }}
                      className={`p-4 rounded-xl border-l-4 border bg-white dark:bg-gray-800 hover:shadow-lg transition-all text-left ${risk.border}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{scan.targetUrl}</span>
                        {scan.score != null && (
                          <span className={`text-xl font-black ${scan.score >= 85 ? 'text-emerald-600' : scan.score >= 70 ? 'text-amber-600' : scan.score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                            {scan.score}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{new Date(scan.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${risk.color}`}>{risk.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB 2: Scanner Técnico                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Scan type selector */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecciona un tipo de evaluación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TECHNICAL_SCANS.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => { setSelectedTechnical(scan.id); setTechResult(null) }}
                  className={`p-5 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                    selectedTechnical === scan.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{scan.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{scan.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scan.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {scan.time}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{scan.category}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration + Results */}
          {selectedTechnical && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Config panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Configuración: {TECHNICAL_SCANS.find(s => s.id === selectedTechnical)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TechnicalScanForm
                    scanType={selectedTechnical}
                    depContent={depContent} setDepContent={setDepContent}
                    depType={depType} setDepType={setDepType}
                    portHost={portHost} setPortHost={setPortHost}
                    portScanType={portScanType} setPortScanType={setPortScanType}
                    codeContent={codeContent} setCodeContent={setCodeContent}
                    codeFilename={codeFilename} setCodeFilename={setCodeFilename}
                    nvdType={nvdType} setNvdType={setNvdType}
                    nvdQuery={nvdQuery} setNvdQuery={setNvdQuery}
                    dockerType={dockerType} setDockerType={setDockerType}
                    dockerContent={dockerContent} setDockerContent={setDockerContent}
                    dockerImage={dockerImage} setDockerImage={setDockerImage}
                  />
                  <button
                    onClick={runTechnicalScan}
                    disabled={techScanning}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {techScanning
                      ? <><RefreshCw className="h-5 w-5 animate-spin" />Evaluando...</>
                      : <><Play className="h-5 w-5" />Ejecutar Evaluación</>}
                  </button>
                </CardContent>
              </Card>

              {/* Results panel */}
              <div>
                {techScanning && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <RefreshCw className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Analizando...</h3>
                    <p className="text-gray-500 text-sm">Esto puede tomar unos segundos</p>
                  </div>
                )}
                {!techScanning && techResult && <TechnicalResultsPanel result={techResult} />}
                {!techScanning && !techResult && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center h-full flex flex-col items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-semibold text-gray-600 dark:text-gray-400">Configure y ejecute la evaluación</h3>
                    <p className="text-gray-500 text-sm mt-1">Los resultados aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB 3: Historial de Evaluaciones                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Historial de Evaluaciones
                </CardTitle>
                <CardDescription>Registro completo de las evaluaciones de seguridad realizadas a su infraestructura</CardDescription>
              </div>
              {scans.length > 0 && (
                <span className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  {scans.length} evaluación{scans.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {scans.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No hay evaluaciones registradas</p>
                <p className="text-sm mt-2">Inicie su primera evaluación de seguridad desde la pestaña &quot;Evaluación Web&quot;</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('web')}>
                  <Globe className="h-4 w-4 mr-2" />Iniciar Evaluación
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scans.map((scan) => {
                  const risk = getRiskLevel(scan.score)
                  return (
                    <div key={scan.id} className={`border-l-4 ${scan.status === 'COMPLETED' ? risk.border : 'border-gray-200 dark:border-gray-700'} rounded-xl border bg-white dark:bg-gray-800/50 overflow-hidden hover:shadow-lg transition-all`}>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{scan.targetUrl}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 ${getStatusBadge(scan.status)}`}>
                                {scan.status === 'PENDING' && '⏳ En cola'}
                                {(scan.status === 'PROCESSING' || scan.status === 'RUNNING') && (
                                  <><Loader2 className="h-3 w-3 animate-spin" /> Evaluando ({scan.progress || 0}%)</>
                                )}
                                {scan.status === 'COMPLETED' && <><CheckCircle className="h-3 w-3" /> Completada</>}
                                {scan.status === 'FAILED' && '✗ Error en evaluación'}
                              </span>
                              {scan.status === 'COMPLETED' && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${risk.bg} ${risk.color}`}>
                                  {risk.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(scan.createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                              </span>
                            </div>

                            {(scan.status === 'PROCESSING' || scan.status === 'RUNNING') && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                                  <span className="font-medium">Progreso de la evaluación</span>
                                  <span className="font-bold text-blue-600">{scan.progress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${scan.progress || 0}%` }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            {scan.score != null && (
                              <div className="text-center">
                                <div className={`text-4xl font-black ${scan.score >= 85 ? 'text-emerald-600' : scan.score >= 70 ? 'text-amber-600' : scan.score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                                  {scan.score}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Índice global</div>
                              </div>
                            )}
                            {scan.status === 'COMPLETED' && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => { setSelectedScan(scan); setShowDetails(true) }}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm"
                                >
                                  <Eye className="h-4 w-4 mr-1.5" /> Ver Informe
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(scan.id)}
                                  disabled={downloadingPdf === scan.id}
                                  className="border-gray-300 dark:border-gray-600"
                                >
                                  {downloadingPdf === scan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
                                  Descargar PDF
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {scan.status === 'COMPLETED' && (
                          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              <MetricCard
                                icon={<Lock className="h-4 w-4" />}
                                label="Certificado Digital"
                                value={scan.sslInfo?.valid ? 'Válido' : 'Inválido'}
                                status={scan.sslInfo?.valid ? 'success' : 'danger'}
                              />
                              <MetricCard
                                icon={<Shield className="h-4 w-4" />}
                                label="Cabeceras de Seguridad"
                                value={`${['strict-transport-security','x-content-type-options','x-frame-options','content-security-policy','x-xss-protection','referrer-policy'].filter(h => scan.securityHeaders?.headers?.[h]).length} de 6`}
                                status="info"
                              />
                              <MetricCard
                                icon={<AlertTriangle className="h-4 w-4" />}
                                label="Riesgos Detectados"
                                value={Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities.length : 0}
                                status={(scan.vulnerabilities?.length || 0) > 0 ? 'danger' : 'success'}
                              />
                              <MetricCard
                                icon={<Zap className="h-4 w-4" />}
                                label="Tiempo de Respuesta"
                                value={scan.performance?.loadTime || 'N/A'}
                                status="info"
                              />
                              <MetricCard
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Cumplimiento"
                                value={scan.compliance?.iso27001?.score ? `${scan.compliance.iso27001.score}%` : 'N/A'}
                                status="info"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Detail Modal ─── */}
      {showDetails && selectedScan && (
        <ScanDetailsModal scan={selectedScan} onClose={() => setShowDetails(false)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Sub-components: Technical Scanner
// ═══════════════════════════════════════════════════════════════════

function TechnicalScanForm({ scanType, ...props }: { scanType: ScanType } & any) {
  switch (scanType) {
    case 'dependencies':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de proyecto</label>
            <select value={props.depType} onChange={(e: any) => props.setDepType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              <option value="npm">Node.js (package.json)</option>
              <option value="pypi">Python (requirements.txt)</option>
              <option value="go">Go (go.mod)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenido del archivo</label>
            <textarea value={props.depContent} onChange={(e: any) => props.setDepContent(e.target.value)}
              placeholder={props.depType === 'npm' ? '{\n  "dependencies": {\n    "express": "^4.18.0"\n  }\n}' : props.depType === 'pypi' ? 'flask==2.0.0\nrequests==2.28.0' : 'require example.com/pkg v1.2.3'}
              rows={8} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm" />
          </div>
        </div>
      )
    case 'ports':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Host (IP o dominio)</label>
            <input type="text" value={props.portHost} onChange={(e: any) => props.setPortHost(e.target.value)} placeholder="ejemplo.com o 192.168.1.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de escaneo</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'quick', name: 'Rápido', desc: '24 puertos' }, { id: 'common', name: 'Común', desc: '35 puertos' }, { id: 'full', name: 'Completo', desc: '1-1024' }].map(opt => (
                <button key={opt.id} onClick={() => props.setPortScanType(opt.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${props.portScanType === opt.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                  <p className="font-medium text-sm">{opt.name}</p><p className="text-xs text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    case 'code':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del archivo</label>
            <input type="text" value={props.codeFilename} onChange={(e: any) => props.setCodeFilename(e.target.value)} placeholder="app.js, server.py, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código fuente</label>
            <textarea value={props.codeContent} onChange={(e: any) => props.setCodeContent(e.target.value)} placeholder="Pegue su código aquí..."
              rows={10} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm" />
          </div>
        </div>
      )
    case 'nvd':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de búsqueda</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'cve', name: 'CVE ID', icon: Search }, { id: 'keyword', name: 'Palabra clave', icon: Globe }, { id: 'recent', name: 'Recientes', icon: Clock }].map(opt => (
                <button key={opt.id} onClick={() => props.setNvdType(opt.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${props.nvdType === opt.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                  <opt.icon className="h-4 w-4" /><span className="text-sm">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
          {props.nvdType !== 'recent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{props.nvdType === 'cve' ? 'CVE ID' : 'Palabra clave'}</label>
              <input type="text" value={props.nvdQuery} onChange={(e: any) => props.setNvdQuery(e.target.value)} placeholder={props.nvdType === 'cve' ? 'CVE-2024-1234' : 'log4j, apache, nginx...'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
            </div>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">Se buscarán las vulnerabilidades publicadas en los últimos 7 días</p>
            </div>
          )}
        </div>
      )
    case 'docker':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de análisis</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => props.setDockerType('dockerfile')}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${props.dockerType === 'dockerfile' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                <FileCode className="h-4 w-4" /><span className="text-sm">Dockerfile</span>
              </button>
              <button onClick={() => props.setDockerType('image')}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${props.dockerType === 'image' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                <Container className="h-4 w-4" /><span className="text-sm">Imagen</span>
              </button>
            </div>
          </div>
          {props.dockerType === 'dockerfile' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenido del Dockerfile</label>
              <textarea value={props.dockerContent} onChange={(e: any) => props.setDockerContent(e.target.value)}
                placeholder={'FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["npm", "start"]'}
                rows={8} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la imagen</label>
              <input type="text" value={props.dockerImage} onChange={(e: any) => props.setDockerImage(e.target.value)} placeholder="node:18, python:3.11, nginx:latest"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
            </div>
          )}
        </div>
      )
    default:
      return null
  }
}

function TechnicalResultsPanel({ result }: { result: ScanResult }) {
  if (!result.success) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Error en la evaluación</h3>
            <p className="text-red-600 dark:text-red-300">{result.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const vulns = result.vulnerabilities || result.issues || result.results || []
  const stats = result.stats || result.summary || {}

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.critical || stats.CRITICAL || 0}</p>
          <p className="text-xs text-red-700">Críticas</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.high || stats.HIGH || 0}</p>
          <p className="text-xs text-orange-700">Altas</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.medium || stats.MEDIUM || 0}</p>
          <p className="text-xs text-yellow-700">Medias</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.low || stats.LOW || 0}</p>
          <p className="text-xs text-blue-700">Bajas</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.total || vulns.length}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
      </div>

      {vulns.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Hallazgos ({vulns.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {vulns.map((vuln: any, i: number) => (
              <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${SEVERITY_COLORS[vuln.severity as string] || SEVERITY_COLORS.INFO}`}>{vuln.severity}</span>
                      {vuln.cveId && <a href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">{vuln.cveId}</a>}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{vuln.title || vuln.id}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{vuln.description}</p>
                    {vuln.recommendation && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">💡 {vuln.recommendation}</p>}
                  </div>
                  {vuln.cvssScore && (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                      vuln.cvssScore >= 9 ? 'bg-red-600' : vuln.cvssScore >= 7 ? 'bg-orange-500' : vuln.cvssScore >= 4 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>{vuln.cvssScore.toFixed(1)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Sin hallazgos de riesgo</h3>
          <p className="text-emerald-600 dark:text-emerald-300 text-sm">La evaluación se completó sin detectar vulnerabilidades</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Scan Details Modal — Informe Ejecutivo
// ═══════════════════════════════════════════════════════════════════

function ScanDetailsModal({ scan, onClose }: { scan: any; onClose: () => void }) {
  const vulnCount = (scan.vulnerabilities || []).length
  const sslValid = scan.sslInfo?.valid
  const activeHeaders = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy', 'x-xss-protection', 'referrer-policy']
    .filter(h => scan.securityHeaders?.headers?.[h]).length

  // Calcular score real basado en los datos del escaneo
  const computedScore = (() => {
    if (scan.score != null) return Math.round(scan.score)
    let s = 100
    // SSL: -25 si inválido
    if (!scan.sslInfo?.valid) s -= 25
    // Cabeceras: -3 por cada cabecera faltante (máx -18)
    s -= (6 - activeHeaders) * 3
    // Vulnerabilidades
    const vulns = scan.vulnerabilities || []
    const criticals = vulns.filter((v: any) => v.severity === 'CRITICAL').length
    const highs = vulns.filter((v: any) => v.severity === 'HIGH').length
    const mediums = vulns.filter((v: any) => v.severity === 'MEDIUM').length
    s -= criticals * 15
    s -= highs * 8
    s -= mediums * 3
    // Firewall: -5 si sin WAF, -5 si sin DDoS
    if (!scan.firewall?.waf) s -= 5
    if (!scan.firewall?.ddos) s -= 5
    // Puertos abiertos: -2 por cada puerto extra sobre 3
    const openPorts = (scan.openPorts || []).length
    if (openPorts > 3) s -= (openPorts - 3) * 2
    return Math.max(0, Math.min(100, Math.round(s)))
  })()

  const risk = getRiskLevel(computedScore)
  const scoreColor = computedScore >= 85 ? '#10b981' : computedScore >= 70 ? '#f59e0b' : computedScore >= 50 ? '#f97316' : '#ef4444'
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (computedScore / 100) * circumference

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ── Header Ejecutivo ── */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Informe Ejecutivo de Seguridad</h2>
                  <p className="text-blue-200 text-sm font-medium">{scan.targetUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(scan.createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  risk.label === 'Riesgo Bajo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  risk.label === 'Riesgo Moderado' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  risk.label === 'Riesgo Alto' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {risk.label}
                </span>
              </div>
            </div>

            {/* Score circular */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: scoreColor }}>{computedScore}</span>
                  <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Índice Global</span>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10 rounded-xl h-10 w-10 p-0">
                ✕
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Resumen Ejecutivo ── */}
          <div className={`rounded-xl p-5 border-2 ${risk.border} ${risk.bg}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                risk.label === 'Riesgo Bajo' ? 'bg-emerald-100 dark:bg-emerald-800/30' :
                risk.label === 'Riesgo Moderado' ? 'bg-amber-100 dark:bg-amber-800/30' :
                risk.label === 'Riesgo Alto' ? 'bg-orange-100 dark:bg-orange-800/30' :
                'bg-red-100 dark:bg-red-800/30'
              }`}>
                <TrendingUp className={`h-6 w-6 ${risk.color}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${risk.color}`}>Resumen Ejecutivo — {risk.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{risk.description}</p>
                <div className="flex items-center gap-6 mt-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg">
                    <Lock className="h-4 w-4 text-gray-400" />
                    Certificado: <strong className={sslValid ? 'text-emerald-600' : 'text-red-600'}>{sslValid ? 'Válido' : 'Inválido'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    Riesgos: <strong className={vulnCount > 0 ? 'text-red-600' : 'text-emerald-600'}>{vulnCount}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Cabeceras: <strong>{activeHeaders} de 6</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Grid de Secciones ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Infraestructura del Servidor */}
            <SectionCard
              icon={<Server className="h-5 w-5 text-blue-600" />}
              title="Infraestructura del Servidor"
              subtitle="Información del hosting y conectividad"
            >
              <DetailRow label="Dirección IP" value={scan.serverInfo?.ip || scan.dnsRecords?.a?.[0] || 'N/A'} hint="La dirección IP es el identificador numérico único del servidor en Internet. Permite localizar dónde está alojado el sitio web y detectar posibles exposiciones de infraestructura." />
              <DetailRow label="Proveedor de hosting" value={scan.serverInfo?.provider || 'N/A'} hint="El proveedor de hosting es la empresa que aloja el servidor donde funciona el sitio web. Conocerlo permite evaluar la calidad del servicio, soporte y garantías de seguridad disponibles." />
              <DetailRow label="Ubicación del servidor" value={scan.serverInfo?.location || 'N/A'} hint="La ubicación geográfica del servidor afecta la velocidad de acceso para los usuarios y el cumplimiento de regulaciones de protección de datos según el país." />
              <DetailRow label="Tiempo de respuesta" value={scan.serverInfo?.responseTime || 'N/A'} hint="Es el tiempo que tarda el servidor en responder a una solicitud. Un tiempo alto indica problemas de rendimiento que afectan la experiencia del usuario y pueden reducir conversiones." />
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {!scan.serverInfo?.ip ? 'Sin información del servidor — no es posible evaluar la exposición de infraestructura' :
                   'La ubicación y proveedor del servidor afectan la latencia, cumplimiento de regulaciones de datos y la resiliencia ante desastres'}
                </p>
              </div>
            </SectionCard>

            {/* Certificación Digital */}
            <SectionCard
              icon={<Lock className="h-5 w-5 text-emerald-600" />}
              title="Certificación Digital (SSL/TLS)"
              subtitle="Estado del certificado de seguridad"
              badge={scan.sslInfo?.valid
                ? { text: 'Vigente', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
                : { text: 'No válido', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
              }
            >
              <DetailRow label="Estado" value={scan.sslInfo?.valid ? '✓ Certificado válido' : '✗ Certificado inválido'} valueClass={scan.sslInfo?.valid ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'} hint="El certificado SSL/TLS cifra la comunicación entre el navegador del usuario y el servidor. Si es inválido, los datos como contraseñas y tarjetas de crédito pueden ser interceptados." />
              <DetailRow label="Autoridad emisora" value={scan.sslInfo?.issuer || 'N/A'} hint="Es la entidad de confianza que emitió el certificado digital (ej: Let's Encrypt, DigiCert). Una autoridad reconocida garantiza que la identidad del sitio ha sido verificada." />
              <DetailRow label="Fecha de expiración" value={scan.sslInfo?.validTo ? new Date(scan.sslInfo.validTo).toLocaleDateString('es-ES', { dateStyle: 'long' }) : 'N/A'} hint="Fecha en la que el certificado deja de ser válido. Después de esta fecha, los navegadores mostrarán advertencias de seguridad y los usuarios no podrán acceder de forma segura." />
              <DetailRow label="Días hasta renovación" value={scan.sslInfo?.daysRemaining != null ? `${scan.sslInfo.daysRemaining} días` : 'N/A'} valueClass={scan.sslInfo?.daysRemaining != null && scan.sslInfo.daysRemaining < 30 ? 'text-orange-600 font-semibold' : ''} hint="Indica cuántos días quedan antes de que el certificado expire. Se recomienda renovar con al menos 30 días de anticipación para evitar interrupciones del servicio." />
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {!scan.sslInfo?.valid
                    ? 'Certificado inválido — los datos de clientes y transacciones están expuestos. Riesgo de pérdida de confianza y sanciones regulatorias'
                    : scan.sslInfo?.daysRemaining != null && scan.sslInfo.daysRemaining < 30
                    ? 'Certificado próximo a expirar — riesgo de interrupción del servicio y pérdida de transacciones si no se renueva a tiempo'
                    : 'Certificado vigente — las comunicaciones con clientes están cifradas y protegidas correctamente'}
                </p>
              </div>
            </SectionCard>

            {/* Resolución de Nombres */}
            <SectionCard
              icon={<Network className="h-5 w-5 text-violet-600" />}
              title="Resolución de Nombres (DNS)"
              subtitle="Registros de dominio y enrutamiento"
            >
              <DetailRow label="Registro A (IPv4)" value={scan.dnsRecords?.a?.join(', ') || 'N/A'} hint="El registro A vincula el nombre de dominio con la dirección IP del servidor. Es el registro fundamental que permite que los usuarios encuentren el sitio al escribir la URL." />
              <DetailRow label="Registros MX (Correo)" value={scan.dnsRecords?.mx?.map((m: any) => m.exchange || m).join(', ') || 'N/A'} hint="Los registros MX definen qué servidores gestionan el correo electrónico del dominio. Sin ellos, la empresa no puede recibir emails y es vulnerable a suplantación de identidad." />
              <DetailRow 
                label="Registros TXT (Verificación)" 
                value={scan.dnsRecords?.txt?.slice(0, 2).map((t: any) => Array.isArray(t) ? t.join(' ') : t).join(', ') || 'N/A'}
                hint="Los registros TXT contienen información de verificación del dominio, como configuraciones de SPF (anti-spam) y DKIM (firma de correos). Son clave para evitar que suplanten el correo de la empresa."
              />
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {!scan.dnsRecords?.mx || scan.dnsRecords.mx.length === 0
                    ? 'Sin registros MX — el correo corporativo puede ser vulnerable a suplantación de identidad (phishing)'
                    : 'Configuración DNS activa — asegura la disponibilidad del dominio y protege la reputación del correo electrónico'}
                </p>
              </div>
            </SectionCard>

            {/* Cabeceras de Seguridad HTTP */}
            <SectionCard
              icon={<Shield className="h-5 w-5 text-indigo-600" />}
              title="Cabeceras de Seguridad HTTP"
              subtitle="Políticas de protección del navegador"
              badge={{ text: `${activeHeaders}/6`, color: activeHeaders >= 5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : activeHeaders >= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }}
            >
              {[
                { key: 'strict-transport-security', name: 'Strict-Transport-Security', desc: 'Fuerza conexión HTTPS', hint: 'Obliga al navegador a usar siempre HTTPS, evitando que datos sensibles viajen sin cifrar por la red' },
                { key: 'x-content-type-options', name: 'X-Content-Type-Options', desc: 'Previene MIME sniffing', hint: 'Impide que el navegador interprete archivos de forma diferente a su tipo declarado, previniendo ataques de inyección de código' },
                { key: 'x-frame-options', name: 'X-Frame-Options', desc: 'Protege contra clickjacking', hint: 'Evita que el sitio sea insertado dentro de un iframe en otro sitio malicioso, protegiendo a los usuarios de hacer clics engañosos' },
                { key: 'content-security-policy', name: 'Content-Security-Policy', desc: 'Control de recursos', hint: 'Define qué recursos (scripts, imágenes, estilos) puede cargar la página. Es la defensa más potente contra ataques XSS e inyección de contenido' },
                { key: 'x-xss-protection', name: 'X-XSS-Protection', desc: 'Filtro anti-XSS', hint: 'Activa el filtro del navegador que detecta y bloquea ataques de Cross-Site Scripting (XSS), donde un atacante inyecta código malicioso' },
                { key: 'referrer-policy', name: 'Referrer-Policy', desc: 'Controla referencia', hint: 'Controla qué información de la URL se envía cuando el usuario navega a otro sitio. Protege la privacidad y evita filtrar datos internos' },
              ].map(h => (
                <HeaderRow key={h.key} name={h.name} desc={h.desc} hint={h.hint} isActive={!!scan.securityHeaders?.headers?.[h.key]} />
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activeHeaders < 3
                    ? 'Cabeceras insuficientes — la aplicación es vulnerable a ataques XSS, clickjacking e inyección de contenido que pueden comprometer datos de usuarios'
                    : activeHeaders < 5
                    ? 'Protección parcial — algunas cabeceras faltan, lo que deja vectores de ataque abiertos que podrían afectar la integridad de la plataforma'
                    : 'Cabeceras correctamente configuradas — la aplicación cuenta con protección robusta contra ataques comunes del navegador'}
                </p>
              </div>
            </SectionCard>

            {/* Stack Tecnológico */}
            <SectionCard
              icon={<Code className="h-5 w-5 text-cyan-600" />}
              title="Stack Tecnológico Detectado"
              subtitle="Tecnologías identificadas en la aplicación"
            >
              {(() => {
                const TECH_CRITICAL_PATTERNS = ['jQuery 1.', 'jQuery 2.', 'PHP 5', 'PHP 4', 'Drupal 7', 'Drupal 6', 'WordPress 4.', 'WordPress 3.', 'SSL 2', 'TLS 1.0', 'Flash', 'Struts', 'log4j', 'ShellShock', 'OpenSSL 1.0.0'];
                const TECH_WARN_PATTERNS = ['jQuery 3.', 'Bootstrap 3', 'Bootstrap 2', 'PHP 7.0', 'PHP 7.1', 'PHP 7.2', 'Angular 1', 'Vue 2', 'MySQL 5.5', 'MySQL 5.6', 'Apache 2.2', 'Nginx 1.1', 'Node.js 14', 'Node.js 12', 'Node.js 10', 'WordPress 5.', 'Python 2'];
                const techList = scan.technologies?.length > 0
                  ? scan.technologies.map((t: any) => typeof t === 'string' ? { name: t, version: '-' } : t)
                  : [];
                const classifyTech = (name: string, version: string) => {
                  const full = `${name} ${version}`;
                  if (TECH_CRITICAL_PATTERNS.some(p => full.includes(p) || name.includes(p))) return 'critical';
                  if (TECH_WARN_PATTERNS.some(p => full.includes(p) || name.includes(p))) return 'warn';
                  return 'ok';
                };
                const okTechs = techList.filter((t: any) => classifyTech(t.name, t.version) === 'ok');
                const warnTechs = techList.filter((t: any) => classifyTech(t.name, t.version) === 'warn');
                const critTechs = techList.filter((t: any) => classifyTech(t.name, t.version) === 'critical');
                return (
                  <div className="space-y-1">
                    {techList.length === 0 && <p className="text-sm text-gray-400 py-2">No se detectaron tecnologías</p>}
                    {techList.map((tech: any, i: number) => {
                      const level = classifyTech(tech.name, tech.version);
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ level === 'critical' ? 'bg-red-500' : level === 'warn' ? 'bg-amber-400' : 'bg-emerald-400' }`} />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{tech.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">{tech.version}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : level === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }`}>
                              {level === 'critical' ? 'CRÍTICO' : level === 'warn' ? 'ATENCIÓN' : 'OK'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {techList.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-emerald-600">{okTechs.length}</div>
                          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Actualizadas</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Versiones vigentes, sin vulnerabilidades conocidas</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-amber-600">{warnTechs.length}</div>
                          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Requieren Revisión</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Versiones próximas a fin de soporte</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-red-600">{critTechs.length}</div>
                          <div className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase">Vulnerables</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Versiones con exploits públicos conocidos</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(scan.technologies || []).length === 0
                    ? 'No se detectaron tecnologías expuestas. Buena práctica de ocultamiento de la infraestructura.'
                    : 'Las tecnologías marcadas como Críticas o Atención representan vectores de ataque activos. Un atacante puede identificar estas versiones en minutos y ejecutar exploits automatizados para comprometer datos o interrumpir el servicio.'}
                </p>
              </div>
            </SectionCard>

            {/* Rendimiento Web */}
            <SectionCard
              icon={<Zap className="h-5 w-5 text-amber-500" />}
              title="Rendimiento y Velocidad"
              subtitle="Métricas de rendimiento de la aplicación web"
            >
              <DetailRow label="Tiempo de carga" value={scan.performance?.loadTime || 'N/A'} hint="Es el tiempo total que tarda la página en cargarse completamente. Google recomienda menos de 3 segundos; cada segundo adicional aumenta el abandono de usuarios." />
              <DetailRow label="Tamaño de la página" value={scan.performance?.size || 'N/A'} hint="El peso total de todos los archivos que se descargan al abrir la página (HTML, CSS, imágenes, scripts). Páginas más livianas cargan más rápido, especialmente en móviles." />
              <DetailRow label="Peticiones HTTP" value={scan.performance?.requests || 'N/A'} hint="La cantidad de solicitudes que el navegador hace al servidor para cargar la página. Más peticiones significa más tiempo de carga. Se recomienda optimizar y reducir su número." />
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El rendimiento afecta directamente la experiencia del usuario y las tasas de conversión. Cada segundo adicional de carga puede reducir las conversiones hasta un 7%
                </p>
              </div>
            </SectionCard>

            {/* Cookies y Privacidad */}
            <SectionCard
              icon={<Shield className="h-5 w-5 text-pink-600" />}
              title="Cookies y Privacidad"
              subtitle="Gestión de sesiones y protección de datos del usuario"
            >
              {(() => {
                const rawCookies = scan.cookies;
                // Scanner stores cookies as aggregate object {total, secure, httpOnly, sameSite}
                // or as an array of individual cookie objects — handle both formats
                const cookieList: any[] = Array.isArray(rawCookies) ? rawCookies : [];
                const cookieStats = !Array.isArray(rawCookies) && rawCookies && typeof rawCookies === 'object' ? rawCookies : null;
                const totalCount = cookieStats ? (cookieStats.total || 0) : cookieList.length;

                if (cookieStats) {
                  // Aggregate format from scanner: {total, secure, httpOnly, sameSite}
                  const secureCount = cookieStats.secure || 0;
                  const httpOnlyCount = cookieStats.httpOnly || 0;
                  const sameSite = cookieStats.sameSite || 'None';
                  const secureLevel = secureCount === totalCount && httpOnlyCount === totalCount && sameSite !== 'None' ? 'ok' : secureCount === 0 && httpOnlyCount === 0 ? 'critical' : 'warn';
                  return (
                    <div className="space-y-2">
                      {totalCount === 0 ? (
                        <div className="flex items-center gap-2 py-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">No se detectaron cookies en la respuesta</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${httpOnlyCount === totalCount ? 'bg-emerald-400' : httpOnlyCount > 0 ? 'bg-amber-400' : 'bg-red-500'}`} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">HttpOnly</span>
                              </div>
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{httpOnlyCount}/{totalCount}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${secureCount === totalCount ? 'bg-emerald-400' : secureCount > 0 ? 'bg-amber-400' : 'bg-red-500'}`} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Secure</span>
                              </div>
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{secureCount}/{totalCount}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-gray-600 dark:text-gray-400">SameSite</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sameSite === 'None' || sameSite === 'No disponible' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>{sameSite}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-2.5 text-center">
                              <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{totalCount}</div>
                              <div className="text-[10px] font-semibold text-gray-500 uppercase">Total</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-2.5 text-center">
                              <div className="text-lg font-bold text-emerald-600">{secureCount}</div>
                              <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Seguras</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">Atributo Secure</div>
                            </div>
                            <div className={`${httpOnlyCount < totalCount ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10'} rounded-lg p-2.5 text-center`}>
                              <div className={`text-lg font-bold ${httpOnlyCount < totalCount ? 'text-amber-600' : 'text-emerald-600'}`}>{httpOnlyCount}</div>
                              <div className={`text-[10px] font-semibold ${httpOnlyCount < totalCount ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'} uppercase`}>HttpOnly</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">Protegidas de JS</div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-end">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${secureLevel === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : secureLevel === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                              {secureLevel === 'critical' ? 'COOKIES SIN PROTECCIÓN' : secureLevel === 'warn' ? 'PROTECCIÓN PARCIAL' : 'CORRECTAMENTE CONFIGURADAS'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                // Array format (individual cookie objects)
                const classifyCookie = (c: any) => {
                  const hasHttpOnly = c.httpOnly === true;
                  const hasSecure = c.secure === true;
                  const hasSameSite = !!c.sameSite && c.sameSite.toLowerCase() !== 'none';
                  const score = (hasHttpOnly ? 1 : 0) + (hasSecure ? 1 : 0) + (hasSameSite ? 1 : 0);
                  if (score === 3) return 'ok';
                  if (score >= 1) return 'warn';
                  return 'critical';
                };
                const okCookies = cookieList.filter(c => classifyCookie(c) === 'ok');
                const warnCookies = cookieList.filter(c => classifyCookie(c) === 'warn');
                const critCookies = cookieList.filter(c => classifyCookie(c) === 'critical');
                return (
                  <div className="space-y-1">
                    {cookieList.length === 0 && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">No se detectaron cookies expuestas</span>
                      </div>
                    )}
                    {cookieList.map((c: any, i: number) => {
                      const level = classifyCookie(c);
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ level === 'critical' ? 'bg-red-500' : level === 'warn' ? 'bg-amber-400' : 'bg-emerald-400' }`} />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{c.name || 'cookie'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {c.httpOnly && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">HttpOnly</span>}
                            {c.secure && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">Secure</span>}
                            {c.sameSite && <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded font-mono">SameSite={c.sameSite}</span>}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 ${ level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : level === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }`}>
                              {level === 'critical' ? 'CRÍTICO' : level === 'warn' ? 'ATENCIÓN' : 'OK'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {cookieList.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-emerald-600">{okCookies.length}</div>
                          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Seguras</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">HttpOnly + Secure + SameSite</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-amber-600">{warnCookies.length}</div>
                          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Mejorar</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Faltan algunos atributos de seguridad</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-red-600">{critCookies.length}</div>
                          <div className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase">Vulnerables</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Sin protección — robables por scripts</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(() => {
                    const rawC = scan.cookies;
                    if (!rawC) return 'No se detectaron cookies expuestas en el análisis externo';
                    if (!Array.isArray(rawC) && typeof rawC === 'object') {
                      const total = rawC.total || 0;
                      const httpOnly = rawC.httpOnly || 0;
                      const secure = rawC.secure || 0;
                      if (total === 0) return 'No se detectaron cookies en la respuesta del servidor';
                      if (httpOnly < total || secure < total) return 'Cookies sin protección completa detectadas — un atacante puede robar sesiones de usuarios con un script malicioso (XSS), obteniendo acceso completo a sus cuentas sin necesidad de contraseña';
                      return 'Cookies correctamente protegidas — las sesiones de usuario están resguardadas contra robo y suplantación de identidad';
                    }
                    const arr: any[] = rawC;
                    if (arr.length === 0) return 'No se detectaron cookies expuestas en el análisis externo';
                    if (arr.some((c: any) => !c.httpOnly && !c.secure)) return 'Cookies sin protección detectadas — un atacante puede robar sesiones de usuarios con un script malicioso (XSS), obteniendo acceso completo a sus cuentas sin necesidad de contraseña';
                    return 'Cookies correctamente protegidas — las sesiones de usuario están resguardadas contra robo y suplantación de identidad';
                  })()}
                </p>
              </div>
            </SectionCard>

            {/* Archivos de Configuración */}
            <SectionCard
              icon={<FileText className="h-5 w-5 text-violet-600" />}
              title="Archivos de Configuración Expuestos"
              subtitle="Archivos sensibles accesibles públicamente"
            >
              {(() => {
                const rawFiles = scan.configFiles || scan.exposedFiles;
                // Scanner stores configFiles as {robots_txt: bool, sitemap_xml: bool, ...}
                // or as an array of strings/objects — handle both formats
                const FILE_KEY_MAP: Record<string, string> = {
                  robots_txt: 'robots.txt',
                  sitemap_xml: 'sitemap.xml',
                  security_txt: 'security.txt',
                  _wellKnownsecurity_txt: '.well-known/security.txt',
                  wellKnown_security_txt: '.well-known/security.txt',
                };
                // Normalize to array of {name, found} objects
                let configFiles: { name: string; found?: boolean }[] = [];
                if (Array.isArray(rawFiles)) {
                  configFiles = rawFiles.map((f: any) => ({
                    name: typeof f === 'string' ? f : (f.name || f.path || 'archivo'),
                    found: true,
                  }));
                } else if (rawFiles && typeof rawFiles === 'object') {
                  // Object format from scanner: {robots_txt: bool, ...}
                  configFiles = Object.entries(rawFiles as Record<string, any>)
                    .map(([key, val]) => ({
                      name: FILE_KEY_MAP[key] || key.replace(/_/g, '.'),
                      found: val === true,
                    }));
                }
                const HIGH_RISK_FILES = ['.env', '.env.production', 'config.php', 'wp-config.php', '.git/config', 'database.yml', 'settings.py', 'application.properties', 'credentials', 'secret', 'private_key', 'id_rsa'];
                const MED_RISK_FILES = ['.env.example', '.env.sample', 'README.md', 'composer.json', 'package.json', 'Dockerfile', 'docker-compose.yml', '.htaccess', 'robots.txt', 'sitemap.xml', 'crossdomain.xml'];
                const classifyFile = (name: string) => {
                  if (HIGH_RISK_FILES.some(f => name.toLowerCase().includes(f))) return 'critical';
                  if (MED_RISK_FILES.some(f => name.toLowerCase().includes(f.replace('.', '.')))) return 'warn';
                  return 'ok';
                };
                const critFiles = configFiles.filter(f => classifyFile(f.name) === 'critical');
                const warnFiles = configFiles.filter(f => classifyFile(f.name) === 'warn');
                return (
                  <div className="space-y-1">
                    {configFiles.length === 0 && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">No se detectaron archivos de configuración expuestos</span>
                      </div>
                    )}
                    {configFiles.map((f, i) => {
                      const level = classifyFile(f.name);
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ level === 'critical' ? 'bg-red-500' : level === 'warn' ? 'bg-amber-400' : 'bg-emerald-400' }`} />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{f.name}</span>
                            {f.found !== undefined && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${f.found ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-400'}`}>
                                {f.found ? 'Accesible' : 'No encontrado'}
                              </span>
                            )}
                          </div>
                          {f.found !== false && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : level === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }`}>
                              {level === 'critical' ? 'CRÍTICO' : level === 'warn' ? 'ATENCIÓN' : 'OK'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {configFiles.filter(f => f.found !== false).length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-red-600">{critFiles.filter(f => f.found !== false).length}</div>
                          <div className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase">Críticos</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">.env / config / credenciales — remover inmediatamente</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-amber-600">{warnFiles.filter(f => f.found !== false).length}</div>
                          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Revisar</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Archivos informativos que revelan estructura</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(() => {
                    const rawF = scan.configFiles || scan.exposedFiles;
                    if (!rawF) return 'No se detectaron archivos sensibles accesibles públicamente — infraestructura correctamente protegida';
                    if (!Array.isArray(rawF) && typeof rawF === 'object') {
                      // Check if any sensitive files were found
                      const hasSensitive = Object.entries(rawF as Record<string, any>).some(([, v]) => v === true);
                      return hasSensitive
                        ? 'Archivos de configuración accesibles detectados — un atacante puede obtener credenciales de base de datos, claves API o secretos que permiten acceso total al sistema sin necesidad de ningún ataque sofisticado'
                        : 'No se detectaron archivos sensibles accesibles públicamente — infraestructura correctamente protegida';
                    }
                    const arr: any[] = rawF;
                    return arr.length === 0
                      ? 'No se detectaron archivos sensibles accesibles públicamente — infraestructura correctamente protegida'
                      : 'Archivos de configuración expuestos — un atacante puede obtener credenciales de base de datos, claves API o secretos que permiten acceso total al sistema sin necesidad de ningún ataque sofisticado';
                  })()}
                </p>
              </div>
            </SectionCard>

            {/* Servicios de Red */}
            <SectionCard
              icon={<Database className="h-5 w-5 text-orange-600" />}
              title="Servicios de Red Expuestos"
              subtitle="Puertos abiertos y servicios accesibles"
            >
              {(() => {
                const PORTS_EXPECTED = [80, 443, 25, 587, 465, 993, 995, 53];
                const PORTS_SENSITIVE = [22, 3306, 5432, 6379, 27017, 1433, 5984, 9200, 2181, 11211];
                const PORTS_CRITICAL = [21, 23, 3389, 445, 135, 139, 1080, 4444, 8080, 8443, 9000, 2049, 111];
                const classifyPort = (port: number | string) => {
                  const n = typeof port === 'string' ? parseInt(port, 10) : port;
                  if (PORTS_CRITICAL.includes(n)) return 'critical';
                  if (PORTS_SENSITIVE.includes(n)) return 'sensitive';
                  if (PORTS_EXPECTED.includes(n)) return 'ok';
                  return 'ok';
                };
                const portLabels: Record<number, string> = {
                  80: 'HTTP (web)', 443: 'HTTPS (web segura)', 25: 'SMTP (correo)', 587: 'SMTP (correo cifrado)',
                  465: 'SMTPS (correo)', 993: 'IMAPS (correo)', 995: 'POP3S (correo)', 53: 'DNS',
                  22: 'SSH (acceso remoto)', 3306: 'MySQL (base de datos)', 5432: 'PostgreSQL (base de datos)',
                  6379: 'Redis (caché)', 27017: 'MongoDB (base de datos)', 1433: 'SQL Server', 9200: 'Elasticsearch',
                  21: 'FTP (transferencia insegura)', 23: 'Telnet (protocolo inseguro)', 3389: 'RDP (escritorio remoto)',
                  445: 'SMB (compartición archivos)', 8080: 'HTTP alternativo (admin?)', 8443: 'HTTPS alternativo',
                };
                const ports = scan.openPorts?.length > 0 ? scan.openPorts : [];
                const critPorts = ports.filter((p: any) => classifyPort(p.port) === 'critical');
                const sensPorts = ports.filter((p: any) => classifyPort(p.port) === 'sensitive');
                const okPorts = ports.filter((p: any) => classifyPort(p.port) === 'ok');
                return (
                  <div className="space-y-2">
                    {ports.length === 0 && <p className="text-sm text-gray-400 py-2">Sin puertos detectados</p>}
                    {ports.map((p: any, i: number) => {
                      const level = classifyPort(p.port);
                      const portN = typeof p.port === 'string' ? parseInt(p.port, 10) : p.port;
                      const label = portLabels[portN] || p.service || 'Servicio desconocido';
                      return (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${ level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : level === 'sensitive' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' }`}>{p.port}</span>
                            <div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                              {level === 'critical' && <span className="ml-2 text-[10px] font-bold text-red-600 dark:text-red-400">RIESGO ALTO</span>}
                              {level === 'sensitive' && <span className="ml-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">RESTRINGIR ACCESO</span>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : level === 'sensitive' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }`}>
                            {level === 'critical' ? 'CRÍTICO' : level === 'sensitive' ? 'SENSIBLE' : 'ESPERADO'}
                          </span>
                        </div>
                      );
                    })}
                    {ports.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-emerald-600">{okPorts.length}</div>
                          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Esperados</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">HTTP/HTTPS y servicios estándar</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-amber-600">{sensPorts.length}</div>
                          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Sensibles</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">BD, SSH — acceso solo desde red interna</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-red-600">{critPorts.length}</div>
                          <div className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase">Críticos</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Telnet/FTP/RDP — deben cerrarse de inmediato</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(scan.openPorts || []).some((p: any) => [21,23,3389,445].includes(parseInt(p.port,10)))
                    ? 'Puertos de alto riesgo detectados — protocolos inseguros o acceso remoto expuesto públicamente representan una vía directa de entrada para atacantes sin necesidad de credenciales'
                    : (scan.openPorts || []).some((p: any) => [3306,5432,6379,27017,22].includes(parseInt(p.port,10)))
                    ? 'Puertos sensibles expuestos — bases de datos o acceso SSH accesibles desde internet aumentan el riesgo de exfiltración de datos o acceso no autorizado'
                    : 'Exposición de puertos controlada — solo servicios estándar visibles, superficie de ataque minimizada'}
                </p>
              </div>
            </SectionCard>

            {/* Protección Perimetral */}
            <SectionCard
              icon={<Shield className="h-5 w-5 text-rose-600" />}
              title="Protección Perimetral"
              subtitle="Firewall de aplicaciones web y mitigación de ataques"
            >
              <DetailRow label="Web Application Firewall (WAF)" value={scan.firewall?.waf || 'No detectado'} valueClass={scan.firewall?.waf && scan.firewall.waf !== 'No detectado' ? 'text-emerald-600 font-semibold' : 'text-gray-500'} hint="Un WAF es un escudo que filtra y bloquea tráfico malicioso antes de que llegue a la aplicación. Protege contra ataques como inyección SQL, XSS y otros intentos de hackeo." />
              <DetailRow label="Protección Anti-DDoS" value={scan.firewall?.ddos ? '✓ Activa' : '✗ No detectada'} valueClass={scan.firewall?.ddos ? 'text-emerald-600 font-semibold' : 'text-red-500'} hint="Protección contra ataques de Denegación de Servicio Distribuido, donde miles de solicitudes falsas intentan saturar el servidor para dejarlo fuera de línea e interrumpir el negocio." />
              <DetailRow label="Limitación de peticiones (Rate Limiting)" value={scan.firewall?.rateLimit ? '✓ Activo' : '✗ No detectado'} valueClass={scan.firewall?.rateLimit ? 'text-emerald-600 font-semibold' : 'text-red-500'} hint="Limita la cantidad de solicitudes que un usuario puede hacer en un período de tiempo. Previene ataques de fuerza bruta contra contraseñas y abuso de APIs." />
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Impacto al Negocio</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {!scan.firewall?.waf && !scan.firewall?.ddos
                    ? 'Sin protección perimetral — la aplicación está expuesta a ataques DDoS, inyección SQL y otros ataques que pueden causar caída total del servicio'
                    : !scan.firewall?.ddos
                    ? 'Sin protección Anti-DDoS — un ataque de denegación de servicio puede interrumpir las operaciones del negocio'
                    : 'Protección perimetral activa — el servicio cuenta con capas de defensa que protegen la continuidad operativa'}
                </p>
              </div>
            </SectionCard>
          </div>

          {/* ── Vulnerabilidades — ancho completo ── */}
          <SectionCard
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            title="Análisis de Riesgos y Vulnerabilidades"
            subtitle="Hallazgos de seguridad identificados durante la evaluación"
          >
            {(scan.vulnerabilities || []).length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">Sin riesgos identificados</h4>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">La evaluación no detectó vulnerabilidades en su infraestructura</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scan.vulnerabilities.map((v: any, i: number) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-start gap-3">
                      <div className={`w-1.5 rounded-full self-stretch flex-shrink-0 ${
                        v.severity === 'CRITICAL' ? 'bg-red-500' :
                        v.severity === 'HIGH' ? 'bg-orange-500' :
                        v.severity === 'MEDIUM' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                            SEVERITY_COLORS[v.severity as string] || SEVERITY_COLORS.INFO
                          }`}>
                            {v.severity === 'CRITICAL' ? 'Crítico' :
                             v.severity === 'HIGH' ? 'Alto' :
                             v.severity === 'MEDIUM' ? 'Medio' :
                             v.severity === 'LOW' ? 'Bajo' : v.severity}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{v.title}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">{v.description}</p>
                        {v.recommendation && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                            <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span><strong>Recomendación:</strong> {v.recommendation}</span>
                          </div>
                        )}
                      </div>
                      {v.cvssScore && (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-lg ${
                          v.cvssScore >= 9 ? 'bg-red-600' : v.cvssScore >= 7 ? 'bg-orange-500' : v.cvssScore >= 4 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}>{v.cvssScore.toFixed(1)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Impacto al Negocio — ancho completo ── */}
          <SectionCard
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            title="Impacto al Negocio"
            subtitle="Evaluación del impacto potencial de los hallazgos en la operación empresarial"
          >
            {(() => {
              const criticalCount = (scan.vulnerabilities || []).filter((v: any) => v.severity === 'CRITICAL').length;
              const highCount = (scan.vulnerabilities || []).filter((v: any) => v.severity === 'HIGH').length;
              const mediumCount = (scan.vulnerabilities || []).filter((v: any) => v.severity === 'MEDIUM').length;
              const totalVulns = (scan.vulnerabilities || []).length;
              const sslOk = scan.sslInfo?.valid;
              const headersCount = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy', 'x-xss-protection', 'referrer-policy']
                .filter(h => scan.securityHeaders?.headers?.[h]).length;

              const impactLevel = criticalCount > 0 ? 'Crítico' : highCount > 0 ? 'Alto' : mediumCount > 0 ? 'Moderado' : 'Bajo';
              const impactColor = criticalCount > 0 ? 'text-red-600' : highCount > 0 ? 'text-orange-600' : mediumCount > 0 ? 'text-amber-600' : 'text-emerald-600';
              const impactBg = criticalCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : highCount > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : mediumCount > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';

              return (
                <div className="space-y-5">
                  {/* Nivel de impacto general */}
                  <div className={`rounded-xl p-5 border ${impactBg}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nivel de Impacto General</h4>
                        <p className={`text-3xl font-black mt-1 ${impactColor}`}>{impactLevel}</p>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${impactBg}`}>
                        <AlertTriangle className={`h-8 w-8 ${impactColor}`} />
                      </div>
                    </div>
                  </div>

                  {/* Categorías de impacto */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confidencialidad</h5>
                      </div>
                      <p className={`text-lg font-black ${criticalCount > 0 || !sslOk ? 'text-red-600' : highCount > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {criticalCount > 0 || !sslOk ? 'Alto riesgo' : highCount > 0 ? 'Riesgo moderado' : 'Controlado'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {!sslOk ? 'Certificado SSL inválido expone datos en tránsito' : criticalCount > 0 ? 'Vulnerabilidades críticas pueden exponer datos sensibles' : 'Los datos están adecuadamente protegidos'}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Integridad</h5>
                      </div>
                      <p className={`text-lg font-black ${headersCount < 3 ? 'text-red-600' : headersCount < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {headersCount < 3 ? 'Vulnerable' : headersCount < 5 ? 'Parcialmente protegido' : 'Protegido'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {headersCount}/6 cabeceras de seguridad activas para proteger la integridad de la información
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Disponibilidad</h5>
                      </div>
                      <p className={`text-lg font-black ${scan.firewall?.ddos ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {scan.firewall?.ddos ? 'Protegido' : 'Expuesto'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {scan.firewall?.ddos ? 'Protección Anti-DDoS activa, servicio resistente a ataques' : 'Sin protección Anti-DDoS, riesgo de interrupción del servicio'}
                      </p>
                    </div>
                  </div>

                  {/* Resumen de riesgo financiero estimado */}
                  <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Resumen de Riesgo Operacional</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Vulnerabilidades que requieren acción inmediata</span>
                        <span className={`text-sm font-bold ${criticalCount + highCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{criticalCount + highCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Riesgo de fuga de datos</span>
                        <span className={`text-sm font-bold ${!sslOk || criticalCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{!sslOk || criticalCount > 0 ? 'Alto' : 'Bajo'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Riesgo de interrupción de servicio</span>
                        <span className={`text-sm font-bold ${!scan.firewall?.ddos ? 'text-orange-600' : 'text-emerald-600'}`}>{!scan.firewall?.ddos ? 'Moderado' : 'Bajo'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Exposición de infraestructura</span>
                        <span className={`text-sm font-bold ${(scan.openPorts || []).length > 3 ? 'text-orange-600' : 'text-emerald-600'}`}>{(scan.openPorts || []).length > 3 ? 'Alta' : 'Controlada'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Reusable UI Components
// ═══════════════════════════════════════════════════════════════════

function SectionCard({ icon, title, subtitle, badge, children }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  badge?: { text: string; color: string }
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">{icon}</div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
              {subtitle && <p className="text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {badge && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>{badge.text}</span>
          )}
        </div>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  )
}

const DetailRow = ({ label, value, valueClass = '', hint }: { label: string; value: any; valueClass?: string; hint?: string }) => {
  const [showHint, setShowHint] = useState(false)
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          {hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex-shrink-0"
              title="Ver explicación"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${valueClass}`}>{value}</span>
      </div>
      {hint && showHint && (
        <div className="mt-1.5 ml-0 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 px-3 py-2 rounded-lg leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  )
}

const HeaderRow = ({ name, desc, hint, isActive }: { name: string; desc: string; hint: string; isActive: boolean }) => {
  const [showHint, setShowHint] = useState(false)
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
            <p className="text-[10px] text-gray-400">{desc}</p>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex-shrink-0"
            title="Ver explicación"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${
          isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isActive ? '✓ Activa' : '✗ Ausente'}
        </span>
      </div>
      {showHint && (
        <div className="mt-1.5 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 px-3 py-2 rounded-lg leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  )
}

const MetricCard = ({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: any; status: 'success' | 'danger' | 'warning' | 'info' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  }
  return (
    <div className={`p-3 rounded-xl border ${styles[status]}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span></div>
      <div className="text-lg font-black">{value}</div>
    </div>
  )
}

const ComplianceCard = ({ label, description, percentage }: { label: string; description: string; percentage: any }) => {
  const num = typeof percentage === 'object' ? (percentage?.score || 0) : (percentage || 0)
  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{label}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`text-2xl font-black ${num >= 80 ? 'text-emerald-600' : num >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{num}%</div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
        <div className={`h-3 rounded-full transition-all ${
          num >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
          num >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
          'bg-gradient-to-r from-red-400 to-red-600'
        }`} style={{ width: `${num}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 uppercase tracking-wider">
        <span>0%</span>
        <span>{num >= 80 ? 'Cumplimiento óptimo' : num >= 60 ? 'Cumplimiento parcial' : 'Requiere atención'}</span>
        <span>100%</span>
      </div>
    </div>
  )
}
