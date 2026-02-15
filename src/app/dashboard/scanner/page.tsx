'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Package, 
  Network, 
  Code, 
  Database, 
  Container,
  Search,
  Upload,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  FileCode,
  Globe,
  Server
} from 'lucide-react'

type ScanType = 'dependencies' | 'ports' | 'code' | 'nvd' | 'docker'

interface ScanResult {
  success: boolean
  stats?: any
  summary?: any
  vulnerabilities?: any[]
  issues?: any[]
  results?: any[]
  error?: string
}

interface RecentScan {
  id: string
  targetUrl: string
  status: string
  score: number | null
  createdAt: string
}

const SCAN_CATEGORIES = [
  {
    id: 'server',
    name: 'Mi Servidor',
    emoji: '🌐',
    description: 'Puertos + CVE',
    scanTypes: ['ports', 'nvd'] as ScanType[],
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'code',
    name: 'Mi Código',
    emoji: '💻',
    description: 'Código + Dependencias',
    scanTypes: ['code', 'dependencies'] as ScanType[],
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'app',
    name: 'Mi Aplicación',
    emoji: '📦',
    description: 'Docker + Dependencias',
    scanTypes: ['docker', 'dependencies'] as ScanType[],
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    color: 'from-orange-500 to-red-500',
  },
]

const RECOMMENDED_SCANS = [
  { id: 'ports' as ScanType, name: 'Puertos Básicos', emoji: '🌐', description: 'Detecta servicios expuestos', time: '2–5 min', input: 'IP/Dominio' },
  { id: 'dependencies' as ScanType, name: 'Dependencias Básicas', emoji: '📦', description: 'Analiza librerías inseguras', time: '1–3 min', input: 'package.json' },
  { id: 'code' as ScanType, name: 'Código Intermedio', emoji: '💻', description: 'Revisa vulnerabilidades', time: '1–7 min', input: 'Repositorio' },
]

const ADVANCED_SCANS = [
  { id: 'docker' as ScanType, name: 'Docker Avanzado', emoji: '🌐', description: 'Analiza imágenes y Dockerfiles', time: '3–10 min', input: 'Dockerfile' },
  { id: 'nvd' as ScanType, name: 'CVE / NVD Avanzado', emoji: '📦', description: 'Busca vulnerabilidades conocidas (NIST)', time: '1–2 min', input: 'Manual' },
]

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  INFO: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function SecurityScannerPage() {
  const [selectedScan, setSelectedScan] = useState<ScanType | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])

  // Fetch recent scans
  useEffect(() => {
    fetch('/api/scans')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setRecentScans(data.slice(0, 5)) })
      .catch(() => {})
  }, [])

  // Form states for each scan type
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

  const runScan = async () => {
    if (!selectedScan) return
    setScanning(true)
    setResult(null)

    try {
      let endpoint = ''
      let body: any = {}

      switch (selectedScan) {
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
          if (nvdType === 'cve') {
            body = { type: 'cve', cveId: nvdQuery }
          } else if (nvdType === 'keyword') {
            body = { type: 'keyword', keyword: nvdQuery }
          } else if (nvdType === 'recent') {
            body = { type: 'recent', days: 7 }
          }
          break
        case 'docker':
          endpoint = '/api/scan/docker'
          if (dockerType === 'dockerfile') {
            body = { type: 'dockerfile', dockerfile: dockerContent }
          } else {
            body = { type: 'image', imageName: dockerImage }
          }
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'Error ejecutando escaneo' })
    } finally {
      setScanning(false)
    }
  }

  const renderScanForm = () => {
    if (!selectedScan) return null

    switch (selectedScan) {
      case 'dependencies':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de proyecto
              </label>
              <select
                value={depType}
                onChange={(e) => setDepType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="npm">Node.js (package.json)</option>
                <option value="pypi">Python (requirements.txt)</option>
                <option value="go">Go (go.mod)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenido del archivo
              </label>
              <textarea
                value={depContent}
                onChange={(e) => setDepContent(e.target.value)}
                placeholder={depType === 'npm' 
                  ? '{\n  "dependencies": {\n    "express": "^4.18.0",\n    "lodash": "^4.17.21"\n  }\n}'
                  : depType === 'pypi'
                  ? 'flask==2.0.0\nrequests==2.28.0\ndjango>=3.0'
                  : 'require example.com/pkg v1.2.3'
                }
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
          </div>
        )

      case 'ports':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host (IP o dominio)
              </label>
              <input
                type="text"
                value={portHost}
                onChange={(e) => setPortHost(e.target.value)}
                placeholder="ejemplo.com o 192.168.1.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de escaneo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'quick', name: 'Rápido', desc: '24 puertos críticos' },
                  { id: 'common', name: 'Común', desc: '35 puertos conocidos' },
                  { id: 'full', name: 'Completo', desc: '1-1024 puertos' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPortScanType(opt.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      portScanType === opt.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <p className="font-medium">{opt.name}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del archivo
              </label>
              <input
                type="text"
                value={codeFilename}
                onChange={(e) => setCodeFilename(e.target.value)}
                placeholder="app.js, server.py, etc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código fuente
              </label>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="Pega tu código aquí para analizarlo..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
          </div>
        )

      case 'nvd':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de búsqueda
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cve', name: 'CVE ID', icon: Search },
                  { id: 'keyword', name: 'Palabra clave', icon: Globe },
                  { id: 'recent', name: 'Recientes', icon: Clock },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setNvdType(opt.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      nvdType === opt.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <opt.icon className="h-4 w-4" />
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {nvdType !== 'recent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {nvdType === 'cve' ? 'CVE ID' : 'Palabra clave'}
                </label>
                <input
                  type="text"
                  value={nvdQuery}
                  onChange={(e) => setNvdQuery(e.target.value)}
                  placeholder={nvdType === 'cve' ? 'CVE-2024-1234' : 'log4j, apache, nginx...'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}
            {nvdType === 'recent' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Se buscarán las vulnerabilidades publicadas en los últimos 7 días
                </p>
              </div>
            )}
          </div>
        )

      case 'docker':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de análisis
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDockerType('dockerfile')}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    dockerType === 'dockerfile'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <FileCode className="h-4 w-4" />
                  <span>Dockerfile</span>
                </button>
                <button
                  onClick={() => setDockerType('image')}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    dockerType === 'image'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Container className="h-4 w-4" />
                  <span>Imagen</span>
                </button>
              </div>
            </div>
            {dockerType === 'dockerfile' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido del Dockerfile
                </label>
                <textarea
                  value={dockerContent}
                  onChange={(e) => setDockerContent(e.target.value)}
                  placeholder="FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [&quot;npm&quot;, &quot;start&quot;]"
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la imagen
                </label>
                <input
                  type="text"
                  value={dockerImage}
                  onChange={(e) => setDockerImage(e.target.value)}
                  placeholder="node:18, python:3.11, nginx:latest"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}
          </div>
        )
    }
  }

  const renderResults = () => {
    if (!result) return null

    if (!result.success) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Error en el escaneo</h3>
              <p className="text-red-600 dark:text-red-300">{result.error}</p>
            </div>
          </div>
        </div>
      )
    }

    const vulns = result.vulnerabilities || result.issues || result.results || []
    const stats = result.stats || result.summary || {}

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{stats.critical || stats.CRITICAL || 0}</p>
            <p className="text-sm text-red-700">Críticas</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.high || stats.HIGH || 0}</p>
            <p className="text-sm text-orange-700">Altas</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.medium || stats.MEDIUM || 0}</p>
            <p className="text-sm text-yellow-700">Medias</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.low || stats.LOW || 0}</p>
            <p className="text-sm text-blue-700">Bajas</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats.total || vulns.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>

        {/* Vulnerabilities List */}
        {vulns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Vulnerabilidades encontradas ({vulns.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
              {vulns.map((vuln: any, i: number) => (
                <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${SEVERITY_COLORS[vuln.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.INFO}`}>
                          {vuln.severity}
                        </span>
                        {vuln.cveId && (
                          <a
                            href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            {vuln.cveId}
                          </a>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {vuln.title || vuln.id}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {vuln.description}
                      </p>
                      {(vuln.packageName || vuln.file || vuln.port) && (
                        <p className="text-xs text-gray-500 mt-2">
                          {vuln.packageName && `📦 ${vuln.packageName}@${vuln.installedVersion}`}
                          {vuln.file && `📄 ${vuln.file}:${vuln.line}`}
                          {vuln.port && `🔌 Puerto ${vuln.port} (${vuln.service})`}
                        </p>
                      )}
                      {vuln.recommendation && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          💡 {vuln.recommendation}
                        </p>
                      )}
                    </div>
                    {vuln.cvssScore && (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                        vuln.cvssScore >= 9 ? 'bg-red-600' :
                        vuln.cvssScore >= 7 ? 'bg-orange-500' :
                        vuln.cvssScore >= 4 ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        {vuln.cvssScore.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vulns.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              ¡No se encontraron vulnerabilidades!
            </h3>
            <p className="text-green-600 dark:text-green-300 text-sm">
              El escaneo se completó sin detectar problemas de seguridad.
            </p>
          </div>
        )}
      </div>
    )
  }

  const getScanName = (id: ScanType) => {
    const names: Record<ScanType, string> = { ports: 'Puertos', dependencies: 'Dependencias', code: 'Código (SAST)', nvd: 'CVE/NVD', docker: 'Docker' }
    return names[id]
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-4">
          <Shield className="h-4 w-4" />
          ESCANEA SERVIDORES, CÓDIGO Y APLICACIONES EN MINUTOS
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ¿Qué quieres analizar hoy?
        </h1>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {SCAN_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedScan(cat.scanTypes[0]); setResult(null) }}
            className={`relative overflow-hidden rounded-2xl p-8 text-center transition-all hover:scale-105 hover:shadow-xl border-2 ${
              cat.scanTypes.includes(selectedScan!) ? 'border-indigo-500 shadow-lg' : 'border-transparent'
            } ${cat.bgColor}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-5`} />
            <div className="relative">
              <div className="text-5xl mb-4">{cat.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">({cat.description})</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recommended Scans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Escaneos recomendados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDED_SCANS.map((scan) => (
            <div key={scan.id} className={`rounded-xl border-2 p-5 transition-all cursor-pointer hover:shadow-lg ${
              selectedScan === scan.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`} onClick={() => { setSelectedScan(scan.id); setResult(null) }}>
              <div className="text-2xl mb-2">{scan.emoji}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{scan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scan.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {scan.time}</span>
                <span>⚙️ {scan.input}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedScan(scan.id); setResult(null) }}
                className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedScan === scan.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>Iniciar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Scans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-orange-500" />
          Escaneos avanzados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADVANCED_SCANS.map((scan) => (
            <div key={scan.id} className={`rounded-xl border-2 p-5 transition-all cursor-pointer hover:shadow-lg ${
              selectedScan === scan.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`} onClick={() => { setSelectedScan(scan.id); setResult(null) }}>
              <div className="text-2xl mb-2">{scan.emoji}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{scan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scan.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {scan.time}</span>
                <span>⚙️ {scan.input}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedScan(scan.id); setResult(null) }}
                className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedScan === scan.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>Iniciar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Configuration */}
      {selectedScan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="h-5 w-5" />
              Configuración: {getScanName(selectedScan)}
            </h2>
            {renderScanForm()}
            <button onClick={runScan} disabled={scanning}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {scanning ? (<><RefreshCw className="h-5 w-5 animate-spin" />Escaneando...</>) : (<><Play className="h-5 w-5" />Ejecutar Escaneo</>)}
            </button>
          </div>
          <div>
            {scanning && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <RefreshCw className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Analizando...</h3>
                <p className="text-gray-500">Esto puede tomar unos segundos</p>
              </div>
            )}
            {!scanning && result && renderResults()}
            {!scanning && !result && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-600 dark:text-gray-400">Configura y ejecuta el escaneo</h3>
                <p className="text-gray-500 text-sm mt-1">Los resultados aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Últimos escaneos
          </h2>
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div key={scan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🌐</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{scan.targetUrl}</p>
                    <p className="text-sm text-gray-500">{new Date(scan.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {scan.score != null && (
                    <span className={`text-sm font-medium ${scan.score >= 80 ? 'text-green-600' : scan.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      Riesgo {scan.score >= 80 ? 'bajo' : scan.score >= 60 ? 'medio' : 'alto'}
                    </span>
                  )}
                  <a href="/dashboard/scans" className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    Ver reporte
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
