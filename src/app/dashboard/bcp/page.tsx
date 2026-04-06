'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck, RefreshCw, Plus, Clock, AlertTriangle, CheckCircle2,
  FileText, FlaskConical, Users, Server, Calendar, BarChart3, Play,
  TrendingUp, Building2, Zap, X, Loader2, Edit, Trash2, Eye,
  ChevronLeft, ArrowUpRight, ArrowDownRight, Activity, Target,
  Download, Shield, Database, Globe, Phone, Mail, MapPin,
  LayoutDashboard, ListChecks, TestTube2, Siren, XCircle, Minus,
  ChevronRight, Info, Sparkles
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PLAN_TYPES: Record<string, { label: string; labelShort: string; icon: any; color: string; bg: string; bgLight: string }> = {
  BCP:    { label: 'Plan de Continuidad del Negocio', labelShort: 'BCP', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
  DRP:    { label: 'Plan de Recuperación ante Desastres', labelShort: 'DRP', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-900/20' },
  HYBRID: { label: 'Híbrido BCP/DRP', labelShort: 'Híbrido', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-900/20' },
}

const PLAN_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  DRAFT:        { label: 'Borrador',    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',       dot: 'bg-gray-400' },
  REVIEW:       { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500' },
  APPROVED:     { label: 'Aprobado',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',    dot: 'bg-blue-500' },
  ACTIVE:       { label: 'Activo',      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
  UNDER_REVIEW: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500' },
  ARCHIVED:     { label: 'Archivado',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',        dot: 'bg-red-500' },
}

const CRITICALITY: Record<string, { label: string; color: string; dot: string; fill: string }> = {
  CRITICAL: { label: 'Crítico', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',       dot: 'bg-red-500',    fill: '#ef4444' },
  HIGH:     { label: 'Alto',    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', dot: 'bg-orange-500', fill: '#f97316' },
  MEDIUM:   { label: 'Medio',   color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500', fill: '#eab308' },
  LOW:      { label: 'Bajo',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',   dot: 'bg-green-500',  fill: '#22c55e' },
}

const TEST_TYPES: Record<string, { label: string; desc: string }> = {
  TABLETOP:    { label: 'Tabletop',    desc: 'Ejercicio de mesa / discusión' },
  WALKTHROUGH: { label: 'Walkthrough', desc: 'Recorrido paso a paso' },
  SIMULATION:  { label: 'Simulación',  desc: 'Simulacro parcial' },
  FULL:        { label: 'Completa',    desc: 'Prueba integral en vivo' },
}

const TEST_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  SCHEDULED:   { label: 'Programada',  color: 'text-blue-600',   icon: Calendar },
  IN_PROGRESS: { label: 'En Curso',    color: 'text-yellow-600', icon: Play },
  COMPLETED:   { label: 'Completada',  color: 'text-green-600',  icon: CheckCircle2 },
  CANCELLED:   { label: 'Cancelada',   color: 'text-red-500',    icon: XCircle },
}

const STRATEGY_TYPES: Record<string, { label: string; desc: string }> = {
  HOT_SITE:  { label: 'Hot Site',  desc: 'Sitio activo — disponibilidad inmediata' },
  WARM_SITE: { label: 'Warm Site', desc: 'Sitio semi-activo — activación en horas' },
  COLD_SITE: { label: 'Cold Site', desc: 'Sitio pasivo — activación en días' },
  CLOUD:     { label: 'Cloud',     desc: 'Recuperación en la nube' },
  MANUAL:    { label: 'Manual',    desc: 'Procedimientos manuales de contingencia' },
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface BCPPlan {
  id: string
  name: string
  description?: string
  type?: string
  status: string
  version: string
  scope?: string
  rto?: number | null
  rpo?: number | null
  mtpd?: number | null
  nextReviewDate?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  criticalProcesses?: any[]
  recoveryStrategies?: any[]
  bcpTests?: any[]
  incidentResponsePlan?: any
  _count?: { criticalProcesses: number; bcpTests: number }
  createdAt?: string
  updatedAt?: string
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fmtDate(d: string | null | undefined) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function minsToHours(mins: number | null | undefined) {
  if (!mins && mins !== 0) return 'N/A'
  if (mins < 60) return `${mins}min`
  const h = Math.round(mins / 60 * 10) / 10
  return `${h}h`
}

function safe<T>(val: T | null | undefined, fallback: T): T {
  return val != null ? val : fallback
}

function getStatusCfg(status: string) {
  return PLAN_STATUS[status] || PLAN_STATUS.DRAFT
}

function getTypeCfg(type: string | undefined) {
  return PLAN_TYPES[type || 'BCP'] || PLAN_TYPES.BCP
}

function getCritCfg(c: string) {
  return CRITICALITY[c] || CRITICALITY.MEDIUM
}

function exportToCSV(plan: BCPPlan) {
  const processes = plan.criticalProcesses || []
  const headers = ['Proceso', 'Criticidad', 'Responsable', 'Departamento', 'RTO (min)', 'RPO (min)']
  const rows = processes.map((p: any) => [
    p.name, getCritCfg(p.criticality).label, p.owner || '', p.department || '', p.rto, p.rpo,
  ])
  const csv = [headers.join(','), ...rows.map((r: any[]) => r.map(c => `"${c}"`).join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bcp_procesos_${plan.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA — used if API returns empty
// ═══════════════════════════════════════════════════════════════

const SAMPLE_PLANS: BCPPlan[] = [
  {
    id: 'sample-1',
    name: 'Plan de Continuidad Principal',
    description: 'Plan integral de continuidad del negocio para operaciones críticas de la organización, cubriendo sistemas de TI, procesos financieros y atención al cliente.',
    type: 'BCP',
    status: 'ACTIVE',
    version: '2.1',
    scope: 'Todos los procesos críticos de la organización',
    rto: 240,
    rpo: 60,
    mtpd: 72,
    nextReviewDate: '2026-09-15',
    approvedAt: '2026-01-10',
    criticalProcesses: [
      { id: 'cp1', name: 'Sistema ERP / Facturación', description: 'Sistema principal de facturación electrónica y gestión empresarial', owner: 'Director TI', department: 'Tecnología', criticality: 'CRITICAL', priority: 1, rto: 60, rpo: 15 },
      { id: 'cp2', name: 'Plataforma de Pagos Online', description: 'Procesamiento de transacciones y pagos de clientes', owner: 'Gerente Finanzas', department: 'Finanzas', criticality: 'CRITICAL', priority: 2, rto: 120, rpo: 30 },
      { id: 'cp3', name: 'Correo Electrónico Corporativo', description: 'Comunicaciones internas y externas vía email', owner: 'Jefe de Infraestructura', department: 'Tecnología', criticality: 'HIGH', priority: 3, rto: 240, rpo: 60 },
      { id: 'cp4', name: 'CRM — Gestión de Clientes', description: 'Base de datos de clientes y seguimiento comercial', owner: 'Gerente Comercial', department: 'Ventas', criticality: 'HIGH', priority: 4, rto: 480, rpo: 120 },
      { id: 'cp5', name: 'Portal Web Institucional', description: 'Sitio web público y portal de autoservicio', owner: 'Jefe de Marketing', department: 'Marketing', criticality: 'MEDIUM', priority: 5, rto: 720, rpo: 240 },
      { id: 'cp6', name: 'Sistema de RRHH y Nómina', description: 'Gestión de personal, nóminas y beneficios', owner: 'Gerente RRHH', department: 'Recursos Humanos', criticality: 'MEDIUM', priority: 6, rto: 1440, rpo: 480 },
    ],
    recoveryStrategies: [
      { id: 'rs1', name: 'Failover Cloud AWS', type: 'CLOUD', description: 'Replicación y failover automático en AWS us-east-1', status: 'ACTIVE', activationTime: 15, monthlyCost: 3500 },
      { id: 'rs2', name: 'Backup Site Santiago', type: 'WARM_SITE', description: 'Centro de datos alterno en Santiago con equipamiento parcial', status: 'CONFIGURED', activationTime: 120, monthlyCost: 8000 },
      { id: 'rs3', name: 'Procedimiento Manual Facturación', type: 'MANUAL', description: 'Facturación manual de emergencia con formularios pre-impresos', status: 'TESTED', activationTime: 30, monthlyCost: 0 },
    ],
    bcpTests: [
      { id: 'bt1', name: 'Simulacro Failover Cloud Q4', type: 'SIMULATION', status: 'COMPLETED', scheduledDate: '2025-12-15', actualDate: '2025-12-15', successRate: 92, rtoAchieved: 18, rpoAchieved: 5, duration: 180 },
      { id: 'bt2', name: 'Tabletop Ransomware', type: 'TABLETOP', status: 'COMPLETED', scheduledDate: '2025-10-20', actualDate: '2025-10-20', successRate: 85, duration: 120 },
      { id: 'bt3', name: 'Prueba Completa Anual 2026', type: 'FULL', status: 'SCHEDULED', scheduledDate: '2026-06-15' },
      { id: 'bt4', name: 'Walkthrough DRP Abril', type: 'WALKTHROUGH', status: 'SCHEDULED', scheduledDate: '2026-04-10' },
    ],
    _count: { criticalProcesses: 6, bcpTests: 4 },
  },
  {
    id: 'sample-2',
    name: 'DRP — Infraestructura Tecnológica',
    description: 'Plan de recuperación ante desastres específico para la infraestructura de TI, servidores, redes y telecomunicaciones.',
    type: 'DRP',
    status: 'DRAFT',
    version: '1.0',
    rto: 120,
    rpo: 30,
    mtpd: 24,
    nextReviewDate: '2026-12-01',
    criticalProcesses: [
      { id: 'dp1', name: 'Servidores de Producción', description: 'Servidores que alojan aplicaciones críticas', owner: 'Administrador de Sistemas', department: 'Tecnología', criticality: 'CRITICAL', priority: 1, rto: 30, rpo: 5 },
      { id: 'dp2', name: 'Red Corporativa y VPN', description: 'Infraestructura de red, switches, routers, VPN', owner: 'Ingeniero de Redes', department: 'Tecnología', criticality: 'CRITICAL', priority: 2, rto: 60, rpo: 0 },
      { id: 'dp3', name: 'Base de Datos Principal', description: 'PostgreSQL con datos críticos del negocio', owner: 'DBA', department: 'Tecnología', criticality: 'CRITICAL', priority: 3, rto: 60, rpo: 5 },
    ],
    recoveryStrategies: [
      { id: 'drs1', name: 'Replicación BD en Tiempo Real', type: 'HOT_SITE', description: 'Streaming replication PostgreSQL a datacenter secundario', status: 'ACTIVE', activationTime: 5, monthlyCost: 2000 },
    ],
    bcpTests: [],
    _count: { criticalProcesses: 3, bcpTests: 0 },
  },
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function BCPDRPPage() {
  const [plans, setPlans] = useState<BCPPlan[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<BCPPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'tests' | 'strategies'>('overview')

  // Modals
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showAddProcess, setShowAddProcess] = useState(false)
  const [showScheduleTest, setShowScheduleTest] = useState(false)
  const [showProcessDetail, setShowProcessDetail] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // AI generation state
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiForm, setAiForm] = useState({ orgName: '', sector: '', description: '', planType: 'BCP' })
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiSuccess, setAiSuccess] = useState('')

  // Form states
  const emptyPlan = { name: '', description: '', type: 'BCP', scope: '', rto: 4, rpo: 1, mtpd: 72 }
  const emptyProcess = { name: '', description: '', owner: '', department: '', criticality: 'HIGH', rto: 4, rpo: 1, mtpd: 72 }
  const emptyTest = { name: '', type: 'TABLETOP', scheduledDate: '', description: '' }
  const [planForm, setPlanForm] = useState(emptyPlan)
  const [processForm, setProcessForm] = useState(emptyProcess)
  const [testForm, setTestForm] = useState(emptyTest)

  // ── Fetch ──────────────────────────────────────────────────
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bcp')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      const apiPlans = data.plans || []
      if (apiPlans.length > 0) {
        setPlans(apiPlans)
        setMetrics(data.metrics || {})
      } else {
        // Use sample data when API returns empty
        setPlans(SAMPLE_PLANS)
        setMetrics({
          totalPlans: SAMPLE_PLANS.length,
          activePlans: SAMPLE_PLANS.filter(p => p.status === 'ACTIVE').length,
          totalProcesses: SAMPLE_PLANS.reduce((a, p) => a + (p.criticalProcesses?.length || 0), 0),
          upcomingTests: SAMPLE_PLANS.reduce((a, p) => a + (p.bcpTests?.filter(t => t.status === 'SCHEDULED').length || 0), 0),
        })
      }
    } catch (error) {
      console.error('Error fetching BCP plans:', error)
      // Fallback to sample
      setPlans(SAMPLE_PLANS)
      setMetrics({
        totalPlans: SAMPLE_PLANS.length,
        activePlans: 1,
        totalProcesses: 9,
        upcomingTests: 2,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPlanDetails = async (plan: BCPPlan) => {
    // If sample data, just use it
    if (plan.id.startsWith('sample-')) {
      setSelectedPlan(plan)
      return
    }
    try {
      const res = await fetch(`/api/bcp/${plan.id}`)
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setSelectedPlan(data.plan || plan)
    } catch (e) {
      console.error('Error fetching plan details:', e)
      setSelectedPlan(plan)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  // ── CRUD ───────────────────────────────────────────────────
  const handleCreatePlan = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/bcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createPlan', data: { ...planForm, rtoTarget: planForm.rto, rpoTarget: planForm.rpo, mtpdTarget: planForm.mtpd } }),
      })
      if (res.ok) {
        await fetchPlans()
        setShowCreatePlan(false)
        setPlanForm(emptyPlan)
      }
    } catch (e) {
      console.error('Error creating plan:', e)
    }
    setSaving(false)
  }

  const handleGenerateWithAI = async () => {
    setAiGenerating(true)
    setAiError('')
    setAiSuccess('')
    try {
      const res = await fetch('/api/bcp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error || 'Error generando el plan')
        return
      }
      setAiSuccess(`✅ Plan "${data.planName}" creado con ${data.processesCreated} procesos y ${data.strategiesCreated} estrategias`)
      await fetchPlans()
      setTimeout(() => {
        setShowAIModal(false)
        setAiSuccess('')
        setAiError('')
        setAiForm({ orgName: '', sector: '', description: '', planType: 'BCP' })
      }, 2500)
    } catch {
      setAiError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleAddProcess = async () => {
    if (!selectedPlan) return
    setSaving(true)
    if (selectedPlan.id.startsWith('sample-')) {
      // Local add for sample data
      const newP = {
        id: 'cp-' + Date.now(),
        name: processForm.name,
        description: processForm.description,
        owner: processForm.owner,
        department: processForm.department,
        criticality: processForm.criticality,
        priority: (selectedPlan.criticalProcesses?.length || 0) + 1,
        rto: processForm.rto * 60,
        rpo: processForm.rpo * 60,
      }
      setSelectedPlan({
        ...selectedPlan,
        criticalProcesses: [...(selectedPlan.criticalProcesses || []), newP],
      })
      setShowAddProcess(false)
      setProcessForm(emptyProcess)
      setSaving(false)
      return
    }
    try {
      const res = await fetch('/api/bcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addProcess',
          data: { ...processForm, bcpId: selectedPlan.id, criticalityLevel: processForm.criticality },
        }),
      })
      if (res.ok) {
        await fetchPlanDetails(selectedPlan)
        setShowAddProcess(false)
        setProcessForm(emptyProcess)
      }
    } catch (e) {
      console.error('Error adding process:', e)
    }
    setSaving(false)
  }

  const handleScheduleTest = async () => {
    if (!selectedPlan) return
    setSaving(true)
    if (selectedPlan.id.startsWith('sample-')) {
      const newT = {
        id: 'bt-' + Date.now(),
        name: testForm.name,
        type: testForm.type,
        status: 'SCHEDULED',
        scheduledDate: testForm.scheduledDate,
        description: testForm.description,
      }
      setSelectedPlan({
        ...selectedPlan,
        bcpTests: [newT, ...(selectedPlan.bcpTests || [])],
      })
      setShowScheduleTest(false)
      setTestForm(emptyTest)
      setSaving(false)
      return
    }
    try {
      const res = await fetch('/api/bcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scheduleTest',
          data: { ...testForm, bcpId: selectedPlan.id },
        }),
      })
      if (res.ok) {
        await fetchPlanDetails(selectedPlan)
        setShowScheduleTest(false)
        setTestForm(emptyTest)
      }
    } catch (e) {
      console.error('Error scheduling test:', e)
    }
    setSaving(false)
  }

  const handleActivatePlan = async (planId: string) => {
    if (planId.startsWith('sample-')) {
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: 'ACTIVE' } : p))
      if (selectedPlan?.id === planId) setSelectedPlan({ ...selectedPlan, status: 'ACTIVE' })
      return
    }
    try {
      await fetch(`/api/bcp/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })
      await fetchPlans()
      if (selectedPlan?.id === planId) await fetchPlanDetails(selectedPlan)
    } catch (e) {
      console.error('Error activating plan:', e)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return
    if (planId.startsWith('sample-')) {
      setPlans(prev => prev.filter(p => p.id !== planId))
      if (selectedPlan?.id === planId) setSelectedPlan(null)
      return
    }
    try {
      await fetch(`/api/bcp/${planId}`, { method: 'DELETE' })
      await fetchPlans()
      if (selectedPlan?.id === planId) setSelectedPlan(null)
    } catch (e) {
      console.error('Error deleting plan:', e)
    }
  }

  // ── Computed ───────────────────────────────────────────────
  const processes = selectedPlan?.criticalProcesses || []
  const strategies = selectedPlan?.recoveryStrategies || []
  const tests = selectedPlan?.bcpTests || []

  const chartRTORPO = useMemo(() =>
    processes.map((p: any) => ({
      name: (p.name || '').length > 12 ? (p.name || '').substring(0, 12) + '…' : (p.name || ''),
      RTO: Math.round((p.rto || 0) / 60 * 10) / 10,
      RPO: Math.round((p.rpo || 0) / 60 * 10) / 10,
    })), [processes])

  const critChartData = useMemo(() => [
    { name: 'Crítico', value: processes.filter((p: any) => p.criticality === 'CRITICAL').length, fill: '#ef4444' },
    { name: 'Alto', value: processes.filter((p: any) => p.criticality === 'HIGH').length, fill: '#f97316' },
    { name: 'Medio', value: processes.filter((p: any) => p.criticality === 'MEDIUM').length, fill: '#eab308' },
    { name: 'Bajo', value: processes.filter((p: any) => p.criticality === 'LOW').length, fill: '#22c55e' },
  ], [processes])

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-500" />
            BCP / DRP
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Plan de Continuidad del Negocio y Recuperación ante Desastres · ISO 22301
          </p>
        </div>
        {!selectedPlan && (
          <div className="flex items-center gap-2">
            <button onClick={() => { setAiForm(f => ({ ...f, planType: 'BCP' })); setAiError(''); setAiSuccess(''); setShowAIModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4" /> Crear con IA
            </button>
            <button onClick={() => { setPlanForm(emptyPlan); setShowCreatePlan(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
              <Plus className="h-4 w-4" /> Nuevo Plan
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ═══ PLAN LIST VIEW ════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════ */}
      {!selectedPlan && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Planes Totales', value: metrics.totalPlans || plans.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
              { label: 'Planes Activos', value: metrics.activePlans || plans.filter(p => p.status === 'ACTIVE').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Procesos Críticos', value: metrics.totalProcesses || plans.reduce((a, p) => a + (p.criticalProcesses?.length || p._count?.criticalProcesses || 0), 0), icon: Server, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Pruebas Programadas', value: metrics.upcomingTests || 0, icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Plans list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Planes de Continuidad y Recuperación</h2>
              <p className="text-xs text-gray-500 mt-0.5">{plans.length} plan{plans.length !== 1 ? 'es' : ''} registrado{plans.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-3" />
                <p className="text-gray-500">Cargando planes...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="p-16 text-center">
                <ShieldCheck className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium mb-1">No hay planes configurados</h3>
                <p className="text-gray-500 text-sm mb-4">Crea tu primer plan de continuidad del negocio</p>
                <button onClick={() => setShowCreatePlan(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                  <Plus className="h-4 w-4" /> Crear Plan
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {plans.map(plan => {
                  const typeCfg = getTypeCfg(plan.type)
                  const statusCfg = getStatusCfg(plan.status)
                  const TypeIcon = typeCfg.icon
                  const procCount = plan.criticalProcesses?.length || plan._count?.criticalProcesses || 0
                  const testCount = plan.bcpTests?.length || plan._count?.bcpTests || 0

                  return (
                    <div key={plan.id}
                      className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() => { setActiveTab('overview'); fetchPlanDetails(plan) }}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${typeCfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{plan.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeCfg.bgLight} ${typeCfg.color}`}>{typeCfg.labelShort}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{plan.description || 'Sin descripción'}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-6 flex-shrink-0 text-center">
                          <div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{procCount}</p>
                            <p className="text-[10px] text-gray-500">Procesos</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-600">{minsToHours(plan.rto)}</p>
                            <p className="text-[10px] text-gray-500">RTO</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">{minsToHours(plan.rpo)}</p>
                            <p className="text-[10px] text-gray-500">RPO</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">v{plan.version}</p>
                            <p className="text-[10px] text-gray-500">Versión</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={e => { e.stopPropagation(); handleDeletePlan(plan.id) }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* ═══ PLAN DETAIL VIEW ══════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════ */}
      {selectedPlan && (
        <div className="space-y-6">
          {/* Plan Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedPlan(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className={`w-12 h-12 rounded-xl ${getTypeCfg(selectedPlan.type).bg} flex items-center justify-center flex-shrink-0`}>
                    {(() => { const I = getTypeCfg(selectedPlan.type).icon; return <I className="h-6 w-6 text-white" /> })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPlan.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusCfg(selectedPlan.status).color}`}>
                        {getStatusCfg(selectedPlan.status).label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPlan.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {(selectedPlan.status === 'DRAFT' || selectedPlan.status === 'APPROVED') && (
                    <button onClick={() => handleActivatePlan(selectedPlan.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Activar
                    </button>
                  )}
                  <button onClick={() => exportToCSV(selectedPlan)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                    <Download className="h-4 w-4" /> Exportar
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-t border-gray-200 dark:border-gray-700">
              <nav className="flex gap-1 -mb-px">
                {([
                  { key: 'overview' as const, label: 'Resumen', icon: LayoutDashboard },
                  { key: 'processes' as const, label: 'Procesos Críticos', icon: ListChecks },
                  { key: 'tests' as const, label: 'Pruebas', icon: TestTube2 },
                  { key: 'strategies' as const, label: 'Estrategias', icon: Target },
                ]).map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    <tab.icon className="h-4 w-4" />{tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ── TAB: Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recovery Targets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'RTO — Recovery Time Objective', desc: 'Tiempo máximo de interrupción permitido', value: minsToHours(selectedPlan.rto), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/30' },
                  { label: 'RPO — Recovery Point Objective', desc: 'Pérdida máxima de datos tolerada', value: minsToHours(selectedPlan.rpo), icon: Database, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800/30' },
                  { label: 'MTPD — Período Máximo Tolerable', desc: 'Disrupción máxima tolerable del negocio', value: selectedPlan.mtpd ? `${selectedPlan.mtpd}h` : 'N/A', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/30' },
                ].map(t => (
                  <div key={t.label} className={`${t.bg} rounded-xl p-5 border ${t.border}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <t.icon className={`h-7 w-7 ${t.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.label}</p>
                        <p className="text-[11px] text-gray-500">{t.desc}</p>
                      </div>
                    </div>
                    <p className={`text-4xl font-bold ${t.color}`}>{t.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RTO/RPO bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" /> RTO / RPO por Proceso (horas)
                  </h3>
                  {chartRTORPO.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartRTORPO} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" fontSize={10} stroke="#6b7280" />
                        <YAxis fontSize={10} stroke="#6b7280" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="RTO" fill="#3b82f6" name="RTO (h)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="RPO" fill="#22c55e" name="RPO (h)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Sin procesos definidos</div>
                  )}
                </div>

                {/* Criticality pie */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> Distribución por Criticidad
                  </h3>
                  {processes.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={critChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" strokeWidth={2}>
                            {critChartData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {critChartData.map(d => (
                          <div key={d.name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />{d.name}</span>
                            <span className="font-bold">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Sin procesos definidos</div>
                  )}
                </div>
              </div>

              {/* Summary stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-500" /> Resumen del Plan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Procesos Críticos', value: processes.length, color: 'text-indigo-600' },
                    { label: 'Estrategias', value: strategies.length, color: 'text-green-600' },
                    { label: 'Pruebas Completadas', value: tests.filter((t: any) => t.status === 'COMPLETED').length, color: 'text-purple-600' },
                    { label: 'Versión', value: `v${selectedPlan.version}`, color: 'text-gray-900 dark:text-white' },
                    { label: 'Próxima Revisión', value: fmtDate(selectedPlan.nextReviewDate), color: 'text-orange-600' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Processes ── */}
          {activeTab === 'processes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{processes.length} Proceso{processes.length !== 1 ? 's' : ''} Crítico{processes.length !== 1 ? 's' : ''}</h3>
                <button onClick={() => { setProcessForm(emptyProcess); setShowAddProcess(true) }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium">
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>

              {processes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                  <Server className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium mb-1">No hay procesos críticos</h3>
                  <p className="text-gray-500 text-sm mb-4">Define los procesos críticos de tu organización</p>
                  <button onClick={() => setShowAddProcess(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    <Plus className="h-4 w-4" /> Agregar Proceso
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {processes.sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99)).map((proc: any, idx: number) => {
                    const critCfg = getCritCfg(proc.criticality)
                    return (
                      <div key={proc.id || idx}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* Priority number */}
                          <div className={`w-10 h-10 rounded-xl ${critCfg.dot} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold text-sm">#{proc.priority || idx + 1}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{proc.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${critCfg.color}`}>{critCfg.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{proc.description || 'Sin descripción'}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {proc.owner && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{proc.owner}</span>}
                              {proc.department && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{proc.department}</span>}
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="hidden sm:flex items-center gap-5 flex-shrink-0 text-center">
                            <div>
                              <p className="text-xl font-bold text-blue-600">{minsToHours(proc.rto)}</p>
                              <p className="text-[10px] text-gray-500">RTO</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-green-600">{minsToHours(proc.rpo)}</p>
                              <p className="text-[10px] text-gray-500">RPO</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Tests ── */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Historial y Programación de Pruebas</h3>
                <button onClick={() => { setTestForm(emptyTest); setShowScheduleTest(true) }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium">
                  <Calendar className="h-3.5 w-3.5" /> Programar Prueba
                </button>
              </div>

              {tests.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                  <FlaskConical className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium mb-1">No hay pruebas registradas</h3>
                  <p className="text-gray-500 text-sm mb-4">Programa pruebas regulares para validar tu plan</p>
                  <button onClick={() => setShowScheduleTest(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    <Calendar className="h-4 w-4" /> Programar
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tests.map((test: any, idx: number) => {
                      const tsCfg = TEST_STATUS[test.status] || TEST_STATUS.SCHEDULED
                      const TSIcon = tsCfg.icon
                      const typeCfg = TEST_TYPES[test.type] || TEST_TYPES.TABLETOP

                      return (
                        <div key={test.id || idx} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              test.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30' :
                              test.status === 'SCHEDULED' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              test.status === 'IN_PROGRESS' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              <TSIcon className={`h-5 w-5 ${tsCfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{test.name}</h4>
                                <span className={`text-[11px] font-semibold ${tsCfg.color}`}>{tsCfg.label}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {typeCfg.label} · Programada: {fmtDate(test.scheduledDate)}
                                {test.actualDate && ` · Ejecutada: ${fmtDate(test.actualDate)}`}
                                {test.duration && ` · Duración: ${test.duration}min`}
                              </p>
                            </div>
                            {test.status === 'COMPLETED' && test.successRate != null && (
                              <div className="text-right flex-shrink-0">
                                <div className="flex items-center gap-2">
                                  <div className="relative w-12 h-12">
                                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" strokeWidth="3" strokeDasharray={`${test.successRate}, 100`}
                                        className={test.successRate >= 80 ? 'stroke-green-500' : test.successRate >= 60 ? 'stroke-yellow-500' : 'stroke-red-500'} />
                                    </svg>
                                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                                      test.successRate >= 80 ? 'text-green-600' : test.successRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>{test.successRate}%</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5">Éxito</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Strategies ── */}
          {activeTab === 'strategies' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{strategies.length} Estrategia{strategies.length !== 1 ? 's' : ''} de Recuperación</h3>

              {strategies.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                  <Target className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium mb-1">No hay estrategias definidas</h3>
                  <p className="text-gray-500 text-sm">Las estrategias de recuperación se agregan desde la API</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies.map((strat: any, idx: number) => {
                    const stCfg = STRATEGY_TYPES[strat.type] || STRATEGY_TYPES.MANUAL
                    return (
                      <div key={strat.id || idx}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                            <Target className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{strat.name}</h4>
                            <p className="text-xs text-gray-500">{stCfg.label} — {stCfg.desc}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{strat.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {strat.activationTime != null && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/15 text-blue-600">
                              <Clock className="h-3 w-3" /> Activación: {strat.activationTime}min
                            </span>
                          )}
                          {strat.monthlyCost != null && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/15 text-green-600">
                              $ {strat.monthlyCost.toLocaleString()}/mes
                            </span>
                          )}
                          {strat.status && (
                            <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${
                              strat.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                              strat.status === 'TESTED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                              strat.status === 'CONFIGURED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700'
                            }`}>
                              {strat.status === 'ACTIVE' ? 'Activa' : strat.status === 'TESTED' ? 'Probada' : strat.status === 'CONFIGURED' ? 'Configurada' : 'Planificada'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* ═══ MODALS ════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════ */}

      {/* ── Create Plan Modal ── */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowCreatePlan(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl mb-8">
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-500" /> Crear Nuevo Plan
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Define un plan de continuidad o recuperación para tu organización</p>
                </div>
                <button onClick={() => setShowCreatePlan(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="px-7 py-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre del Plan <span className="text-red-500">*</span></label>
                <input type="text" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="Plan de Continuidad Principal"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Tipo de Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(PLAN_TYPES).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    const sel = planForm.type === key
                    return (
                      <button key={key} type="button" onClick={() => setPlanForm({ ...planForm, type: key })}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          sel ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <Icon className={`h-6 w-6 ${sel ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-semibold">{cfg.labelShort}</span>
                        <span className="text-[10px] text-gray-500 text-center">{cfg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Descripción</label>
                <textarea value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  rows={3} placeholder="Descripción del alcance y objetivos del plan..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 resize-none focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Objetivos de Recuperación</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'rto', label: 'RTO (horas)', desc: 'Tiempo máximo de interrupción', color: 'border-blue-300 focus:ring-blue-500' },
                    { key: 'rpo', label: 'RPO (horas)', desc: 'Pérdida máxima de datos', color: 'border-green-300 focus:ring-green-500' },
                    { key: 'mtpd', label: 'MTPD (horas)', desc: 'Período máximo tolerable', color: 'border-orange-300 focus:ring-orange-500' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{field.label}</label>
                      <input type="number" value={(planForm as any)[field.key]}
                        onChange={e => setPlanForm({ ...planForm, [field.key]: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 border ${field.color} rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:border-transparent`} />
                      <p className="text-[10px] text-gray-400 mt-0.5">{field.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleCreatePlan} disabled={!planForm.name || saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Creando...</> : <><Plus className="h-4 w-4" />Crear Plan</>}
                </button>
                <button onClick={() => setShowCreatePlan(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Generate Plan Modal ── */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget && !aiGenerating) setShowAIModal(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl mb-8">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" /> Crear Plan con IA
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">La IA generará un plan completo con procesos críticos y estrategias de recuperación adaptados a tu sector</p>
                </div>
                <button onClick={() => { if (!aiGenerating) setShowAIModal(false) }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                  disabled={aiGenerating}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6 space-y-5">
              {/* Plan type selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Tipo de Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(PLAN_TYPES).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    const sel = aiForm.planType === key
                    return (
                      <button key={key} type="button"
                        onClick={() => setAiForm(f => ({ ...f, planType: key }))}
                        disabled={aiGenerating}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all disabled:opacity-50 ${
                          sel ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <Icon className={`h-5 w-5 ${sel ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-semibold">{cfg.labelShort}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Org name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre de la Organización</label>
                <input type="text" value={aiForm.orgName}
                  onChange={e => setAiForm(f => ({ ...f, orgName: e.target.value }))}
                  disabled={aiGenerating}
                  placeholder="Ej: Empresa ABC S.A."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50" />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Sector / Industria <span className="text-red-500">*</span>
                </label>
                <input type="text" value={aiForm.sector}
                  onChange={e => setAiForm(f => ({ ...f, sector: e.target.value }))}
                  disabled={aiGenerating}
                  placeholder="Ej: Banca, Retail, Salud, Manufactura, Tecnología, Gobierno..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50" />
              </div>

              {/* Context */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Contexto Adicional <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                </label>
                <textarea value={aiForm.description}
                  onChange={e => setAiForm(f => ({ ...f, description: e.target.value }))}
                  disabled={aiGenerating}
                  rows={3}
                  placeholder="Describe el tamaño de la empresa, sistemas críticos, procesos más importantes, riesgos conocidos..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 resize-none focus:border-transparent disabled:opacity-50" />
              </div>

              {/* Info box */}
              {!aiGenerating && !aiSuccess && !aiError && (
                <div className="flex items-start gap-3 p-3.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <Info className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    La IA generará: nombre del plan, descripción, alcance, objetivos de RTO/RPO/MTPD, 3-5 procesos críticos del sector y 2-3 estrategias de recuperación. Todo se guardará automáticamente.
                  </p>
                </div>
              )}

              {/* Generating animation */}
              {aiGenerating && (
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Generando plan con IA...</p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-0.5">Analizando el sector y creando procesos críticos adaptados</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {aiError && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">{aiError}</p>
                </div>
              )}

              {/* Success */}
              {aiSuccess && (
                <div className="flex items-center gap-3 p-3.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">{aiSuccess}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleGenerateWithAI}
                  disabled={!aiForm.sector.trim() || aiGenerating}
                  className="flex-1 sm:flex-none px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20">
                  {aiGenerating
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Generando...</>
                    : <><Sparkles className="h-4 w-4" />Generar con IA</>
                  }
                </button>
                <button onClick={() => { if (!aiGenerating) setShowAIModal(false) }}
                  disabled={aiGenerating}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Process Modal ── */}
      {showAddProcess && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowAddProcess(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl mb-8">
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Server className="h-5 w-5 text-orange-500" /> Agregar Proceso Crítico
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Define un proceso crítico del negocio y sus objetivos de recuperación</p>
                </div>
                <button onClick={() => setShowAddProcess(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="px-7 py-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre del Proceso <span className="text-red-500">*</span></label>
                <input type="text" value={processForm.name} onChange={e => setProcessForm({ ...processForm, name: e.target.value })}
                  placeholder="Ej: Sistema de Facturación Electrónica"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Responsable</label>
                  <input type="text" value={processForm.owner} onChange={e => setProcessForm({ ...processForm, owner: e.target.value })}
                    placeholder="Nombre / Cargo"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Departamento</label>
                  <input type="text" value={processForm.department} onChange={e => setProcessForm({ ...processForm, department: e.target.value })}
                    placeholder="Ej: Tecnología"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Nivel de Criticidad</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(CRITICALITY).map(([key, cfg]) => {
                    const sel = processForm.criticality === key
                    return (
                      <button key={key} type="button" onClick={() => setProcessForm({ ...processForm, criticality: key })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          sel ? `${cfg.color} ring-1` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <span className={`w-3 h-3 rounded-full ${cfg.dot} inline-block mb-1`} />
                        <p className="text-xs font-semibold">{cfg.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">RTO (horas)</label>
                  <input type="number" value={processForm.rto} onChange={e => setProcessForm({ ...processForm, rto: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">RPO (horas)</label>
                  <input type="number" value={processForm.rpo} onChange={e => setProcessForm({ ...processForm, rpo: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">MTPD (horas)</label>
                  <input type="number" value={processForm.mtpd} onChange={e => setProcessForm({ ...processForm, mtpd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Descripción</label>
                <textarea value={processForm.description} onChange={e => setProcessForm({ ...processForm, description: e.target.value })}
                  rows={2} placeholder="Descripción del proceso y su importancia para el negocio..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 resize-none focus:border-transparent" />
              </div>

              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleAddProcess} disabled={!processForm.name || saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Agregando...</> : <><Plus className="h-4 w-4" />Agregar Proceso</>}
                </button>
                <button onClick={() => setShowAddProcess(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Schedule Test Modal ── */}
      {showScheduleTest && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowScheduleTest(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl mb-8">
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-500" /> Programar Prueba
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Agenda una prueba para validar el plan de continuidad</p>
                </div>
                <button onClick={() => setShowScheduleTest(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="px-7 py-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nombre de la Prueba <span className="text-red-500">*</span></label>
                <input type="text" value={testForm.name} onChange={e => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="Ej: Simulacro de Failover Q1 2026"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Tipo de Prueba</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TEST_TYPES).map(([key, cfg]) => {
                    const sel = testForm.type === key
                    return (
                      <button key={key} type="button" onClick={() => setTestForm({ ...testForm, type: key })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          sel ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{cfg.label}</p>
                        <p className="text-[10px] text-gray-500">{cfg.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha Programada <span className="text-red-500">*</span></label>
                <input type="date" value={testForm.scheduledDate} onChange={e => setTestForm({ ...testForm, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Descripción / Objetivos</label>
                <textarea value={testForm.description} onChange={e => setTestForm({ ...testForm, description: e.target.value })}
                  rows={3} placeholder="Objetivos de la prueba, escenario, participantes esperados..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 resize-none focus:border-transparent" />
              </div>

              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleScheduleTest} disabled={!testForm.name || !testForm.scheduledDate || saving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Programando...</> : <><Calendar className="h-4 w-4" />Programar Prueba</>}
                </button>
                <button onClick={() => setShowScheduleTest(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
