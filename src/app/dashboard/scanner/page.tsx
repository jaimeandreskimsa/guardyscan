'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Shield, Package, Network, Code, Database, Search, Play,
  AlertTriangle, CheckCircle, Clock, RefreshCw, FileCode, Globe,
  Server, Lock, Zap, FileText, BarChart3, Eye, Download,
  Loader2, Map, Container, ExternalLink, Radar, Activity,
  TrendingUp, ShieldCheck
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
                                value={`${scan.headers?.count || 6} de 8`}
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
  const risk = getRiskLevel(scan.score)
  const vulnCount = (scan.vulnerabilities || []).length
  const sslValid = scan.sslInfo?.valid
  const activeHeaders = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy', 'x-xss-protection', 'referrer-policy']
    .filter(h => scan.securityHeaders?.headers?.[h]).length

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

            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={scan.score >= 85 ? '#10b981' : scan.score >= 70 ? '#f59e0b' : scan.score >= 50 ? '#f97316' : '#ef4444'}
                      strokeWidth="8" strokeDasharray={`${(scan.score || 0) * 2.64} 264`}
                      strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black">{scan.score || 0}</span>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-blue-300 mt-1 font-semibold">Índice Global</p>
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
              <DetailRow label="Dirección IP" value={scan.serverInfo?.ip || scan.dnsRecords?.a?.[0] || 'N/A'} />
              <DetailRow label="Proveedor de hosting" value={scan.serverInfo?.provider || 'N/A'} />
              <DetailRow label="Ubicación del servidor" value={scan.serverInfo?.location || 'N/A'} />
              <DetailRow label="Tiempo de respuesta" value={scan.serverInfo?.responseTime || 'N/A'} />
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
              <DetailRow label="Estado" value={scan.sslInfo?.valid ? '✓ Certificado válido' : '✗ Certificado inválido'} valueClass={scan.sslInfo?.valid ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'} />
              <DetailRow label="Autoridad emisora" value={scan.sslInfo?.issuer || 'N/A'} />
              <DetailRow label="Fecha de expiración" value={scan.sslInfo?.validTo ? new Date(scan.sslInfo.validTo).toLocaleDateString('es-ES', { dateStyle: 'long' }) : 'N/A'} />
              <DetailRow label="Días hasta renovación" value={scan.sslInfo?.daysRemaining != null ? `${scan.sslInfo.daysRemaining} días` : 'N/A'} valueClass={scan.sslInfo?.daysRemaining != null && scan.sslInfo.daysRemaining < 30 ? 'text-orange-600 font-semibold' : ''} />
            </SectionCard>

            {/* Resolución de Nombres */}
            <SectionCard
              icon={<Network className="h-5 w-5 text-violet-600" />}
              title="Resolución de Nombres (DNS)"
              subtitle="Registros de dominio y enrutamiento"
            >
              <DetailRow label="Registro A (IPv4)" value={scan.dnsRecords?.a?.join(', ') || 'N/A'} />
              <DetailRow label="Registros MX (Correo)" value={scan.dnsRecords?.mx?.map((m: any) => m.exchange || m).join(', ') || 'N/A'} />
              <div className="py-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Registros TXT (Verificación)</span>
                <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 break-all line-clamp-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                  {scan.dnsRecords?.txt?.slice(0, 2).map((t: any) => Array.isArray(t) ? t.join(' ') : t).join(', ') || 'N/A'}
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
                { key: 'strict-transport-security', name: 'Strict-Transport-Security', desc: 'Fuerza conexión HTTPS' },
                { key: 'x-content-type-options', name: 'X-Content-Type-Options', desc: 'Previene MIME sniffing' },
                { key: 'x-frame-options', name: 'X-Frame-Options', desc: 'Protege contra clickjacking' },
                { key: 'content-security-policy', name: 'Content-Security-Policy', desc: 'Control de recursos' },
                { key: 'x-xss-protection', name: 'X-XSS-Protection', desc: 'Filtro anti-XSS' },
                { key: 'referrer-policy', name: 'Referrer-Policy', desc: 'Controla referencia' },
              ].map(h => (
                <div key={h.key} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{h.name}</span>
                    <p className="text-[10px] text-gray-400">{h.desc}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${
                    scan.securityHeaders?.headers?.[h.key]
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {scan.securityHeaders?.headers?.[h.key] ? '✓ Activa' : '✗ Ausente'}
                  </span>
                </div>
              ))}
            </SectionCard>

            {/* Stack Tecnológico */}
            <SectionCard
              icon={<Code className="h-5 w-5 text-cyan-600" />}
              title="Stack Tecnológico Detectado"
              subtitle="Tecnologías identificadas en la aplicación"
            >
              <div className="space-y-1">
                {(scan.technologies?.length > 0
                  ? scan.technologies.map((t: any) => typeof t === 'string' ? { name: t, version: '-' } : t)
                  : [{ name: 'No se detectaron tecnologías', version: '-' }]
                ).map((tech: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{tech.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{tech.version}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Rendimiento Web */}
            <SectionCard
              icon={<Zap className="h-5 w-5 text-amber-500" />}
              title="Rendimiento y Velocidad"
              subtitle="Métricas de rendimiento de la aplicación web"
            >
              <DetailRow label="Tiempo de carga" value={scan.performance?.loadTime || 'N/A'} />
              <DetailRow label="Tamaño de la página" value={scan.performance?.size || 'N/A'} />
              <DetailRow label="Peticiones HTTP" value={scan.performance?.requests || 'N/A'} />
            </SectionCard>

            {/* Servicios de Red */}
            <SectionCard
              icon={<Database className="h-5 w-5 text-orange-600" />}
              title="Servicios de Red Expuestos"
              subtitle="Puertos abiertos y servicios accesibles"
            >
              <div className="space-y-2">
                {(scan.openPorts?.length > 0
                  ? scan.openPorts
                  : [{ port: '—', service: 'Sin puertos detectados', status: '-' }]
                ).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">{p.port}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{p.service}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      p.status === 'open'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>{p.status === 'open' ? 'Abierto' : p.status}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Protección Perimetral */}
            <SectionCard
              icon={<Shield className="h-5 w-5 text-rose-600" />}
              title="Protección Perimetral"
              subtitle="Firewall de aplicaciones web y mitigación de ataques"
            >
              <DetailRow label="Web Application Firewall (WAF)" value={scan.firewall?.waf || 'No detectado'} valueClass={scan.firewall?.waf && scan.firewall.waf !== 'No detectado' ? 'text-emerald-600 font-semibold' : 'text-gray-500'} />
              <DetailRow label="Protección Anti-DDoS" value={scan.firewall?.ddos ? '✓ Activa' : '✗ No detectada'} valueClass={scan.firewall?.ddos ? 'text-emerald-600 font-semibold' : 'text-red-500'} />
              <DetailRow label="Limitación de peticiones (Rate Limiting)" value={scan.firewall?.rateLimit ? '✓ Activo' : '✗ No detectado'} valueClass={scan.firewall?.rateLimit ? 'text-emerald-600 font-semibold' : 'text-red-500'} />
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

          {/* ── Cumplimiento Normativo — ancho completo ── */}
          <SectionCard
            icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
            title="Cumplimiento Normativo"
            subtitle="Evaluación del nivel de adherencia a estándares internacionales"
          >
            {scan.compliance?.iso27001?.score !== undefined || scan.compliance?.gdpr?.compliant !== undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {scan.compliance?.iso27001?.score !== undefined && (
                  <ComplianceCard
                    label="ISO 27001"
                    description="Sistema de Gestión de Seguridad de la Información"
                    percentage={scan.compliance.iso27001.score}
                  />
                )}
                {scan.compliance?.gdpr?.compliant !== undefined && (
                  <ComplianceCard
                    label="GDPR"
                    description="Reglamento General de Protección de Datos"
                    percentage={scan.compliance.gdpr.compliant ? 100 : 50}
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No se encontraron datos de cumplimiento normativo para esta evaluación</p>
            )}
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

const DetailRow = ({ label, value, valueClass = '' }: { label: string; value: any; valueClass?: string }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${valueClass}`}>{value}</span>
  </div>
)

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
