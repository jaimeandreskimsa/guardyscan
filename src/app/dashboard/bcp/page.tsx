'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  RefreshCw,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  FlaskConical,
  Settings,
  Users,
  Server,
  Calendar,
  BarChart3,
  Play,
  TrendingUp,
  Building,
  Zap,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface BCPPlan {
  id: string
  name: string
  description?: string
  type: 'BCP' | 'DRP' | 'HYBRID'
  status: 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED'
  version: string
  scope?: string
  rto?: number  // en minutos
  rpo?: number  // en minutos
  mtpd?: number // en horas
  nextReviewDate?: string
  criticalProcesses: CriticalProcess[]
  bcpTests: BCPTest[]
  recoveryStrategies?: RecoveryStrategy[]
  incidentResponsePlan?: any
  _count?: { criticalProcesses: number; bcpTests: number }
}

interface CriticalProcess {
  id: string
  name: string
  description?: string
  owner?: string
  department?: string
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  rto: number
  rpo: number
  mtpd: number
  recoveryStrategies: RecoveryStrategy[]
}

interface RecoveryStrategy {
  id: string
  name: string
  type: string
  priority: number
  steps: string[]
}

interface BCPTest {
  id: string
  name: string
  type: 'TABLETOP' | 'WALKTHROUGH' | 'SIMULATION' | 'FULL'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledDate: string
  actualDate?: string
  successRate?: number
  rtoAchieved?: number
  rpoAchieved?: number
}

const TYPE_BADGES = {
  BCP: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Plan de Continuidad' },
  DRP: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Plan de Recuperación' },
  HYBRID: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Híbrido BCP/DRP' },
}

const STATUS_BADGES = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700' },
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700' },
  UNDER_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ARCHIVED: { bg: 'bg-red-100', text: 'text-red-700' },
}

const CRITICALITY_COLORS = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
}

export default function BCPDRPPage() {
  const [plans, setPlans] = useState<BCPPlan[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<BCPPlan | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddProcessModal, setShowAddProcessModal] = useState(false)
  const [showScheduleTestModal, setShowScheduleTestModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'tests' | 'irp'>('overview')

  // Form states
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    type: 'BCP',
    scope: '',
    rto: 4,
    rpo: 1,
    mtpd: 72,
  })

  const [newProcess, setNewProcess] = useState({
    name: '',
    description: '',
    owner: '',
    department: '',
    criticality: 'HIGH',
    rto: 4,
    rpo: 1,
    mtpd: 72,
  })

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bcp')
      const data = await res.json()
      setPlans(data.plans || [])
      setMetrics(data.metrics || {})
    } catch (error) {
      console.error('Error fetching BCP plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlanDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/bcp/${id}`)
      const data = await res.json()
      setSelectedPlan(data.plan)
    } catch (error) {
      console.error('Error fetching plan details:', error)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const createPlan = async () => {
    try {
      const res = await fetch('/api/bcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createPlan', data: newPlan })
      })
      const data = await res.json()
      if (res.ok) {
        fetchPlans()
        setShowCreateModal(false)
        setNewPlan({
          name: '',
          description: '',
          type: 'BCP',
          scope: '',
          rto: 4,
          rpo: 1,
          mtpd: 72,
        })
      }
    } catch (error) {
      console.error('Error creating plan:', error)
    }
  }

  const addProcess = async () => {
    if (!selectedPlan) return
    try {
      const res = await fetch('/api/bcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addProcess', 
          data: { ...newProcess, bcpId: selectedPlan.id } 
        })
      })
      if (res.ok) {
        fetchPlanDetails(selectedPlan.id)
        setShowAddProcessModal(false)
        setNewProcess({
          name: '',
          description: '',
          owner: '',
          department: '',
          criticality: 'HIGH',
          rto: 4,
          rpo: 1,
          mtpd: 72,
        })
      }
    } catch (error) {
      console.error('Error adding process:', error)
    }
  }

  const activatePlan = async (planId: string) => {
    try {
      await fetch(`/api/bcp/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      })
      fetchPlans()
      if (selectedPlan?.id === planId) {
        fetchPlanDetails(planId)
      }
    } catch (error) {
      console.error('Error activating plan:', error)
    }
  }

  // Datos para gráficos
  const processesData = selectedPlan?.criticalProcesses.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    RTO: p.rto,
    RPO: p.rpo,
    target: selectedPlan.rto || 4
  })) || []

  const radarData = selectedPlan?.criticalProcesses.map(p => ({
    process: p.name.substring(0, 10),
    score: 10 - (p.rto / 10),
    strategies: p.recoveryStrategies.length * 2
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-500" />
            BCP / DRP
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Plan de Continuidad del Negocio y Recuperación ante Desastres
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Plan
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Planes Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalPlans || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Planes Activos</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activePlans || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Server className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Procesos Críticos</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.totalProcesses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FlaskConical className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pruebas Programadas</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.upcomingTests || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans List or Detail View */}
      {!selectedPlan ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Planes de Continuidad y Recuperación
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Cargando planes...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay planes configurados
              </h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer plan de continuidad del negocio
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Crear Plan
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedPlan(plan)
                    fetchPlanDetails(plan.id)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        plan.type === 'BCP' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        plan.type === 'DRP' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-indigo-100 dark:bg-indigo-900/30'
                      }`}>
                        {plan.type === 'DRP' ? (
                          <Zap className="h-6 w-6 text-purple-600" />
                        ) : (
                          <Building className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGES[plan.type].bg} ${TYPE_BADGES[plan.type].text}`}>
                            {TYPE_BADGES[plan.type].label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGES[plan.status].bg} ${STATUS_BADGES[plan.status].text}`}>
                            {plan.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {plan.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">{plan._count?.criticalProcesses || 0}</p>
                        <p>Procesos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">{plan.rto || 4}h</p>
                        <p>RTO</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">{plan.rpo || 1}h</p>
                        <p>RPO</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">v{plan.version}</p>
                        <p>Versión</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Plan Detail View */
        <div className="space-y-6">
          {/* Plan Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ← Volver
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedPlan.name}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGES[selectedPlan.status].bg} ${STATUS_BADGES[selectedPlan.status].text}`}>
                      {selectedPlan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {selectedPlan.status === 'DRAFT' && (
                  <button
                    onClick={() => activatePlan(selectedPlan.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Activar Plan
                  </button>
                )}
                <button
                  onClick={() => setShowAddProcessModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                  Agregar Proceso
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <nav className="flex gap-4">
                {(['overview', 'processes', 'tests', 'irp'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'overview' && 'Resumen'}
                    {tab === 'processes' && 'Procesos Críticos'}
                    {tab === 'tests' && 'Pruebas'}
                    {tab === 'irp' && 'Plan de Respuesta'}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Targets */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Objetivos de Recuperación
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">RTO (Recovery Time Objective)</p>
                        <p className="text-sm text-gray-500">Tiempo máximo de interrupción</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{selectedPlan.rto || 4}h</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">RPO (Recovery Point Objective)</p>
                        <p className="text-sm text-gray-500">Pérdida máxima de datos</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{selectedPlan.rpo || 1}h</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">MTPD (Max Tolerable Period)</p>
                        <p className="text-sm text-gray-500">Período máximo tolerable de disrupción</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{selectedPlan.mtpd || 72}h</p>
                  </div>
                </div>
              </div>

              {/* RTO/RPO Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  RTO/RPO por Proceso
                </h3>
                {processesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={processesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="RTO" fill="#3b82f6" name="RTO (horas)" />
                      <Bar dataKey="RPO" fill="#10b981" name="RPO (horas)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    No hay procesos definidos
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Resumen del Plan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">
                      {selectedPlan.criticalProcesses?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Procesos Críticos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {selectedPlan.criticalProcesses?.reduce((acc, p) => acc + p.recoveryStrategies.length, 0) || 0}
                    </p>
                    <p className="text-sm text-gray-500">Estrategias de Recuperación</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">
                      {selectedPlan.bcpTests?.filter(t => t.status === 'COMPLETED').length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Pruebas Completadas</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">
                      {selectedPlan.incidentResponsePlan ? '✓' : '✗'}
                    </p>
                    <p className="text-sm text-gray-500">Plan de Respuesta</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div className="space-y-4">
              {selectedPlan.criticalProcesses?.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg">
                  <Server className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay procesos críticos
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Define los procesos críticos de tu organización
                  </p>
                  <button
                    onClick={() => setShowAddProcessModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Agregar Proceso
                  </button>
                </div>
              ) : (
                selectedPlan.criticalProcesses?.map((process) => (
                  <div
                    key={process.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${CRITICALITY_COLORS[process.criticality]}`} />
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {process.name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {process.criticality}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{process.description}</p>
                      </div>
                      <div className="flex gap-4 text-center">
                        <div>
                          <p className="text-xl font-bold text-blue-600">{process.rto}h</p>
                          <p className="text-xs text-gray-500">RTO</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-green-600">{process.rpo}h</p>
                          <p className="text-xs text-gray-500">RPO</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-orange-600">{process.mtpd}h</p>
                          <p className="text-xs text-gray-500">MTPD</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {process.owner || 'Sin asignar'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {process.department || 'Sin departamento'}
                      </span>
                    </div>

                    {/* Recovery Strategies */}
                    {process.recoveryStrategies.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estrategias de Recuperación
                        </h5>
                        <div className="space-y-2">
                          {process.recoveryStrategies.map((strategy) => (
                            <div
                              key={strategy.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <span className="text-sm font-medium text-indigo-600">
                                #{strategy.priority}
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {strategy.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                {strategy.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historial de Pruebas
                </h3>
                <button
                  onClick={() => setShowScheduleTestModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Calendar className="h-5 w-5" />
                  Programar Prueba
                </button>
              </div>

              {selectedPlan.bcpTests?.length === 0 ? (
                <div className="text-center py-12">
                  <FlaskConical className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay pruebas registradas
                  </h3>
                  <p className="text-gray-500">
                    Programa pruebas regulares para validar tu plan
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPlan.bcpTests?.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          test.status === 'COMPLETED' ? 'bg-green-100' :
                          test.status === 'SCHEDULED' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          {test.status === 'COMPLETED' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Calendar className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{test.name}</p>
                          <p className="text-sm text-gray-500">
                            Tipo: {test.type} | Fecha: {new Date(test.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {test.status === 'COMPLETED' && test.successRate && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{test.successRate}%</p>
                          <p className="text-sm text-gray-500">Éxito</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'irp' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              {selectedPlan.incidentResponsePlan ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedPlan.incidentResponsePlan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedPlan.incidentResponsePlan.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sin Plan de Respuesta a Incidentes
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crea un plan para responder eficientemente a incidentes
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Crear Plan de Respuesta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Crear Nuevo Plan
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Plan de Continuidad Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={newPlan.type}
                  onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="BCP">Plan de Continuidad del Negocio</option>
                  <option value="DRP">Plan de Recuperación ante Desastres</option>
                  <option value="HYBRID">Híbrido BCP/DRP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RTO (horas)
                  </label>
                  <input
                    type="number"
                    value={newPlan.rto}
                    onChange={(e) => setNewPlan({ ...newPlan, rto: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RPO (horas)
                  </label>
                  <input
                    type="number"
                    value={newPlan.rpo}
                    onChange={(e) => setNewPlan({ ...newPlan, rpo: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    MTPD (horas)
                  </label>
                  <input
                    type="number"
                    value={newPlan.mtpd}
                    onChange={(e) => setNewPlan({ ...newPlan, mtpd: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={createPlan}
                disabled={!newPlan.name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Crear Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Process Modal */}
      {showAddProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Agregar Proceso Crítico
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Proceso
                </label>
                <input
                  type="text"
                  value={newProcess.name}
                  onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Sistema de Facturación"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={newProcess.owner}
                    onChange={(e) => setNewProcess({ ...newProcess, owner: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={newProcess.department}
                    onChange={(e) => setNewProcess({ ...newProcess, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nivel de Criticidad
                </label>
                <select
                  value={newProcess.criticality}
                  onChange={(e) => setNewProcess({ ...newProcess, criticality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="CRITICAL">Crítico</option>
                  <option value="HIGH">Alto</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="LOW">Bajo</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RTO (horas)
                  </label>
                  <input
                    type="number"
                    value={newProcess.rto}
                    onChange={(e) => setNewProcess({ ...newProcess, rto: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RPO (horas)
                  </label>
                  <input
                    type="number"
                    value={newProcess.rpo}
                    onChange={(e) => setNewProcess({ ...newProcess, rpo: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    MTPD (horas)
                  </label>
                  <input
                    type="number"
                    value={newProcess.mtpd}
                    onChange={(e) => setNewProcess({ ...newProcess, mtpd: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newProcess.description}
                  onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddProcessModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={addProcess}
                disabled={!newProcess.name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Agregar Proceso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
