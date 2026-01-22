'use client'

import { useState } from 'react'
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

const SCAN_TYPES = [
  {
    id: 'dependencies' as ScanType,
    name: 'Dependencias',
    icon: Package,
    description: 'Escanea package.json, requirements.txt o go.mod',
    source: 'OSV (Google)',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'ports' as ScanType,
    name: 'Puertos',
    icon: Network,
    description: 'Escanea puertos abiertos en IP o dominio',
    source: 'Scanner Nativo',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'code' as ScanType,
    name: 'Código (SAST)',
    icon: Code,
    description: 'Análisis estático de seguridad del código',
    source: 'OWASP Patterns',
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 'nvd' as ScanType,
    name: 'CVE/NVD',
    icon: Database,
    description: 'Buscar vulnerabilidades en NVD',
    source: 'NIST NVD',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'docker' as ScanType,
    name: 'Docker',
    icon: Container,
    description: 'Analizar Dockerfile o imagen',
    source: 'Trivy / Local',
    color: 'from-sky-500 to-blue-600'
  }
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="h-8 w-8 text-indigo-600" />
          Security Scanner
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Escanea dependencias, puertos, código, CVEs y contenedores Docker
        </p>
      </div>

      {/* Scan Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {SCAN_TYPES.map(scan => (
          <button
            key={scan.id}
            onClick={() => {
              setSelectedScan(scan.id)
              setResult(null)
            }}
            className={`relative overflow-hidden rounded-xl p-4 transition-all ${
              selectedScan === scan.id
                ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900'
                : 'hover:scale-105'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${scan.color} opacity-10`} />
            <div className="relative">
              <scan.icon className={`h-8 w-8 mb-2 ${
                selectedScan === scan.id ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-900 dark:text-white">{scan.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scan.description}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">{scan.source}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Scan Configuration */}
      {selectedScan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="h-5 w-5" />
              Configuración del Escaneo
            </h2>
            
            {renderScanForm()}

            <button
              onClick={runScan}
              disabled={scanning}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Ejecutar Escaneo
                </>
              )}
            </button>
          </div>

          {/* Results */}
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
                <h3 className="font-semibold text-gray-600 dark:text-gray-400">
                  Configura y ejecuta el escaneo
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Los resultados aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!selectedScan && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tipos de Escaneo Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Package className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Dependencias</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pega tu package.json, requirements.txt o go.mod para encontrar vulnerabilidades en librerías.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Network className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Puertos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Escanea puertos abiertos en servidores para detectar servicios expuestos.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Código (SAST)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Análisis estático que detecta SQL Injection, XSS, secretos hardcodeados y más.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Database className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">CVE/NVD</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Busca vulnerabilidades en la base de datos nacional de EEUU (NIST).
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Container className="h-6 w-6 text-sky-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Docker</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analiza Dockerfiles y verifica imágenes por vulnerabilidades conocidas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
