'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldAlert, 
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bug,
  FileDown,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Radar,
  ExternalLink,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

interface Vulnerability {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED' | 'FALSE_POSITIVE'
  source: string
  cveId?: string
  cvssScore?: number
  assetName?: string
  assetType?: string
  exploitAvailable?: boolean
  patchAvailable?: boolean
  remediation?: string
  discoveredAt: string
  resolvedAt?: string
}

const SEVERITY_COLORS = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', fill: '#ef4444' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500', fill: '#f97316' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', fill: '#eab308' },
  LOW: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', fill: '#3b82f6' },
  INFO: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500', fill: '#6b7280' },
}

const STATUS_COLORS = {
  OPEN: { bg: 'bg-red-100', text: 'text-red-700' },
  IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  RESOLVED: { bg: 'bg-green-100', text: 'text-green-700' },
  ACCEPTED: { bg: 'bg-purple-100', text: 'text-purple-700' },
  FALSE_POSITIVE: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

const translateSeverity = (severity: string): string => {
  const translations: { [key: string]: string } = {
    'CRITICAL': 'Crítica',
    'HIGH': 'Alta',
    'MEDIUM': 'Media',
    'LOW': 'Baja',
    'INFO': 'Informativa'
  }
  return translations[severity] || severity
}

const translateStatus = (status: string): string => {
  const translations: { [key: string]: string } = {
    'OPEN': 'Abierta',
    'IN_PROGRESS': 'En Progreso',
    'RESOLVED': 'Resuelta',
    'ACCEPTED': 'Aceptada',
    'FALSE_POSITIVE': 'Falso Positivo'
  }
  return translations[status] || status.replace('_', ' ')
}

const translateAssetType = (assetType: string): string => {
  const translations: { [key: string]: string } = {
    'SERVER': 'Servidor',
    'WEB': 'Aplicación Web',
    'DATABASE': 'Base de Datos',
    'NETWORK': 'Red',
    'ENDPOINT': 'Endpoint',
    'API': 'API',
    'MOBILE': 'Móvil',
    'CLOUD': 'Nube'
  }
  return translations[assetType] || assetType
}

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

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
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVulnerabilities()
  }, [filterSeverity, filterStatus])

  const updateVulnerability = async (id: string, status: string) => {
    try {
      await fetch(`/api/vulnerabilities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchVulnerabilities()
      setSelectedVuln(null)
    } catch (error) {
      console.error('Error updating vulnerability:', error)
    }
  }

  const filteredVulns = vulnerabilities.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cveId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.assetName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Preparar datos para gráficos
  const severityData = Object.entries(stats.bySeverity || {}).map(([name, value]) => ({
    name,
    value: value as number,
    fill: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS]?.fill || '#ccc'
  }))

  const statusData = Object.entries(stats.byStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value: value as number
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-red-500" />
            Gestión de Vulnerabilidades
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Seguimiento y remediación de vulnerabilidades detectadas
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/scanner"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Radar className="h-5 w-5" />
            Ir al Scanner
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Agregar Manual
          </button>
          <button
            onClick={fetchVulnerabilities}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Críticas</p>
              <p className="text-3xl font-bold text-red-600">{stats.bySeverity?.CRITICAL || 0}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Altas</p>
              <p className="text-3xl font-bold text-orange-600">{stats.bySeverity?.HIGH || 0}</p>
            </div>
            <Bug className="h-10 w-10 text-orange-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Medias</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.bySeverity?.MEDIUM || 0}</p>
            </div>
            <ShieldAlert className="h-10 w-10 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resueltas</p>
              <p className="text-3xl font-bold text-green-600">{stats.byStatus?.RESOLVED || 0}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.total || 0}</p>
            </div>
            <Search className="h-10 w-10 text-indigo-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución por Severidad
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${value}` : ''}
                labelLine={false}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, translateSeverity(name as string)]} />
              <Legend 
                formatter={(value) => translateSeverity(value)}
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de Vulnerabilidades
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, CVE o activo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las severidades</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
            <option value="INFO">Informativa</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abierta</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="RESOLVED">Resuelta</option>
            <option value="ACCEPTED">Aceptada</option>
            <option value="FALSE_POSITIVE">Falso Positivo</option>
          </select>

          <button
            onClick={fetchVulnerabilities}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Vulnerability List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Severidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vulnerabilidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CVSS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descubierta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Cargando vulnerabilidades...
                  </td>
                </tr>
              ) : filteredVulns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Radar className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay vulnerabilidades registradas
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Ejecuta un escaneo en el Scanner para detectar vulnerabilidades automáticamente
                    </p>
                    <Link
                      href="/dashboard/scanner"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Radar className="h-5 w-5" />
                      Ir al Scanner
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredVulns.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[vuln.severity].bg} ${SEVERITY_COLORS[vuln.severity].text}`}>
                        {translateSeverity(vuln.severity)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{vuln.title}</p>
                          {vuln.cveId && (
                            <p className="text-sm text-indigo-600 dark:text-indigo-400">{vuln.cveId}</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {vuln.exploitAvailable && (
                              <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Exploit disponible
                              </span>
                            )}
                            {vuln.patchAvailable && (
                              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                Parche disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">{vuln.assetName || '-'}</p>
                      <p className="text-xs text-gray-500">{vuln.assetType ? translateAssetType(vuln.assetType) : '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {vuln.cvssScore != null && (
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                            vuln.cvssScore >= 9 ? 'bg-red-600' :
                            vuln.cvssScore >= 7 ? 'bg-orange-600' :
                            vuln.cvssScore >= 4 ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}>
                            {vuln.cvssScore.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[vuln.status].bg} ${STATUS_COLORS[vuln.status].text}`}>
                        {translateStatus(vuln.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(vuln.discoveredAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedVuln(vuln)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${SEVERITY_COLORS[selectedVuln.severity].bg} ${SEVERITY_COLORS[selectedVuln.severity].text}`}>
                      {translateSeverity(selectedVuln.severity)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedVuln.status].bg} ${STATUS_COLORS[selectedVuln.status].text}`}>
                      {translateStatus(selectedVuln.status)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedVuln.title}
                  </h2>
                  {selectedVuln.cveId && (
                    <a 
                      href={`https://nvd.nist.gov/vuln/detail/${selectedVuln.cveId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {selectedVuln.cveId}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedVuln(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedVuln.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">CVSS Score</h4>
                  <p className="text-2xl font-bold text-indigo-600">{selectedVuln.cvssScore?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Severidad</h4>
                  <p className={`text-2xl font-bold ${SEVERITY_COLORS[selectedVuln.severity].text}`}>
                    {translateSeverity(selectedVuln.severity)}
                  </p>
                </div>
              </div>

              {/* Impacto potencial */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Impacto potencial</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    Exposición de credenciales o información sensible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    Riesgo de ataques Man-in-the-Middle (MITM)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    Incumplimiento de buenas prácticas de seguridad
                  </li>
                </ul>
              </div>

              {/* Evaluación de riesgo */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Evaluación de riesgo</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Severidad:</span> <span className="font-medium">{translateSeverity(selectedVuln.severity)}</span></div>
                  <div><span className="text-gray-500">CVSS:</span> <span className="font-medium">{selectedVuln.cvssScore?.toFixed(1) || 'No aplica'}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Motivo:</span> <span className="font-medium">{selectedVuln.cveId ? `CVE asociado: ${selectedVuln.cveId}` : 'Vulnerabilidad de configuración detectada (no asociada a un CVE específico).'}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Activo Afectado</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedVuln.assetName || 'No especificado'} {selectedVuln.assetType ? `(${translateAssetType(selectedVuln.assetType)})` : ''}
                </p>
              </div>

              {selectedVuln.remediation && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Remediación recomendada</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    {selectedVuln.remediation}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-500">
                    <div>⚙️ Dificultad: <span className="font-medium">Baja</span></div>
                    <div>🔄 Reversible: <span className="font-medium">Sí</span></div>
                    <div>📉 Impacto en el sistema: <span className="font-medium">Bajo</span></div>
                    <div>⏱ Tiempo estimado: <span className="font-medium">&lt; 15 minutos</span></div>
                  </div>
                </div>
              )}

              {/* Cumplimiento y referencias - PPT */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Cumplimiento y referencias</h4>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-medium">ISO/IEC 27001</span>
                    <span>A.8.20 – Seguridad en las comunicaciones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-medium">OWASP Top 10</span>
                    <span>A02 – Cryptographic Failures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-medium">Buenas prácticas</span>
                    <span>HTTPS Everywhere</span>
                  </div>
                </div>
              </div>

              {/* Historial - PPT */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Historial</h4>
                <div className="border-l-2 border-gray-200 dark:border-gray-600 pl-4 space-y-3">
                  <div className="relative">
                    <div className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedVuln.discoveredAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      {' — '}Vulnerabilidad detectada automáticamente
                    </p>
                  </div>
                  {selectedVuln.status !== 'OPEN' && (
                    <div className="relative">
                      <div className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-gray-800" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedVuln.discoveredAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        {' — '}Estado cambiado a &quot;{translateStatus(selectedVuln.status)}&quot;
                      </p>
                    </div>
                  )}
                  {selectedVuln.resolvedAt && (
                    <div className="relative">
                      <div className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedVuln.resolvedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        {' — '}Vulnerabilidad resuelta
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => updateVulnerability(selectedVuln.id, 'RESOLVED')}
                  disabled={selectedVuln.status === 'RESOLVED'}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  ✅ Marcar como resuelta
                </button>
                <button
                  onClick={() => updateVulnerability(selectedVuln.id, 'ACCEPTED')}
                  disabled={selectedVuln.status === 'ACCEPTED'}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  Aceptar riesgo
                </button>
                <button
                  onClick={() => updateVulnerability(selectedVuln.id, 'IN_PROGRESS')}
                  disabled={selectedVuln.status === 'IN_PROGRESS'}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  Cambiar estado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Vulnerability Modal */}
      {showAddModal && (
        <AddVulnerabilityModal 
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              const res = await fetch('/api/vulnerabilities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              })
              if (res.ok) {
                setShowAddModal(false)
                fetchVulnerabilities()
              } else {
                alert('Error al crear la vulnerabilidad')
              }
            } catch (error) {
              console.error('Error creating vulnerability:', error)
              alert('Error al crear la vulnerabilidad')
            }
          }}
        />
      )}
    </div>
  )
}

// Add Manual Vulnerability Modal Component
function AddVulnerabilityModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    cveId: '',
    cvssScore: '',
    assetName: '',
    assetType: 'SERVER',
    exploitAvailable: false,
    patchAvailable: false,
    remediation: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      alert('Título y descripción son requeridos')
      return
    }
    setSaving(true)
    await onSave({
      ...formData,
      cvssScore: formData.cvssScore ? parseFloat(formData.cvssScore) : undefined,
      source: 'MANUAL',
      status: 'OPEN',
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Agregar Vulnerabilidad Manual
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Nombre de la vulnerabilidad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Descripción detallada de la vulnerabilidad"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severidad
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CRITICAL">Crítica</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Baja</option>
                <option value="INFO">Informativa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVE ID
              </label>
              <input
                type="text"
                value={formData.cveId}
                onChange={(e) => setFormData({ ...formData, cveId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="CVE-2024-XXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVSS Score
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.cvssScore}
                onChange={(e) => setFormData({ ...formData, cvssScore: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="0.0 - 10.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Activo
              </label>
              <select
                value={formData.assetType}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SERVER">Servidor</option>
                <option value="DATABASE">Base de Datos</option>
                <option value="APPLICATION">Aplicación</option>
                <option value="NETWORK">Red</option>
                <option value="ENDPOINT">Endpoint</option>
                <option value="CLOUD">Cloud</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Activo
            </label>
            <input
              type="text"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Nombre del activo afectado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remediación
            </label>
            <textarea
              value={formData.remediation}
              onChange={(e) => setFormData({ ...formData, remediation: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Pasos para remediar la vulnerabilidad"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.exploitAvailable}
                onChange={(e) => setFormData({ ...formData, exploitAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Exploit disponible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.patchAvailable}
                onChange={(e) => setFormData({ ...formData, patchAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Parche disponible</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Crear Vulnerabilidad
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
