'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Network, Plus, Search, Building2, Globe, Shield, AlertTriangle,
  Database, Server, Cloud, CreditCard, Truck, Users, Edit,
  Trash2, Eye, FileText, CheckCircle2, XCircle, Clock, X,
  Link2, ExternalLink, RefreshCw, Download,
  BarChart3, TrendingUp, MapPin, Mail, Calendar, Loader2, ChevronRight,
  Lock, Activity, ArrowUpRight, Minus
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid
} from 'recharts'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const VENDOR_TYPES: Record<string, { name: string; icon: any; color: string; bg: string }> = {
  cloud:         { name: 'Cloud / SaaS',            icon: Cloud,      color: 'text-blue-600',   bg: 'bg-blue-500' },
  it_services:   { name: 'Servicios IT',            icon: Server,     color: 'text-purple-600', bg: 'bg-purple-500' },
  software:      { name: 'Software',                icon: Database,   color: 'text-cyan-600',   bg: 'bg-cyan-500' },
  financial:     { name: 'Financiero',              icon: CreditCard, color: 'text-green-600',  bg: 'bg-green-500' },
  logistics:     { name: 'Logística',               icon: Truck,      color: 'text-orange-600', bg: 'bg-orange-500' },
  professional:  { name: 'Servicios Profesionales', icon: Users,      color: 'text-pink-600',   bg: 'bg-pink-500' },
  telecom:       { name: 'Telecomunicaciones',      icon: Network,    color: 'text-indigo-600', bg: 'bg-indigo-500' },
  other:         { name: 'Otros',                   icon: Building2,  color: 'text-gray-600',   bg: 'bg-gray-500' },
}

const CRITICALITY: Record<string, { label: string; color: string; bg: string; fill: string; weight: number }> = {
  CRITICAL: { label: 'Crítico',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',       bg: 'bg-red-500',    fill: '#ef4444', weight: 4 },
  HIGH:     { label: 'Alto',     color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', bg: 'bg-orange-500', fill: '#f97316', weight: 3 },
  MEDIUM:   { label: 'Medio',    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', bg: 'bg-yellow-500', fill: '#eab308', weight: 2 },
  LOW:      { label: 'Bajo',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',   bg: 'bg-green-500',  fill: '#22c55e', weight: 1 },
}

const COMPLIANCE_STATUS: Record<string, { label: string; color: string; icon: any; dot: string }> = {
  COMPLIANT:      { label: 'Cumple',      color: 'text-green-600',  icon: CheckCircle2, dot: 'bg-green-500' },
  NON_COMPLIANT:  { label: 'No Cumple',   color: 'text-red-600',    icon: XCircle,      dot: 'bg-red-500' },
  UNDER_REVIEW:   { label: 'En Revisión', color: 'text-yellow-600', icon: Clock,        dot: 'bg-yellow-500' },
  UNKNOWN:        { label: 'Desconocido', color: 'text-gray-500',   icon: Minus,        dot: 'bg-gray-400' },
}

const CONNECTION_TYPES = [
  { id: 'api',       name: 'API REST/SOAP',        desc: 'Integración vía API' },
  { id: 'vpn',       name: 'VPN Site-to-Site',      desc: 'Conexión privada' },
  { id: 'sftp',      name: 'SFTP/FTP',              desc: 'Transferencia archivos' },
  { id: 'database',  name: 'Conexión BD',           desc: 'Acceso directo BD' },
  { id: 'web',       name: 'Portal Web',            desc: 'Acceso navegador' },
  { id: 'saas',      name: 'SaaS Cloud',            desc: 'Servicio en la nube' },
  { id: 'onpremise', name: 'On-Premise',            desc: 'Instalación local' },
  { id: 'none',      name: 'Sin conexión directa',  desc: 'Intercambio manual' },
]

const DATA_TYPES = [
  { id: 'pii',         name: 'Datos Personales (PII)',    sensitive: true },
  { id: 'financial',   name: 'Datos Financieros',         sensitive: true },
  { id: 'health',      name: 'Datos de Salud (PHI)',      sensitive: true },
  { id: 'credentials', name: 'Credenciales/Accesos',      sensitive: true },
  { id: 'business',    name: 'Información de Negocio',    sensitive: false },
  { id: 'public',      name: 'Información Pública',       sensitive: false },
  { id: 'technical',   name: 'Datos Técnicos',            sensitive: false },
  { id: 'none',        name: 'Sin acceso a datos',        sensitive: false },
]

const CERTIFICATIONS = [
  'ISO 27001', 'ISO 27017', 'ISO 27018', 'SOC 2 Type I', 'SOC 2 Type II',
  'PCI DSS', 'HIPAA', 'GDPR', 'CSA STAR', 'FedRAMP', 'Ley 21.663',
]

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════

const INITIAL_VENDORS = [
  {
    id: '1', vendorName: 'Amazon Web Services', vendorType: 'cloud', connectionType: 'api',
    dataTypes: ['business', 'technical', 'pii'], criticality: 'CRITICAL', riskScore: 25, securityRating: 'A',
    systemAccess: true, dataAccess: true, certifications: ['ISO 27001', 'SOC 2 Type II', 'PCI DSS', 'CSA STAR'],
    contractValue: 50000, contractEnd: '2027-12-31', lastAssessment: '2026-01-10', nextAssessment: '2026-07-10',
    complianceStatus: 'COMPLIANT', geographicLocation: 'Estados Unidos', contactName: 'Enterprise Support',
    contactEmail: 'aws-support@amazon.com', notes: 'Proveedor principal de infraestructura cloud. Servicios: EC2, S3, RDS, Lambda.',
  },
  {
    id: '2', vendorName: 'Microsoft 365', vendorType: 'software', connectionType: 'saas',
    dataTypes: ['pii', 'business', 'credentials'], criticality: 'CRITICAL', riskScore: 30, securityRating: 'A',
    systemAccess: true, dataAccess: true, certifications: ['ISO 27001', 'SOC 2 Type II', 'GDPR'],
    contractValue: 25000, contractEnd: '2026-12-31', lastAssessment: '2025-11-15', nextAssessment: '2026-05-15',
    complianceStatus: 'COMPLIANT', geographicLocation: 'Estados Unidos / Chile', contactName: 'Account Manager',
    contactEmail: 'soporte@microsoft.com', notes: 'Suite de productividad corporativa. Incluye email, Teams, SharePoint, OneDrive.',
  },
  {
    id: '3', vendorName: 'Banco Santander', vendorType: 'financial', connectionType: 'api',
    dataTypes: ['financial', 'pii'], criticality: 'HIGH', riskScore: 35, securityRating: 'A',
    systemAccess: false, dataAccess: true, certifications: ['PCI DSS', 'ISO 27001'],
    contractValue: 15000, contractEnd: '2026-06-30', lastAssessment: '2025-12-20', nextAssessment: '2026-06-20',
    complianceStatus: 'COMPLIANT', geographicLocation: 'Chile', contactName: 'Ejecutivo Empresas',
    contactEmail: 'empresas@santander.cl', notes: 'Banco principal para operaciones. API para conciliación bancaria automática.',
  },
  {
    id: '4', vendorName: 'Empresa de Limpieza ABC', vendorType: 'professional', connectionType: 'none',
    dataTypes: ['none'], criticality: 'LOW', riskScore: 15, securityRating: null as string | null,
    systemAccess: false, dataAccess: false, certifications: [] as string[],
    contractValue: 5000, contractEnd: '2026-12-31', lastAssessment: null as string | null, nextAssessment: null as string | null,
    complianceStatus: 'UNKNOWN', geographicLocation: 'Chile', contactName: 'Supervisor',
    contactEmail: 'contacto@limpiezaabc.cl', notes: 'Servicio de aseo de oficinas. Sin acceso a sistemas ni información.',
  },
  {
    id: '5', vendorName: 'DataCenter Chile', vendorType: 'it_services', connectionType: 'vpn',
    dataTypes: ['technical', 'credentials'], criticality: 'HIGH', riskScore: 45, securityRating: 'B',
    systemAccess: true, dataAccess: true, certifications: ['ISO 27001', 'Ley 21.663'],
    contractValue: 35000, contractEnd: '2027-03-31', lastAssessment: '2025-10-01', nextAssessment: '2026-04-01',
    complianceStatus: 'UNDER_REVIEW', geographicLocation: 'Chile', contactName: 'Soporte Técnico',
    contactEmail: 'soporte@datacenter.cl', notes: 'Colocation de servidores on-premise. VPN permanente para administración.',
  },
  {
    id: '6', vendorName: 'Consultora Legal Partners', vendorType: 'professional', connectionType: 'web',
    dataTypes: ['pii', 'business'], criticality: 'MEDIUM', riskScore: 55, securityRating: 'C',
    systemAccess: false, dataAccess: true, certifications: [] as string[],
    contractValue: 20000, contractEnd: '2026-08-31', lastAssessment: '2025-08-15', nextAssessment: '2026-02-15',
    complianceStatus: 'NON_COMPLIANT', geographicLocation: 'Chile', contactName: 'Abogado Principal',
    contactEmail: 'contacto@legalpartners.cl', notes: 'Asesoría legal corporativa. Acceso a documentos confidenciales vía portal.',
  },
]

type Vendor = typeof INITIAL_VENDORS[0]

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fmtDate(d: string | null) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getRiskColor(score: number) {
  if (score >= 70) return 'text-red-600'
  if (score >= 50) return 'text-orange-600'
  if (score >= 30) return 'text-yellow-600'
  return 'text-green-600'
}

function getRiskBg(score: number) {
  if (score >= 70) return 'bg-red-500'
  if (score >= 50) return 'bg-orange-500'
  if (score >= 30) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getRatingColor(rating: string | null) {
  if (rating === 'A') return 'text-green-600 bg-green-50 dark:bg-green-900/20'
  if (rating === 'B') return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
  if (rating === 'C') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
  if (rating === 'D') return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
  if (rating === 'F') return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  return 'text-gray-400 bg-gray-50 dark:bg-gray-800'
}

function getRatingFromScore(score: number) {
  if (score <= 25) return 'A'
  if (score <= 40) return 'B'
  if (score <= 60) return 'C'
  if (score <= 80) return 'D'
  return 'F'
}

function calculateRiskScore(fd: any) {
  let score = 20
  if (fd.criticality === 'CRITICAL') score += 25
  else if (fd.criticality === 'HIGH') score += 15
  else if (fd.criticality === 'MEDIUM') score += 8
  if (fd.systemAccess) score += 15
  if (fd.dataAccess) score += 10
  const sensitiveCount = (fd.dataTypes || []).filter((d: string) => DATA_TYPES.find(dt => dt.id === d)?.sensitive).length
  score += sensitiveCount * 8
  score -= (fd.certifications || []).length * 5
  return Math.max(0, Math.min(100, score))
}

function daysUntil(date: string | null) {
  if (!date) return null
  const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return Math.ceil(diff)
}

function exportToCSV(vendors: Vendor[]) {
  const headers = [
    'Proveedor', 'Tipo', 'Criticidad', 'Risk Score', 'Rating', 'Cumplimiento',
    'Conexión', 'Acceso Sistemas', 'Acceso Datos', 'Datos Compartidos',
    'Certificaciones', 'Valor Contrato (USD)', 'Fin Contrato',
    'Última Evaluación', 'Próxima Evaluación', 'Ubicación',
    'Contacto', 'Email', 'Notas'
  ]

  const rows = vendors.map(v => [
    v.vendorName,
    VENDOR_TYPES[v.vendorType]?.name || v.vendorType,
    CRITICALITY[v.criticality]?.label || v.criticality,
    v.riskScore,
    v.securityRating || 'N/A',
    COMPLIANCE_STATUS[v.complianceStatus]?.label || v.complianceStatus,
    CONNECTION_TYPES.find(c => c.id === v.connectionType)?.name || v.connectionType,
    v.systemAccess ? 'Sí' : 'No',
    v.dataAccess ? 'Sí' : 'No',
    v.dataTypes.map(dt => DATA_TYPES.find(d => d.id === dt)?.name || dt).join('; '),
    v.certifications.join('; '),
    v.contractValue,
    v.contractEnd || '',
    v.lastAssessment || '',
    v.nextAssessment || '',
    v.geographicLocation || '',
    v.contactName || '',
    v.contactEmail || '',
    (v.notes || '').replace(/"/g, '""'),
  ])

  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `proveedores_terceros_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ThirdPartyPage() {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL')
  const [filterCompliance, setFilterCompliance] = useState<string>('ALL')

  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState<Vendor | null>(null)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  const emptyForm = {
    vendorName: '', vendorType: 'cloud', connectionType: 'api',
    dataTypes: [] as string[], criticality: 'MEDIUM', systemAccess: false,
    dataAccess: false, certifications: [] as string[], contractValue: 0,
    contractEnd: '', geographicLocation: '', contactName: '', contactEmail: '', notes: '',
  }
  const [form, setForm] = useState(emptyForm)

  // ── Filtered & Stats ──────────────────────────────────────
  const filtered = useMemo(() =>
    vendors.filter(v =>
      (filterType === 'ALL' || v.vendorType === filterType) &&
      (filterCriticality === 'ALL' || v.criticality === filterCriticality) &&
      (filterCompliance === 'ALL' || v.complianceStatus === filterCompliance) &&
      (v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
       v.notes?.toLowerCase().includes(search.toLowerCase()) ||
       v.contactName?.toLowerCase().includes(search.toLowerCase()))
    ), [vendors, search, filterType, filterCriticality, filterCompliance])

  const stats = useMemo(() => {
    const total = vendors.length
    const critical = vendors.filter(v => v.criticality === 'CRITICAL').length
    const highRisk = vendors.filter(v => v.riskScore >= 50).length
    const nonCompliant = vendors.filter(v => v.complianceStatus === 'NON_COMPLIANT').length
    const withSystemAccess = vendors.filter(v => v.systemAccess).length
    const pendingReview = vendors.filter(v => {
      const d = daysUntil(v.nextAssessment)
      return d !== null && d <= 30
    }).length
    const totalContractValue = vendors.reduce((s, v) => s + (v.contractValue || 0), 0)
    const avgRisk = total > 0 ? Math.round(vendors.reduce((s, v) => s + v.riskScore, 0) / total) : 0
    return { total, critical, highRisk, nonCompliant, withSystemAccess, pendingReview, totalContractValue, avgRisk }
  }, [vendors])

  const critChartData = [
    { name: 'Crítico', value: vendors.filter(v => v.criticality === 'CRITICAL').length, fill: '#ef4444' },
    { name: 'Alto', value: vendors.filter(v => v.criticality === 'HIGH').length, fill: '#f97316' },
    { name: 'Medio', value: vendors.filter(v => v.criticality === 'MEDIUM').length, fill: '#eab308' },
    { name: 'Bajo', value: vendors.filter(v => v.criticality === 'LOW').length, fill: '#22c55e' },
  ]

  const complianceChartData = [
    { name: 'Cumple', value: vendors.filter(v => v.complianceStatus === 'COMPLIANT').length, fill: '#22c55e' },
    { name: 'No cumple', value: vendors.filter(v => v.complianceStatus === 'NON_COMPLIANT').length, fill: '#ef4444' },
    { name: 'En revisión', value: vendors.filter(v => v.complianceStatus === 'UNDER_REVIEW').length, fill: '#eab308' },
    { name: 'Desconocido', value: vendors.filter(v => v.complianceStatus === 'UNKNOWN').length, fill: '#9ca3af' },
  ]

  const riskByTypeData = Object.entries(VENDOR_TYPES).map(([key, cfg]) => {
    const typeVendors = vendors.filter(v => v.vendorType === key)
    return {
      type: cfg.name.split('/')[0].trim().substring(0, 12),
      avgRisk: typeVendors.length > 0 ? Math.round(typeVendors.reduce((s, v) => s + v.riskScore, 0) / typeVendors.length) : 0,
      count: typeVendors.length,
    }
  }).filter(d => d.count > 0)

  // ── CRUD ──────────────────────────────────────────────────
  const handleSubmit = () => {
    setSaving(true)
    setTimeout(() => {
      const riskScore = calculateRiskScore(form)
      const today = new Date().toISOString().split('T')[0]
      const nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      if (editingVendor) {
        setVendors(prev => prev.map(v =>
          v.id === editingVendor.id
            ? { ...v, ...form, riskScore, securityRating: getRatingFromScore(riskScore), complianceStatus: 'UNDER_REVIEW', lastAssessment: today, nextAssessment: nextReview }
            : v
        ))
      } else {
        const newV: Vendor = {
          id: Date.now().toString(), ...form, riskScore,
          securityRating: getRatingFromScore(riskScore),
          lastAssessment: today, nextAssessment: nextReview,
          complianceStatus: 'UNKNOWN',
        }
        setVendors(prev => [newV, ...prev])
      }
      closeForm()
      setSaving(false)
    }, 400)
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return
    setVendors(prev => prev.filter(v => v.id !== id))
    if (showDetail?.id === id) setShowDetail(null)
  }

  const openEdit = (v: Vendor) => {
    setEditingVendor(v)
    setForm({
      vendorName: v.vendorName, vendorType: v.vendorType, connectionType: v.connectionType,
      dataTypes: [...v.dataTypes], criticality: v.criticality, systemAccess: v.systemAccess,
      dataAccess: v.dataAccess, certifications: [...v.certifications], contractValue: v.contractValue,
      contractEnd: v.contractEnd, geographicLocation: v.geographicLocation,
      contactName: v.contactName, contactEmail: v.contactEmail, notes: v.notes || '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingVendor(null)
    setForm(emptyForm)
  }

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      exportToCSV(filtered.length > 0 ? filtered : vendors)
      setExporting(false)
    }, 500)
  }

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="h-8 w-8 text-purple-500" />
            Gestión de Terceros
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Evaluación de riesgo de proveedores y servicios externos · ISO 27001: A.5.19 – A.5.23
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar CSV
          </button>
          <button onClick={() => { setForm(emptyForm); setEditingVendor(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm">
            <Plus className="h-4 w-4" />Agregar Proveedor
          </button>
        </div>
      </div>

      {/* ════════ STATS ════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Network, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Críticos', value: stats.critical, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Alto Riesgo', value: stats.highRisk, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'No Cumplen', value: stats.nonCompliant, icon: XCircle, color: stats.nonCompliant > 0 ? 'text-red-600' : 'text-green-600', bg: stats.nonCompliant > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Con Acceso', value: stats.withSystemAccess, icon: Lock, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Rev. Pendiente', value: stats.pendingReview, icon: Clock, color: stats.pendingReview > 0 ? 'text-yellow-600' : 'text-green-600', bg: stats.pendingReview > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Riesgo Prom.', value: stats.avgRisk, icon: BarChart3, color: getRiskColor(stats.avgRisk), bg: 'bg-gray-50 dark:bg-gray-800' },
          { label: 'Contratos', value: `$${(stats.totalContractValue / 1000).toFixed(0)}K`, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</p>
              </div>
              <s.icon className={`h-5 w-5 ${s.color} opacity-70`} />
            </div>
          </div>
        ))}
      </div>

      {/* ════════ CHARTS ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Criticality pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />Distribución por Criticidad
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={critChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={2}>
                  {critChartData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {critChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />Estado de Cumplimiento
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={complianceChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={2}>
                  {complianceChartData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {complianceChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk by type bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />Riesgo Promedio por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={riskByTypeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" fontSize={10} stroke="#6b7280" />
              <YAxis fontSize={10} stroke="#6b7280" domain={[0, 100]} />
              <Tooltip formatter={(v: number) => [`${v}/100`, 'Riesgo']} />
              <Bar dataKey="avgRisk" radius={[4, 4, 0, 0]}>
                {riskByTypeData.map((e, i) => (
                  <Cell key={i} fill={e.avgRisk >= 50 ? '#f97316' : e.avgRisk >= 30 ? '#eab308' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ════════ FILTERS ════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar proveedores..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="ALL">Todos los tipos</option>
            {Object.entries(VENDOR_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
          <select value={filterCriticality} onChange={e => setFilterCriticality(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="ALL">Toda criticidad</option>
            {Object.entries(CRITICALITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterCompliance} onChange={e => setFilterCompliance(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="ALL">Todo cumplimiento</option>
            {Object.entries(COMPLIANCE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span className="text-xs text-gray-500 whitespace-nowrap">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ════════ VENDORS TABLE ════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Registro de Proveedores</h3>
            <p className="text-xs text-gray-500 mt-0.5">{filtered.length} proveedor{filtered.length !== 1 ? 'es' : ''} registrado{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Network className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-1">No hay proveedores</h3>
            <p className="text-gray-500 text-sm mb-4">
              {search || filterType !== 'ALL' || filterCriticality !== 'ALL' ? 'Ajusta los filtros para ver resultados' : 'Registra tu primer proveedor'}
            </p>
            <button onClick={() => { setForm(emptyForm); setEditingVendor(null); setShowForm(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              <Plus className="h-4 w-4" />Agregar
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(vendor => {
              const vt = VENDOR_TYPES[vendor.vendorType] || VENDOR_TYPES.other
              const VIcon = vt.icon
              const crit = CRITICALITY[vendor.criticality] || CRITICALITY.MEDIUM
              const comp = COMPLIANCE_STATUS[vendor.complianceStatus] || COMPLIANCE_STATUS.UNKNOWN
              const CompIcon = comp.icon
              const daysToReview = daysUntil(vendor.nextAssessment)

              return (
                <div key={vendor.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`w-11 h-11 rounded-xl ${vt.bg} flex items-center justify-center flex-shrink-0`}>
                      <VIcon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{vendor.vendorName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${crit.color}`}>{crit.label}</span>
                        <span className={`flex items-center gap-1 text-[11px] ${comp.color}`}>
                          <CompIcon className="h-3 w-3" />{comp.label}
                        </span>
                        {vendor.systemAccess && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 flex items-center gap-0.5">
                            <Server className="h-2.5 w-2.5" />Sistema
                          </span>
                        )}
                        {vendor.dataAccess && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-0.5">
                            <Database className="h-2.5 w-2.5" />Datos
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        {vt.name} · {CONNECTION_TYPES.find(c => c.id === vendor.connectionType)?.name}
                        {vendor.geographicLocation && ` · 📍 ${vendor.geographicLocation}`}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {vendor.dataTypes.filter(dt => dt !== 'none').slice(0, 3).map((dt, i) => {
                          const dtInfo = DATA_TYPES.find(d => d.id === dt)
                          return (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${
                              dtInfo?.sensitive ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>{dtInfo?.name}</span>
                          )
                        })}
                        {vendor.certifications.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-0.5">
                            <Shield className="h-2.5 w-2.5" />{vendor.certifications.length} cert.
                          </span>
                        )}
                        {daysToReview !== null && daysToReview > 0 && daysToReview <= 30 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />Revisión en {daysToReview}d
                          </span>
                        )}
                        {daysToReview !== null && daysToReview <= 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />Revisión vencida
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="hidden md:flex items-center gap-5 flex-shrink-0">
                      {/* Risk Score */}
                      <div className="text-center w-14">
                        <div className="relative w-10 h-10 mx-auto">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none" strokeWidth="3" strokeDasharray={`${vendor.riskScore}, 100`}
                              className={vendor.riskScore >= 70 ? 'stroke-red-500' : vendor.riskScore >= 50 ? 'stroke-orange-500' : vendor.riskScore >= 30 ? 'stroke-yellow-500' : 'stroke-green-500'} />
                          </svg>
                          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getRiskColor(vendor.riskScore)}`}>{vendor.riskScore}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Riesgo</p>
                      </div>

                      {/* Rating */}
                      <div className="text-center w-12">
                        <div className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-sm font-bold ${getRatingColor(vendor.securityRating)}`}>
                          {vendor.securityRating || '—'}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Rating</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setShowDetail(vendor)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Ver detalle"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(vendor)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(vendor.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ════════ FORM MODAL ════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) closeForm() }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full shadow-2xl mb-8">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-6 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    {editingVendor ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Evaluación de riesgo de terceros según ISO 27001 — A.5.19 a A.5.23</p>
                </div>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* ── 1. Información del Proveedor ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">1</span>
                  Información del Proveedor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre <span className="text-red-500">*</span></label>
                    <input type="text" value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })}
                      placeholder="Nombre de la empresa o servicio"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Tipo de proveedor</label>
                    <select value={form.vendorType} onChange={e => setForm({ ...form, vendorType: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500">
                      {Object.entries(VENDOR_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Criticidad</label>
                    <select value={form.criticality} onChange={e => setForm({ ...form, criticality: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500">
                      {Object.entries(CRITICALITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Ubicación</label>
                    <input type="text" value={form.geographicLocation} onChange={e => setForm({ ...form, geographicLocation: e.target.value })}
                      placeholder="País o región"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" />Valor contrato (USD)</label>
                    <input type="number" value={form.contractValue} onChange={e => setForm({ ...form, contractValue: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Fin del contrato</label>
                    <input type="date" value={form.contractEnd} onChange={e => setForm({ ...form, contractEnd: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Contacto principal</label>
                    <input type="text" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                      placeholder="Nombre"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Mail className="h-3.5 w-3.5" />Email</label>
                    <input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                      placeholder="email@proveedor.com"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 2. Conexión y Accesos ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                  Conexión y Accesos
                </h3>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Tipo de conexión</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {CONNECTION_TYPES.map(c => (
                    <button key={c.id} type="button" onClick={() => setForm({ ...form, connectionType: c.id })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.connectionType === c.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c.name}</p>
                      <p className="text-[10px] text-gray-500">{c.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border-2 transition-all ${form.systemAccess ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="checkbox" checked={form.systemAccess} onChange={e => setForm({ ...form, systemAccess: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <Server className={`h-4 w-4 ${form.systemAccess ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">Acceso a Sistemas</span>
                  </label>
                  <label className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border-2 transition-all ${form.dataAccess ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="checkbox" checked={form.dataAccess} onChange={e => setForm({ ...form, dataAccess: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <Database className={`h-4 w-4 ${form.dataAccess ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">Acceso a Datos</span>
                  </label>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 3. Tipos de Información ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                  Información Compartida
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DATA_TYPES.map(dt => {
                    const sel = form.dataTypes.includes(dt.id)
                    return (
                      <button key={dt.id} type="button" onClick={() => setForm({ ...form, dataTypes: toggleArrayItem(form.dataTypes, dt.id) })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          sel
                            ? dt.sensitive ? 'border-red-400 bg-red-50 dark:bg-red-900/15' : 'border-purple-400 bg-purple-50 dark:bg-purple-900/15'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-1.5">
                          {sel && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{dt.name}</span>
                        </div>
                        {dt.sensitive && <p className="text-[10px] text-red-500 mt-0.5">⚠️ Sensible</p>}
                      </button>
                    )
                  })}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 4. Certificaciones ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">4</span>
                  Certificaciones de Seguridad
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map(cert => {
                    const sel = form.certifications.includes(cert)
                    return (
                      <button key={cert} type="button" onClick={() => setForm({ ...form, certifications: toggleArrayItem(form.certifications, cert) })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          sel ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}>
                        {sel && '✓ '}{cert}
                      </button>
                    )
                  })}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── 5. Notas ── */}
              <section>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">5</span>
                  Notas Adicionales
                </h3>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3} placeholder="Descripción del servicio, observaciones, acuerdos especiales..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 resize-none" />
              </section>

              {/* ── Risk Score Preview ── */}
              <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Activity className="h-4 w-4" />Risk Score Estimado
                  </span>
                  <span className={`text-2xl font-bold ${getRiskColor(calculateRiskScore(form))}`}>
                    {calculateRiskScore(form)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all ${getRiskBg(calculateRiskScore(form))}`}
                    style={{ width: `${calculateRiskScore(form)}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">Rating estimado: {getRatingFromScore(calculateRiskScore(form))} — Basado en criticidad, accesos, datos sensibles y certificaciones</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleSubmit} disabled={!form.vendorName || saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : editingVendor ? <><Edit className="h-4 w-4" />Guardar Cambios</> : <><Plus className="h-4 w-4" />Agregar Proveedor</>}
                </button>
                <button onClick={closeForm}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </div>
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
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${(VENDOR_TYPES[showDetail.vendorType] || VENDOR_TYPES.other).bg} flex items-center justify-center`}>
                    {(() => { const I = (VENDOR_TYPES[showDetail.vendorType] || VENDOR_TYPES.other).icon; return <I className="h-6 w-6 text-white" /> })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${(CRITICALITY[showDetail.criticality] || CRITICALITY.MEDIUM).color}`}>
                        {(CRITICALITY[showDetail.criticality] || CRITICALITY.MEDIUM).label}
                      </span>
                      {(() => {
                        const cs = COMPLIANCE_STATUS[showDetail.complianceStatus] || COMPLIANCE_STATUS.UNKNOWN
                        const CSI = cs.icon
                        return (
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            showDetail.complianceStatus === 'COMPLIANT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                            showDetail.complianceStatus === 'NON_COMPLIANT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                            showDetail.complianceStatus === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                            'bg-gray-100 text-gray-600'
                          }`}><CSI className="h-3 w-3" />{cs.label}</span>
                        )
                      })()}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{showDetail.vendorName}</h2>
                    <p className="text-xs text-gray-500">
                      {(VENDOR_TYPES[showDetail.vendorType] || VENDOR_TYPES.other).name} · {CONNECTION_TYPES.find(c => c.id === showDetail.connectionType)?.name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="px-7 py-6 space-y-6">
              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="relative w-14 h-14 mx-auto mb-1">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeWidth="2.5" strokeDasharray={`${showDetail.riskScore}, 100`}
                        className={showDetail.riskScore >= 70 ? 'stroke-red-500' : showDetail.riskScore >= 50 ? 'stroke-orange-500' : showDetail.riskScore >= 30 ? 'stroke-yellow-500' : 'stroke-green-500'} />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${getRiskColor(showDetail.riskScore)}`}>{showDetail.riskScore}</span>
                  </div>
                  <p className="text-xs text-gray-500">Risk Score</p>
                </div>
                <div className="text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl font-bold mb-1 ${getRatingColor(showDetail.securityRating)}`}>
                    {showDetail.securityRating || '—'}
                  </div>
                  <p className="text-xs text-gray-500">Security Rating</p>
                </div>
                <div className="text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${(showDetail.contractValue || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Valor Contrato (USD)</p>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Access & Connection */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Accesos y Conexión</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${showDetail.systemAccess ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <Server className={`h-5 w-5 ${showDetail.systemAccess ? 'text-orange-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-semibold">Acceso a Sistemas</p>
                        <p className={`text-xs ${showDetail.systemAccess ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>{showDetail.systemAccess ? '✓ Sí — Requiere monitoreo' : '✗ No'}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${showDetail.dataAccess ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <Database className={`h-5 w-5 ${showDetail.dataAccess ? 'text-red-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-semibold">Acceso a Datos</p>
                        <p className={`text-xs ${showDetail.dataAccess ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{showDetail.dataAccess ? '✓ Sí — Clasificación requerida' : '✗ No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Types */}
              {showDetail.dataTypes.filter(d => d !== 'none').length > 0 && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Información compartida</h4>
                    <div className="flex flex-wrap gap-2">
                      {showDetail.dataTypes.filter(d => d !== 'none').map((dt, i) => {
                        const dtInfo = DATA_TYPES.find(d => d.id === dt)
                        return (
                          <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                            dtInfo?.sensitive ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {dtInfo?.sensitive && '⚠️ '}{dtInfo?.name}
                          </span>
                        )
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* Certifications */}
              {showDetail.certifications.length > 0 && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Certificaciones</h4>
                    <div className="flex flex-wrap gap-2">
                      {showDetail.certifications.map((cert, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                          <Shield className="h-3 w-3" />{cert}
                        </span>
                      ))}
                    </div>
                  </section>
                </>
              )}

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* General Info */}
              <section>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Información General</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Ubicación:</span> {showDetail.geographicLocation || 'No especificada'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Fin contrato:</span> {fmtDate(showDetail.contractEnd)}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Última evaluación:</span> {fmtDate(showDetail.lastAssessment)}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-500">Próxima evaluación:</span> {fmtDate(showDetail.nextAssessment)}</p>
                </div>
              </section>

              {/* Contact */}
              {(showDetail.contactName || showDetail.contactEmail) && (
                <>
                  <hr className="border-gray-100 dark:border-gray-800" />
                  <section>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1"><Users className="h-3.5 w-3.5" />Contacto</h4>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{showDetail.contactName}</p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">{showDetail.contactEmail}</p>
                    </div>
                  </section>
                </>
              )}

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
                <button onClick={() => { openEdit(showDetail); setShowDetail(null) }}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />Editar
                </button>
                <button onClick={() => setShowDetail(null)}
                  className="flex-1 min-w-[120px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
