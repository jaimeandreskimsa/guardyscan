'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Plus, Eye, Edit, Trash2, CheckCircle, Clock, XCircle,
  AlertCircle, Search, FileText, Shield, Timer, User, RefreshCw, X,
  Loader2, Zap, Activity, Globe, Target, ShieldAlert, Bug, Flame, Skull,
  ArrowRight, ChevronDown, ChevronUp, Network, Code, Package, ExternalLink,
  BarChart3, TrendingUp, Filter, Paperclip, Upload, Link2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; text: string; icon: string; fill: string; weight: number }> = {
  CRITICAL: { label: 'Crítica', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', bg: 'bg-red-500', text: 'text-red-600', icon: '🚨', fill: '#ef4444', weight: 4 },
  HIGH:     { label: 'Alta',    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', bg: 'bg-orange-500', text: 'text-orange-600', icon: '🔥', fill: '#f97316', weight: 3 },
  MEDIUM:   { label: 'Media',   color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', bg: 'bg-yellow-500', text: 'text-yellow-600', icon: '⚠️', fill: '#eab308', weight: 2 },
  LOW:      { label: 'Baja',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', bg: 'bg-blue-500', text: 'text-blue-600', icon: 'ℹ️', fill: '#3b82f6', weight: 1 },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: any }> = {
  OPEN:        { label: 'Abierto',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500', icon: AlertCircle },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500', icon: Clock },
  RESOLVED:    { label: 'Resuelto',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500', icon: CheckCircle },
  CLOSED:      { label: 'Cerrado',     color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400', icon: XCircle },
}

const SLA_HOURS: Record<string, number> = { CRITICAL: 4, HIGH: 8, MEDIUM: 24, LOW: 72 }

const INCIDENT_CATEGORIES = [
  'Brecha de Datos', 'Phishing', 'Malware', 'Ransomware', 'Acceso No Autorizado',
  'Denegación de Servicio (DoS)', 'Fuga de Información', 'Uso Indebido de Recursos',
  'Ingeniería Social', 'Vulnerabilidad de Sistema', 'Pérdida de Dispositivos',
  'Configuración Insegura', 'Explotación de Vulnerabilidad', 'Otro'
]

const ORIGIN_OPTIONS = [
  { value: 'Manual', label: 'Manual', icon: Plus },
  { value: 'Vulnerabilidad', label: 'Vulnerabilidad', icon: ShieldAlert },
  { value: 'SIEM', label: 'SIEM', icon: Activity },
  { value: 'Tercero', label: 'Tercero', icon: Globe },
  { value: 'Scanner', label: 'Scanner', icon: Target },
]

const RESPONSIBLE_OPTIONS = [
  'Jaime Gómez', 'Carlos Rodríguez', 'María López', 'Ana Martínez',
  'Pedro Sánchez', 'Laura García', 'SOC Team', 'CISO', 'IT Security'
]

const ASSET_SYSTEMS = [
  'Servidor Web Principal', 'Base de Datos PostgreSQL', 'Servidor de Correo',
  'Firewall Perimetral', 'Active Directory', 'VPN Gateway', 'API Gateway',
  'CDN / Load Balancer', 'Servidor de Archivos', 'Estación de Trabajo',
  'Red Interna', 'Cloud AWS', 'Cloud Azure', 'Aplicación Web'
]

const SOURCE_ICONS: Record<string, { icon: any; color: string; label: string }> = {
  vulnerability: { icon: ShieldAlert, color: 'text-red-500', label: 'Vulnerabilidades' },
  siem:          { icon: Activity, color: 'text-blue-500', label: 'SIEM' },
  threat:        { icon: Target, color: 'text-purple-500', label: 'Amenazas' },
  scan:          { icon: Globe, color: 'text-cyan-500', label: 'Escaneos' },
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════
function getSLAInfo(incident: any) {
  const slaHours = SLA_HOURS[incident.severity] || 24
  const created = new Date(incident.detectedAt).getTime()
  const elapsed = (Date.now() - created) / (1000 * 60 * 60)
  const remaining = Math.max(0, slaHours - elapsed)
  const exceeded = remaining <= 0
  const pct = Math.min(100, (elapsed / slaHours) * 100)
  return { remaining, total: slaHours, exceeded, pct, elapsed }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getEvidenceStyle(name: string) {
  const n = name.toLowerCase()
  if (n.endsWith('.pdf')) return { emoji: '📄', bg: 'bg-red-50 dark:bg-red-900/10', label: 'Documento PDF' }
  if (n.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return { emoji: '🖼️', bg: 'bg-blue-50 dark:bg-blue-900/10', label: 'Imagen' }
  if (n.match(/\.(log|txt|csv)$/)) return { emoji: '📋', bg: 'bg-green-50 dark:bg-green-900/10', label: 'Log / Texto' }
  if (n.match(/^https?:\/\//)) return { emoji: '🔗', bg: 'bg-indigo-50 dark:bg-indigo-900/10', label: 'Enlace externo' }
  return { emoji: '📎', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Archivo adjunto' }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showSuggested, setShowSuggested] = useState(false)
  const [showDetail, setShowDetail] = useState<any>(null)
  const [editingIncident, setEditingIncident] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  // Suggested incidents from connected modules
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [availableVulns, setAvailableVulns] = useState<any[]>([])
  const [loadingVulns, setLoadingVulns] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', severity: 'MEDIUM', category: '', origin: 'Manual',
    affectedSystems: '', assignedTo: '', notes: '', immediateActions: '', linkedVulnerabilityId: '',
    impactFinancial: 'MEDIUM', impactOperational: 'MEDIUM', impactReputational: 'MEDIUM',
    evidences: [] as string[], actions: [] as string[],
  })

  // ─── Data loading ─────────────────────────────────────────────
  useEffect(() => { loadIncidents() }, [])

  const loadIncidents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/incidents')
      const data = await res.json()
      setIncidents(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const [vulnRes, siemRes, threatRes, scanRes] = await Promise.all([
        fetch('/api/vulnerabilities?severity=CRITICAL&status=OPEN').then(r => r.json()).catch(() => ({ vulnerabilities: [] })),
        fetch('/api/siem/events').then(r => r.json()).catch(() => []),
        fetch('/api/siem/threats').then(r => r.json()).catch(() => []),
        fetch('/api/scans').then(r => r.json()).catch(() => []),
      ])

      const items: any[] = []

      // Critical/High open vulnerabilities
      const vulns = vulnRes.vulnerabilities || []
      vulns.forEach((v: any) => {
        items.push({
          id: `vuln-${v.id}`,
          type: 'vulnerability',
          title: v.title,
          description: v.description || 'Vulnerabilidad detectada en el sistema',
          severity: v.severity,
          source: v.source || 'SCAN',
          cveId: v.cveId,
          assetName: v.assetName,
          detectedAt: v.discoveredAt || v.createdAt,
          origin: 'Vulnerabilidad',
          category: 'Vulnerabilidad de Sistema',
          raw: v,
        })
      })

      // Also fetch HIGH vulns
      try {
        const highRes = await fetch('/api/vulnerabilities?severity=HIGH&status=OPEN').then(r => r.json())
        const highVulns = highRes.vulnerabilities || []
        highVulns.forEach((v: any) => {
          if (!items.find(i => i.id === `vuln-${v.id}`)) {
            items.push({
              id: `vuln-${v.id}`,
              type: 'vulnerability',
              title: v.title,
              description: v.description || 'Vulnerabilidad detectada',
              severity: v.severity,
              source: v.source || 'SCAN',
              cveId: v.cveId,
              assetName: v.assetName,
              detectedAt: v.discoveredAt || v.createdAt,
              origin: 'Vulnerabilidad',
              category: 'Vulnerabilidad de Sistema',
              raw: v,
            })
          }
        })
      } catch {}

      // SIEM critical/high events
      const events = Array.isArray(siemRes) ? siemRes : []
      events
        .filter((e: any) => e.severity === 'CRITICAL' || e.severity === 'HIGH')
        .slice(0, 5)
        .forEach((e: any) => {
          items.push({
            id: `siem-${e.id}`,
            type: 'siem',
            title: e.message || `Evento SIEM: ${e.type || 'Alerta'}`,
            description: `Evento de seguridad detectado por ${e.source || 'SIEM'}: ${e.message || 'Sin detalle'}`,
            severity: e.severity || 'HIGH',
            source: e.source,
            detectedAt: e.timestamp || e.createdAt,
            origin: 'SIEM',
            category: e.type === 'INTRUSION' ? 'Acceso No Autorizado' : e.type === 'MALWARE' ? 'Malware' : 'Otro',
            raw: e,
          })
        })

      // Active threats
      const allThreats = Array.isArray(threatRes) ? threatRes : []
      allThreats
        .filter((t: any) => t.active)
        .slice(0, 3)
        .forEach((t: any) => {
          items.push({
            id: `threat-${t.id}`,
            type: 'threat',
            title: `Amenaza: ${t.type || t.indicator || 'IOC detectado'}`,
            description: t.description || `Indicador de compromiso (${t.type}) detectado: ${t.indicator || 'N/A'}`,
            severity: t.severity || 'HIGH',
            source: 'Threat Intelligence',
            detectedAt: t.lastSeen || t.createdAt,
            origin: 'SIEM',
            category: 'Malware',
            raw: t,
          })
        })

      // Scans with low scores
      const allScans = Array.isArray(scanRes) ? scanRes : []
      allScans
        .filter((s: any) => s.status === 'COMPLETED' && s.score != null && s.score < 50)
        .slice(0, 3)
        .forEach((s: any) => {
          items.push({
            id: `scan-${s.id}`,
            type: 'scan',
            title: `Escaneo crítico: ${s.targetUrl}`,
            description: `Escaneo web completado con puntuación ${s.score}/100 — múltiples vulnerabilidades detectadas`,
            severity: s.score < 30 ? 'CRITICAL' : 'HIGH',
            source: 'Scanner',
            detectedAt: s.createdAt,
            origin: 'Scanner',
            category: 'Vulnerabilidad de Sistema',
            raw: s,
          })
        })

      // Sort: CRITICAL first, then HIGH
      items.sort((a, b) => (SEVERITY_CONFIG[b.severity]?.weight || 0) - (SEVERITY_CONFIG[a.severity]?.weight || 0))
      setSuggestions(items)
    } catch (e) { console.error(e) }
    finally { setLoadingSuggestions(false) }
  }

  const loadAvailableVulns = async () => {
    setLoadingVulns(true)
    try {
      const [critRes, highRes, medRes] = await Promise.all([
        fetch('/api/vulnerabilities?severity=CRITICAL').then(r => r.json()).catch(() => ({ vulnerabilities: [] })),
        fetch('/api/vulnerabilities?severity=HIGH').then(r => r.json()).catch(() => ({ vulnerabilities: [] })),
        fetch('/api/vulnerabilities?severity=MEDIUM').then(r => r.json()).catch(() => ({ vulnerabilities: [] })),
      ])
      setAvailableVulns([...(critRes.vulnerabilities || []), ...(highRes.vulnerabilities || []), ...(medRes.vulnerabilities || [])])
    } catch { setAvailableVulns([]) }
    finally { setLoadingVulns(false) }
  }

  // ─── CRUD ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingIncident ? `/api/incidents/${editingIncident.id}` : '/api/incidents'
      const res = await fetch(url, {
        method: editingIncident ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setShowForm(false)
      setEditingIncident(null)
      resetForm()
      loadIncidents()
    } catch { alert('Error al guardar el incidente') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este incidente?')) return
    try { await fetch(`/api/incidents/${id}`, { method: 'DELETE' }); loadIncidents() } catch {}
  }

  const handleEdit = (inc: any) => {
    setEditingIncident(inc)
    setForm({
      title: inc.title, description: inc.description, severity: inc.severity,
      category: inc.category, origin: inc.origin || 'Manual',
      affectedSystems: inc.affectedSystems || '', assignedTo: inc.assignedTo || '',
      notes: inc.notes || '', immediateActions: inc.immediateActions || '',
      linkedVulnerabilityId: inc.linkedVulnerabilityId || '',
      impactFinancial: inc.impactFinancial || 'MEDIUM',
      impactOperational: inc.impactOperational || 'MEDIUM', impactReputational: inc.impactReputational || 'MEDIUM',
      evidences: inc.evidences || [], actions: inc.actions || [],
    })
    if (inc.origin === 'Vulnerabilidad' && availableVulns.length === 0) loadAvailableVulns()
    setShowForm(true)
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/incidents/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadIncidents()
      if (showDetail?.id === id) setShowDetail({ ...showDetail, status })
    } catch {}
  }

  const resetForm = () => {
    setForm({
      title: '', description: '', severity: 'MEDIUM', category: '', origin: 'Manual',
      affectedSystems: '', assignedTo: '', notes: '', immediateActions: '', linkedVulnerabilityId: '',
      impactFinancial: 'MEDIUM', impactOperational: 'MEDIUM', impactReputational: 'MEDIUM',
      evidences: [], actions: [],
    })
  }

  const createFromSuggestion = (sug: any) => {
    setForm({
      ...form,
      title: `Incidente: ${sug.title}`,
      description: sug.description,
      severity: sug.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      category: sug.category || 'Vulnerabilidad de Sistema',
      origin: sug.origin || 'Vulnerabilidad',
      affectedSystems: sug.assetName || '',
      linkedVulnerabilityId: sug.type === 'vulnerability' ? (sug.raw?.id || '') : '',
    })
    if (sug.origin === 'Vulnerabilidad' && availableVulns.length === 0) loadAvailableVulns()
    setShowSuggested(false)
    setShowForm(true)
  }

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  // ─── Computed ─────────────────────────────────────────────────
  const filtered = useMemo(() =>
    incidents.filter(i =>
      (filterStatus === 'ALL' || i.status === filterStatus) &&
      (i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       i.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [incidents, filterStatus, searchTerm])

  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(i => i.status === 'OPEN').length,
    inProgress: incidents.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    closed: incidents.filter(i => i.status === 'CLOSED').length,
    slaExceeded: incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED' && getSLAInfo(i).exceeded).length,
    bySeverity: {
      CRITICAL: incidents.filter(i => i.severity === 'CRITICAL').length,
      HIGH: incidents.filter(i => i.severity === 'HIGH').length,
      MEDIUM: incidents.filter(i => i.severity === 'MEDIUM').length,
      LOW: incidents.filter(i => i.severity === 'LOW').length,
    },
  }), [incidents])

  const severityChartData = [
    { name: 'Críticas', value: stats.bySeverity.CRITICAL, fill: '#ef4444' },
    { name: 'Altas', value: stats.bySeverity.HIGH, fill: '#f97316' },
    { name: 'Medias', value: stats.bySeverity.MEDIUM, fill: '#eab308' },
    { name: 'Bajas', value: stats.bySeverity.LOW, fill: '#3b82f6' },
  ]

  const statusChartData = [
    { name: 'Abiertos', value: stats.open, fill: '#ef4444' },
    { name: 'En progreso', value: stats.inProgress, fill: '#eab308' },
    { name: 'Resueltos', value: stats.resolved, fill: '#22c55e' },
    { name: 'Cerrados', value: stats.closed, fill: '#6b7280' },
  ]

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            Gestión de Incidentes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Registro, seguimiento y resolución · ISO 27001: A.5.24 – A.5.26
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setShowSuggested(true); loadSuggestions() }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm">
            <Zap className="h-4 w-4" />Incidentes Sugeridos
          </button>
          <button onClick={() => { resetForm(); setEditingIncident(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">
            <Plus className="h-4 w-4" />Registrar Incidente
          </button>
          <button onClick={loadIncidents} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ════════ STATS CARDS ════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={stats.total} icon={BarChart3} color="text-gray-600" bg="bg-gray-50 dark:bg-gray-800" />
        <StatCard label="Abiertos" value={stats.open} icon={AlertCircle} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
        <StatCard label="En Progreso" value={stats.inProgress} icon={Clock} color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-900/20" />
        <StatCard label="Resueltos" value={stats.resolved} icon={CheckCircle} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard label="Cerrados" value={stats.closed} icon={XCircle} color="text-gray-500" bg="bg-gray-50 dark:bg-gray-800" />
        <StatCard label="SLA Excedido" value={stats.slaExceeded} icon={Timer} color={stats.slaExceeded > 0 ? 'text-red-600' : 'text-green-600'} bg={stats.slaExceeded > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'} />
      </div>

      {/* ════════ CHARTS ════════ */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Flame className="h-4 w-4 text-red-500" />Por severidad</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="45%" height={150}>
                <PieChart><Pie data={severityChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={2}>
                  {severityChartData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">{severityChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>
              ))}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-500" />Por estado</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={statusChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" fontSize={11} stroke="#6b7280" /><YAxis fontSize={11} stroke="#6b7280" allowDecimals={false} />
                <Tooltip /><Bar dataKey="value" radius={[4, 4, 0, 0]}>{statusChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ════════ FILTERS ════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar incidentes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <FilterBtn label="Todos" active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <FilterBtn key={key} label={cfg.label} active={filterStatus === key} onClick={() => setFilterStatus(key)} dot={cfg.dot} />
            ))}
          </div>
          <span className="text-xs text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ════════ INCIDENTS TABLE ════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Registro de Incidentes</h3>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-1">No hay incidentes</h3>
            <p className="text-gray-500 text-sm mb-4">Registra un incidente manualmente o revisa las sugerencias automáticas</p>
            <button onClick={() => { setShowSuggested(true); loadSuggestions() }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm">
              <Zap className="h-4 w-4" />Ver sugerencias
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(inc => {
              const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.MEDIUM
              const st = STATUS_CONFIG[inc.status] || STATUS_CONFIG.OPEN
              const StIcon = st.icon
              const sla = getSLAInfo(inc)
              const isActive = inc.status !== 'CLOSED' && inc.status !== 'RESOLVED'
              return (
                <div key={inc.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Severity dot */}
                    <div className={`w-2.5 h-2.5 rounded-full ${sev.bg} mt-2 flex-shrink-0`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{inc.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sev.color}`}>{sev.icon} {sev.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${st.color}`}>{st.label}</span>
                        {isActive && sla.exceeded && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                            <Timer className="h-3 w-3" />SLA excedido
                          </span>
                        )}
                        {isActive && !sla.exceeded && sla.pct > 75 && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <Timer className="h-3 w-3" />{sla.remaining.toFixed(1)}h
                          </span>
                        )}
                        {inc.origin && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">· Origen: {inc.origin}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5">{inc.description}</p>
                      <div className="flex gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                        {inc.category && <span>{inc.category}</span>}
                        {inc.assignedTo && <span>👤 {inc.assignedTo}</span>}
                        <span>📅 {fmtDate(inc.detectedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => setShowDetail(inc)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Ver detalle"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(inc)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(inc.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ════════ SUGGESTED INCIDENTS MODAL ════════ */}
      {showSuggested && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[5vh] overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowSuggested(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />⚠ Incidentes detectados automáticamente
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Origen: Vulnerabilidades / SIEM / Amenazas / Escaneos</p>
                </div>
                <button onClick={() => setShowSuggested(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
              {/* Source legend */}
              <div className="flex gap-4 mt-3 flex-wrap">
                {Object.entries(SOURCE_ICONS).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  const count = suggestions.filter(s => s.type === key).length
                  return (
                    <span key={key} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />{cfg.label}: <strong>{count}</strong>
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {loadingSuggestions ? (
                <div className="py-12 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Analizando módulos conectados...</div>
              ) : suggestions.length === 0 ? (
                <div className="py-12 text-center">
                  <Shield className="h-14 w-14 mx-auto mb-3 text-green-400 opacity-60" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Sin incidentes sugeridos</h3>
                  <p className="text-sm text-gray-500 mt-1">No se detectaron elementos críticos en los módulos conectados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map(sug => {
                    const sev = SEVERITY_CONFIG[sug.severity] || SEVERITY_CONFIG.MEDIUM
                    const srcCfg = SOURCE_ICONS[sug.type] || SOURCE_ICONS.vulnerability
                    const SrcIcon = srcCfg.icon
                    return (
                      <div key={sug.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              sug.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                            }`}>
                              <SrcIcon className={`h-5 w-5 ${srcCfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{sug.title}</h4>
                                {sug.cveId && <span className="text-[11px] text-indigo-600 dark:text-indigo-400">{sug.cveId}</span>}
                              </div>
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sev.color}`}>Severidad: {sev.label}</span>
                                <span className="text-[11px] text-gray-500 flex items-center gap-1"><SrcIcon className={`h-3 w-3 ${srcCfg.color}`} />Detectado: {srcCfg.label}</span>
                                {sug.assetName && <span className="text-[11px] text-gray-500">📍 {sug.assetName}</span>}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{sug.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 ml-[52px]">
                            <button onClick={() => createFromSuggestion(sug)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5">
                              <Plus className="h-3.5 w-3.5" />Crear incidente
                            </button>
                            <button onClick={() => dismissSuggestion(sug.id)}
                              className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              Descartar
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {suggestions.length > 0 && !loadingSuggestions && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <p className="text-[11px] text-gray-500">
                  💡 Los incidentes sugeridos se generan a partir de vulnerabilidades críticas/altas abiertas, eventos SIEM de alta severidad, amenazas activas y escaneos con puntuación baja.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ FORM MODAL (Registrar / Editar) ════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditingIncident(null); resetForm() } }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full shadow-2xl mb-8">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-6 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    {editingIncident ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Complete todos los campos según ISO 27001 — Procedimiento de gestión de incidentes</p>
                </div>
                <button onClick={() => { setShowForm(false); setEditingIncident(null); resetForm() }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
              {/* ── 1. ORIGEN Y CLASIFICACIÓN ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">1</span>
                  Origen y Clasificación
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {ORIGIN_OPTIONS.filter(o => o.value !== 'Scanner').map(o => {
                    const OIcon = o.icon
                    const isSelected = form.origin === o.value
                    return (
                      <label key={o.value} className={`cursor-pointer flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                        <input type="radio" name="origin" value={o.value} checked={isSelected} onChange={e => { setForm({ ...form, origin: e.target.value }); if (e.target.value === 'Vulnerabilidad' && availableVulns.length === 0) loadAvailableVulns() }} className="sr-only" />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-red-100 dark:bg-red-800/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <OIcon className={`h-4 w-4 ${isSelected ? 'text-red-600' : 'text-gray-500'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>{o.label}</span>
                      </label>
                    )
                  })}
                </div>
                {form.origin === 'Vulnerabilidad' && (
                  <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800/30">
                    <label className="block text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5" />Vulnerabilidad asociada
                    </label>
                    <div className="flex gap-2">
                      <select value={form.linkedVulnerabilityId} onChange={e => setForm({ ...form, linkedVulnerabilityId: e.target.value })}
                        className="flex-1 px-3 py-2.5 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500">
                        <option value="">{loadingVulns ? 'Cargando vulnerabilidades...' : 'Seleccionar vulnerabilidad...'}</option>
                        {availableVulns.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.severity === 'CRITICAL' ? '🚨' : v.severity === 'HIGH' ? '🔥' : '⚠️'} {v.title} {v.cveId ? `(${v.cveId})` : ''}</option>
                        ))}
                      </select>
                      {form.linkedVulnerabilityId && (
                        <Link href="/dashboard/vulnerabilities" target="_blank"
                          className="px-3 py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />Ver
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Severidad <span className="text-red-500">*</span></label>
                    <select required value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500">
                      {Object.entries(SEVERITY_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Categoría <span className="text-red-500">*</span></label>
                    <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500">
                      <option value="">Seleccionar...</option>
                      {INCIDENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 2. DESCRIPCIÓN DEL INCIDENTE ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">2</span>
                  Descripción del Incidente
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Título <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Ej: Intento de acceso no autorizado detectado en servidor principal"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Descripción detallada <span className="text-red-500">*</span></label>
                    <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3} placeholder="Describa qué ocurrió, cómo fue detectado y el contexto del incidente..."
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 resize-none" />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 3. ACTIVOS AFECTADOS ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">3</span>
                  Activos y Sistemas Afectados
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Sistema / Activo principal</label>
                  <input type="text" list="assets-list" value={form.affectedSystems} onChange={e => setForm({ ...form, affectedSystems: e.target.value })}
                    placeholder="Seleccionar o escribir sistema afectado..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500" />
                  <datalist id="assets-list">
                    {ASSET_SYSTEMS.map(a => <option key={a} value={a} />)}
                  </datalist>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 4. EVALUACIÓN DE IMPACTO ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">4</span>
                  Evaluación de Impacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { key: 'impactFinancial', label: 'Financiero', emoji: '💰', desc: 'Pérdidas monetarias' },
                    { key: 'impactOperational', label: 'Operacional', emoji: '⚙️', desc: 'Afectación a operaciones' },
                    { key: 'impactReputational', label: 'Reputacional', emoji: '📢', desc: 'Daño a la imagen' },
                  ].map(imp => {
                    const val = (form as any)[imp.key]
                    const impColor = val === 'HIGH' ? 'border-red-300 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800/40' : val === 'MEDIUM' ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-800/40' : 'border-green-300 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800/40'
                    return (
                      <div key={imp.key} className={`p-4 rounded-xl border-2 transition-all ${impColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{imp.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{imp.label}</p>
                            <p className="text-[10px] text-gray-500">{imp.desc}</p>
                          </div>
                        </div>
                        <select value={val} onChange={e => setForm({ ...form, [imp.key]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500">
                          <option value="LOW">🟢 Bajo</option>
                          <option value="MEDIUM">🟡 Medio</option>
                          <option value="HIGH">🔴 Alto</option>
                        </select>
                      </div>
                    )
                  })}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 5. GESTIÓN Y SLA ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">5</span>
                  Gestión y SLA
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><User className="h-3.5 w-3.5" />Responsable asignado</label>
                    <input type="text" list="responsible-list" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                      placeholder="Seleccionar o escribir responsable..."
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500" />
                    <datalist id="responsible-list">
                      {RESPONSIBLE_OPTIONS.map(r => <option key={r} value={r} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Timer className="h-3.5 w-3.5" />SLA de resolución</label>
                    {editingIncident ? (() => {
                      const sla = getSLAInfo(editingIncident)
                      return (
                        <div className={`p-3 rounded-xl border-2 ${sla.exceeded ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : sla.pct > 75 ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : 'border-green-300 bg-green-50 dark:bg-green-900/20'}`}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Objetivo: {sla.total}h</span>
                            <span className={`text-xs font-bold ${sla.exceeded ? 'text-red-600' : sla.pct > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {sla.exceeded ? '⚠️ EXCEDIDO' : `${sla.remaining.toFixed(1)}h restantes`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${sla.exceeded ? 'bg-red-500' : sla.pct > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(100, sla.pct)}%` }} />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">Transcurrido: {sla.elapsed.toFixed(1)}h de {sla.total}h</p>
                        </div>
                      )
                    })() : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{SLA_HOURS[form.severity] || 24}h</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            form.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {form.severity === 'CRITICAL' ? 'Urgente' : form.severity === 'HIGH' ? 'Prioritario' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 6. ACCIONES INMEDIATAS ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">6</span>
                  Acciones Inmediatas
                </h3>
                <textarea value={form.immediateActions} onChange={e => setForm({ ...form, immediateActions: e.target.value })}
                  rows={3} placeholder="Contención, aislamiento de sistemas, notificaciones realizadas, medidas de respuesta..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 resize-none" />
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 7. EVIDENCIAS ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">7</span>
                  Evidencias y Documentación
                </h3>
                {form.evidences.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.evidences.map((ev, i) => {
                      const evStyle = getEvidenceStyle(ev)
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 ${evStyle.bg} transition-colors`}>
                          <span className="text-lg flex-shrink-0">{evStyle.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ev}</p>
                            <p className="text-[10px] text-gray-500">{evStyle.label}</p>
                          </div>
                          <button type="button" onClick={() => setForm({ ...form, evidences: form.evidences.filter((_, idx) => idx !== i) })}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" id="evidence-input" placeholder="Nombre de archivo o URL — Enter para agregar (ej: log_siem.pdf, captura.png)"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const val = (e.target as HTMLInputElement).value.trim()
                          if (val) { setForm({ ...form, evidences: [...form.evidences, val] }); (e.target as HTMLInputElement).value = '' }
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <button type="button" onClick={() => {
                    const input = document.getElementById('evidence-input') as HTMLInputElement
                    const val = input?.value?.trim()
                    if (val) { setForm({ ...form, evidences: [...form.evidences, val] }); input.value = '' }
                  }}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-1.5">
                    <Upload className="h-4 w-4" />Adjuntar
                  </button>
                </div>
              </section>

              {/* ── 8. TIMELINE (editing only) ── */}
              {editingIncident && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">8</span>
                      Línea de Tiempo
                    </h3>
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
                      <div className="relative flex items-start gap-3">
                        <div className="absolute left-[-17px] w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 z-10" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Incidente detectado</p>
                          <p className="text-[11px] text-gray-500">{fmtDateTime(editingIncident.detectedAt)}</p>
                        </div>
                      </div>
                      {editingIncident.createdAt && editingIncident.createdAt !== editingIncident.detectedAt && (
                        <div className="relative flex items-start gap-3">
                          <div className="absolute left-[-17px] w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 z-10" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Registrado en sistema</p>
                            <p className="text-[11px] text-gray-500">{fmtDateTime(editingIncident.createdAt)}</p>
                          </div>
                        </div>
                      )}
                      {editingIncident.assignedTo && (
                        <div className="relative flex items-start gap-3">
                          <div className="absolute left-[-17px] w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900 z-10" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Asignado a {editingIncident.assignedTo}</p>
                            <p className="text-[11px] text-gray-500">{fmtDateTime(editingIncident.updatedAt || editingIncident.createdAt)}</p>
                          </div>
                        </div>
                      )}
                      {editingIncident.status !== 'OPEN' && (
                        <div className="relative flex items-start gap-3">
                          <div className={`absolute left-[-17px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 z-10 ${
                            editingIncident.status === 'IN_PROGRESS' ? 'bg-yellow-500' : editingIncident.status === 'RESOLVED' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Estado: {(STATUS_CONFIG[editingIncident.status] || STATUS_CONFIG.OPEN).label}</p>
                            <p className="text-[11px] text-gray-500">{fmtDateTime(editingIncident.updatedAt || editingIncident.createdAt)}</p>
                          </div>
                        </div>
                      )}
                      {editingIncident.resolvedAt && (
                        <div className="relative flex items-start gap-3">
                          <div className="absolute left-[-17px] w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 z-10" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Incidente resuelto</p>
                            <p className="text-[11px] text-gray-500">{fmtDateTime(editingIncident.resolvedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── NOTAS ADICIONALES ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold">{editingIncident ? '9' : '8'}</span>
                  Notas Adicionales
                </h3>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Observaciones, contexto adicional, lecciones aprendidas..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 resize-none" />
              </section>

              {/* Actions */}
              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : editingIncident ? <><Edit className="h-4 w-4" />Actualizar Incidente</> : <><Plus className="h-4 w-4" />Registrar Incidente</>}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingIncident(null); resetForm() }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ DETAIL MODAL ════════ */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowDetail(null) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full shadow-2xl mb-8">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${(SEVERITY_CONFIG[showDetail.severity] || SEVERITY_CONFIG.MEDIUM).color}`}>
                      {(SEVERITY_CONFIG[showDetail.severity] || SEVERITY_CONFIG.MEDIUM).icon} {(SEVERITY_CONFIG[showDetail.severity] || SEVERITY_CONFIG.MEDIUM).label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${(STATUS_CONFIG[showDetail.status] || STATUS_CONFIG.OPEN).color}`}>
                      {(STATUS_CONFIG[showDetail.status] || STATUS_CONFIG.OPEN).label}
                    </span>
                    {showDetail.origin && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Origen: {showDetail.origin}</span>}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{showDetail.title}</h2>
                </div>
                <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Content */}
            <div className="px-7 py-6 space-y-6">
              {/* Description */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Descripción</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{showDetail.description}</p>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* SLA */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1"><Timer className="h-3.5 w-3.5" />Control SLA</h4>
                {(() => {
                  const sla = getSLAInfo(showDetail)
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 dark:text-gray-400">SLA: {sla.total}h</span>
                        <span className={`font-semibold ${sla.exceeded ? 'text-red-600' : 'text-green-600'}`}>
                          {sla.exceeded ? '⚠️ SLA EXCEDIDO' : `${sla.remaining.toFixed(1)}h restantes`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${sla.exceeded ? 'bg-red-500' : sla.pct > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, sla.pct)}%` }} />
                      </div>
                    </div>
                  )
                })()}
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Impact */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Evaluación de impacto</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '💰 Financiero', value: showDetail.impactFinancial },
                    { label: '⚙️ Operacional', value: showDetail.impactOperational },
                    { label: '📢 Reputacional', value: showDetail.impactReputational },
                  ].map(item => (
                    <div key={item.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-[11px] text-gray-500 mb-0.5">{item.label}</p>
                      <p className={`font-bold text-sm ${item.value === 'HIGH' ? 'text-red-600' : item.value === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.value === 'HIGH' ? 'Alto' : item.value === 'MEDIUM' ? 'Medio' : item.value === 'LOW' ? 'Bajo' : item.value || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Info */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Información general</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Categoría:</span> {showDetail.category || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Responsable:</span> {showDetail.assignedTo || 'Sin asignar'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Sistemas:</span> {showDetail.affectedSystems || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Detectado:</span> {fmtDateTime(showDetail.detectedAt)}</p>
                  {showDetail.resolvedAt && <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Resuelto:</span> {fmtDateTime(showDetail.resolvedAt)}</p>}
                </div>
              </section>

              {/* Evidences */}
              {showDetail.evidences?.length > 0 && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Evidencias</h4>
                    <ul className="space-y-1">
                      {showDetail.evidences.map((ev: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <span className="text-gray-400 select-none">•</span>{ev}
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Timeline */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Historial</h4>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-gray-400 select-none">•</span>
                    {fmtDateTime(showDetail.detectedAt)} — Incidente detectado
                  </li>
                  {showDetail.status !== 'OPEN' && (
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      Estado cambiado a &quot;{(STATUS_CONFIG[showDetail.status] || STATUS_CONFIG.OPEN).label}&quot;
                    </li>
                  )}
                  {showDetail.resolvedAt && (
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      {fmtDateTime(showDetail.resolvedAt)} — Incidente resuelto
                    </li>
                  )}
                  {showDetail.closedAt && (
                    <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">•</span>
                      {fmtDateTime(showDetail.closedAt)} — Incidente cerrado
                    </li>
                  )}
                </ul>
              </section>

              {/* Notes */}
              {showDetail.notes && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Notas</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{showDetail.notes}</p>
                  </section>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => handleUpdateStatus(showDetail.id, 'IN_PROGRESS')} disabled={showDetail.status === 'IN_PROGRESS'}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                  🔄 En progreso
                </button>
                <button onClick={() => handleUpdateStatus(showDetail.id, 'RESOLVED')} disabled={showDetail.status === 'RESOLVED' || showDetail.status === 'CLOSED'}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                  ✅ Resolver
                </button>
                <button onClick={() => handleUpdateStatus(showDetail.id, 'CLOSED')} disabled={showDetail.status === 'CLOSED'}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                  Cerrar
                </button>
                <button onClick={() => { handleEdit(showDetail); setShowDetail(null) }}
                  className="flex-1 min-w-[120px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  ✏️ Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: any; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        </div>
        <Icon className={`h-6 w-6 ${color} opacity-80`} />
      </div>
    </div>
  )
}

function FilterBtn({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}>
      {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
      {label}
    </button>
  )
}
