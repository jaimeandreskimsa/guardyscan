"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, Plus, Search, Filter, Building2, Globe, Shield, AlertTriangle,
  Database, Server, Cloud, CreditCard, Truck, Users, MoreVertical, Edit,
  Trash2, Eye, FileText, Calendar, CheckCircle2, XCircle, Clock, X,
  Lock, Unlock, Link2, ExternalLink, ArrowUpRight, ArrowDownRight, Minus,
  RefreshCw, Download, Upload, ChevronDown, BarChart3
} from "lucide-react";

// Tipos de proveedor
const vendorTypes = [
  { id: "cloud", name: "Cloud/SaaS", icon: Cloud, color: "bg-blue-500" },
  { id: "it_services", name: "Servicios IT", icon: Server, color: "bg-purple-500" },
  { id: "software", name: "Software", icon: Database, color: "bg-cyan-500" },
  { id: "financial", name: "Financiero", icon: CreditCard, color: "bg-green-500" },
  { id: "logistics", name: "Logística", icon: Truck, color: "bg-orange-500" },
  { id: "professional", name: "Servicios Profesionales", icon: Users, color: "bg-pink-500" },
  { id: "telecom", name: "Telecomunicaciones", icon: Network, color: "bg-indigo-500" },
  { id: "other", name: "Otros", icon: Building2, color: "bg-gray-500" },
];

// Tipos de conexión
const connectionTypes = [
  { id: "api", name: "API REST/SOAP", description: "Integración vía API" },
  { id: "vpn", name: "VPN Site-to-Site", description: "Conexión privada dedicada" },
  { id: "sftp", name: "SFTP/FTP", description: "Transferencia de archivos" },
  { id: "database", name: "Conexión BD", description: "Acceso directo a base de datos" },
  { id: "web", name: "Portal Web", description: "Acceso via navegador" },
  { id: "saas", name: "SaaS Cloud", description: "Servicio en la nube" },
  { id: "onpremise", name: "On-Premise", description: "Instalación local" },
  { id: "none", name: "Sin conexión directa", description: "Solo intercambio manual" },
];

// Tipos de información
const dataTypes = [
  { id: "pii", name: "Datos Personales (PII)", sensitive: true },
  { id: "financial", name: "Datos Financieros", sensitive: true },
  { id: "health", name: "Datos de Salud (PHI)", sensitive: true },
  { id: "credentials", name: "Credenciales/Accesos", sensitive: true },
  { id: "business", name: "Información de Negocio", sensitive: false },
  { id: "public", name: "Información Pública", sensitive: false },
  { id: "technical", name: "Datos Técnicos", sensitive: false },
  { id: "none", name: "Sin acceso a datos", sensitive: false },
];

// Certificaciones comunes
const certifications = [
  "ISO 27001", "ISO 27017", "ISO 27018", "SOC 2 Type I", "SOC 2 Type II",
  "PCI DSS", "HIPAA", "GDPR", "CSA STAR", "FedRAMP", "Ley 21.663"
];

// Datos de ejemplo
const initialVendors = [
  {
    id: "1",
    vendorName: "Amazon Web Services",
    vendorType: "cloud",
    connectionType: "api",
    dataTypes: ["business", "technical", "pii"],
    criticality: "CRITICAL",
    riskScore: 25,
    securityRating: "A",
    systemAccess: true,
    dataAccess: true,
    certifications: ["ISO 27001", "SOC 2 Type II", "PCI DSS", "CSA STAR"],
    contractValue: 50000,
    contractEnd: "2027-12-31",
    lastAssessment: "2026-01-10",
    nextAssessment: "2026-07-10",
    complianceStatus: "COMPLIANT",
    geographicLocation: "Estados Unidos",
    contactName: "Enterprise Support",
    contactEmail: "aws-support@amazon.com",
    notes: "Proveedor principal de infraestructura cloud. Servicios: EC2, S3, RDS, Lambda.",
  },
  {
    id: "2",
    vendorName: "Microsoft 365",
    vendorType: "software",
    connectionType: "saas",
    dataTypes: ["pii", "business", "credentials"],
    criticality: "CRITICAL",
    riskScore: 30,
    securityRating: "A",
    systemAccess: true,
    dataAccess: true,
    certifications: ["ISO 27001", "SOC 2 Type II", "GDPR"],
    contractValue: 25000,
    contractEnd: "2026-12-31",
    lastAssessment: "2025-11-15",
    nextAssessment: "2026-05-15",
    complianceStatus: "COMPLIANT",
    geographicLocation: "Estados Unidos / Chile",
    contactName: "Account Manager",
    contactEmail: "soporte@microsoft.com",
    notes: "Suite de productividad corporativa. Incluye email, Teams, SharePoint, OneDrive.",
  },
  {
    id: "3",
    vendorName: "Banco Santander",
    vendorType: "financial",
    connectionType: "api",
    dataTypes: ["financial", "pii"],
    criticality: "HIGH",
    riskScore: 35,
    securityRating: "A",
    systemAccess: false,
    dataAccess: true,
    certifications: ["PCI DSS", "ISO 27001"],
    contractValue: 15000,
    contractEnd: "2026-06-30",
    lastAssessment: "2025-12-20",
    nextAssessment: "2026-06-20",
    complianceStatus: "COMPLIANT",
    geographicLocation: "Chile",
    contactName: "Ejecutivo Empresas",
    contactEmail: "empresas@santander.cl",
    notes: "Banco principal para operaciones. API para conciliación bancaria automática.",
  },
  {
    id: "4",
    vendorName: "Empresa de Limpieza ABC",
    vendorType: "professional",
    connectionType: "none",
    dataTypes: ["none"],
    criticality: "LOW",
    riskScore: 15,
    securityRating: null,
    systemAccess: false,
    dataAccess: false,
    certifications: [],
    contractValue: 5000,
    contractEnd: "2026-12-31",
    lastAssessment: null,
    nextAssessment: null,
    complianceStatus: "UNKNOWN",
    geographicLocation: "Chile",
    contactName: "Supervisor",
    contactEmail: "contacto@limpiezaabc.cl",
    notes: "Servicio de aseo de oficinas. Sin acceso a sistemas ni información.",
  },
  {
    id: "5",
    vendorName: "DataCenter Chile",
    vendorType: "it_services",
    connectionType: "vpn",
    dataTypes: ["technical", "credentials"],
    criticality: "HIGH",
    riskScore: 45,
    securityRating: "B",
    systemAccess: true,
    dataAccess: true,
    certifications: ["ISO 27001", "Ley 21.663"],
    contractValue: 35000,
    contractEnd: "2027-03-31",
    lastAssessment: "2025-10-01",
    nextAssessment: "2026-04-01",
    complianceStatus: "UNDER_REVIEW",
    geographicLocation: "Chile",
    contactName: "Soporte Técnico",
    contactEmail: "soporte@datacenter.cl",
    notes: "Colocation de servidores on-premise. VPN permanente para administración.",
  },
  {
    id: "6",
    vendorName: "Consultora Legal Partners",
    vendorType: "professional",
    connectionType: "web",
    dataTypes: ["pii", "business"],
    criticality: "MEDIUM",
    riskScore: 55,
    securityRating: "C",
    systemAccess: false,
    dataAccess: true,
    certifications: [],
    contractValue: 20000,
    contractEnd: "2026-08-31",
    lastAssessment: "2025-08-15",
    nextAssessment: "2026-02-15",
    complianceStatus: "NON_COMPLIANT",
    geographicLocation: "Chile",
    contactName: "Abogado Principal",
    contactEmail: "contacto@legalpartners.cl",
    notes: "Asesoría legal corporativa. Acceso a documentos confidenciales vía portal.",
  },
];

export default function ThirdPartyPage() {
  const [vendors, setVendors] = useState(initialVendors);
  const [filteredVendors, setFilteredVendors] = useState(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterCriticality, setFilterCriticality] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<typeof initialVendors[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estado para nuevo/editar vendor
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorType: "cloud",
    connectionType: "api",
    dataTypes: [] as string[],
    criticality: "MEDIUM",
    systemAccess: false,
    dataAccess: false,
    certifications: [] as string[],
    contractValue: 0,
    contractEnd: "",
    geographicLocation: "",
    contactName: "",
    contactEmail: "",
    notes: "",
  });

  // Filtrar vendors
  useEffect(() => {
    let result = vendors;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.vendorName.toLowerCase().includes(query) ||
        v.notes?.toLowerCase().includes(query)
      );
    }
    
    if (filterType) {
      result = result.filter(v => v.vendorType === filterType);
    }
    
    if (filterCriticality) {
      result = result.filter(v => v.criticality === filterCriticality);
    }
    
    setFilteredVendors(result);
  }, [vendors, searchQuery, filterType, filterCriticality]);

  // Estadísticas
  const stats = {
    total: vendors.length,
    critical: vendors.filter(v => v.criticality === "CRITICAL").length,
    highRisk: vendors.filter(v => v.riskScore >= 50).length,
    nonCompliant: vendors.filter(v => v.complianceStatus === "NON_COMPLIANT").length,
    pendingReview: vendors.filter(v => 
      v.nextAssessment && new Date(v.nextAssessment) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length,
  };

  // Helpers
  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "CRITICAL": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "HIGH": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "MEDIUM": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 30) return "text-yellow-500";
    return "text-green-500";
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "COMPLIANT": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "NON_COMPLIANT": return <XCircle className="h-4 w-4 text-red-500" />;
      case "UNDER_REVIEW": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVendorTypeInfo = (typeId: string) => {
    return vendorTypes.find(t => t.id === typeId) || vendorTypes[7];
  };

  // Manejar submit
  const handleSubmit = () => {
    const riskScore = calculateRiskScore();
    const today = new Date().toISOString().split('T')[0];
    const nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (isEditing && selectedVendor) {
      setVendors(vendors.map(v => 
        v.id === selectedVendor.id 
          ? { ...v, ...formData, riskScore, securityRating: getRatingFromScore(riskScore), complianceStatus: "UNDER_REVIEW" as any, lastAssessment: today, nextAssessment: nextReview }
          : v
      ));
    } else {
      const newVendor = {
        id: Date.now().toString(),
        ...formData,
        riskScore,
        securityRating: getRatingFromScore(riskScore),
        lastAssessment: today,
        nextAssessment: nextReview,
        complianceStatus: "UNKNOWN" as any,
      };
      setVendors([newVendor, ...vendors] as any);
    }
    
    closeModal();
  };

  const calculateRiskScore = () => {
    let score = 20; // Base
    
    // Criticidad
    if (formData.criticality === "CRITICAL") score += 25;
    else if (formData.criticality === "HIGH") score += 15;
    else if (formData.criticality === "MEDIUM") score += 8;
    
    // Accesos
    if (formData.systemAccess) score += 15;
    if (formData.dataAccess) score += 10;
    
    // Tipos de datos sensibles
    const sensitiveData = formData.dataTypes.filter(d => 
      dataTypes.find(dt => dt.id === d)?.sensitive
    ).length;
    score += sensitiveData * 8;
    
    // Reducir por certificaciones
    score -= formData.certifications.length * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const getRatingFromScore = (score: number) => {
    if (score <= 25) return "A";
    if (score <= 40) return "B";
    if (score <= 60) return "C";
    if (score <= 80) return "D";
    return "F";
  };

  const openNewVendor = () => {
    setIsEditing(false);
    setSelectedVendor(null);
    setFormData({
      vendorName: "",
      vendorType: "cloud",
      connectionType: "api",
      dataTypes: [],
      criticality: "MEDIUM",
      systemAccess: false,
      dataAccess: false,
      certifications: [],
      contractValue: 0,
      contractEnd: "",
      geographicLocation: "",
      contactName: "",
      contactEmail: "",
      notes: "",
    });
    setShowModal(true);
  };

  const openEditVendor = (vendor: typeof initialVendors[0]) => {
    setIsEditing(true);
    setSelectedVendor(vendor);
    setFormData({
      vendorName: vendor.vendorName,
      vendorType: vendor.vendorType,
      connectionType: vendor.connectionType,
      dataTypes: vendor.dataTypes,
      criticality: vendor.criticality,
      systemAccess: vendor.systemAccess,
      dataAccess: vendor.dataAccess,
      certifications: vendor.certifications,
      contractValue: vendor.contractValue,
      contractEnd: vendor.contractEnd,
      geographicLocation: vendor.geographicLocation,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      notes: vendor.notes || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVendor(null);
    setIsEditing(false);
  };

  const deleteVendor = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este proveedor?")) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const toggleDataType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(typeId)
        ? prev.dataTypes.filter(t => t !== typeId)
        : [...prev.dataTypes, typeId]
    }));
  };

  const toggleCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Network className="h-8 w-8 text-purple-600" />
            Gestión de Terceros
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra proveedores, servicios externos y evalúa riesgos de terceros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            onClick={openNewVendor}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Proveedor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-purple-100 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Proveedores</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <Network className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 border-red-100 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-100 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alto Riesgo</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highRisk}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 border-amber-100 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">No Cumplen</p>
                <p className="text-2xl font-bold text-amber-600">{stats.nonCompliant}</p>
              </div>
              <XCircle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-100 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revisión Pendiente</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterType || ""}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los tipos</option>
              {vendorTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterCriticality || ""}
              onChange={(e) => setFilterCriticality(e.target.value || null)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las criticidades</option>
              <option value="CRITICAL">Crítico</option>
              <option value="HIGH">Alto</option>
              <option value="MEDIUM">Medio</option>
              <option value="LOW">Bajo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores y Servicios de Terceros</CardTitle>
          <CardDescription>
            {filteredVendors.length} proveedor{filteredVendors.length !== 1 ? "es" : ""} registrado{filteredVendors.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay proveedores
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterType || filterCriticality
                  ? "No se encontraron proveedores con esos criterios"
                  : "Agrega tu primer proveedor para comenzar"}
              </p>
              <Button onClick={openNewVendor}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Proveedor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVendors.map((vendor) => {
                const typeInfo = getVendorTypeInfo(vendor.vendorType);
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={vendor.id}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Info principal */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-xl ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {vendor.vendorName}
                            </h3>
                            <Badge className={getCriticalityColor(vendor.criticality)}>
                              {vendor.criticality}
                            </Badge>
                            {vendor.systemAccess && (
                              <Badge variant="outline" className="text-xs">
                                <Server className="h-3 w-3 mr-1" />
                                Acceso Sistema
                              </Badge>
                            )}
                            {vendor.dataAccess && (
                              <Badge variant="outline" className="text-xs">
                                <Database className="h-3 w-3 mr-1" />
                                Acceso Datos
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {typeInfo.name} • {connectionTypes.find(c => c.id === vendor.connectionType)?.name}
                            {vendor.geographicLocation && ` • ${vendor.geographicLocation}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {vendor.dataTypes.slice(0, 3).map((dt, idx) => {
                              const dataType = dataTypes.find(d => d.id === dt);
                              return (
                                <span 
                                  key={idx}
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    dataType?.sensitive 
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {dataType?.name}
                                </span>
                              );
                            })}
                            {vendor.dataTypes.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{vendor.dataTypes.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="flex items-center gap-6 lg:gap-8">
                        {/* Risk Score */}
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getRiskColor(vendor.riskScore)}`}>
                            {vendor.riskScore}
                          </div>
                          <div className="text-xs text-gray-500">Risk Score</div>
                        </div>

                        {/* Security Rating */}
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            vendor.securityRating === "A" ? "text-green-500" :
                            vendor.securityRating === "B" ? "text-blue-500" :
                            vendor.securityRating === "C" ? "text-yellow-500" :
                            vendor.securityRating === "D" ? "text-orange-500" :
                            vendor.securityRating === "F" ? "text-red-500" : "text-gray-400"
                          }`}>
                            {vendor.securityRating || "-"}
                          </div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>

                        {/* Compliance */}
                        <div className="text-center">
                          <div className="flex justify-center">
                            {getComplianceIcon(vendor.complianceStatus)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {vendor.complianceStatus === "COMPLIANT" ? "Cumple" :
                             vendor.complianceStatus === "NON_COMPLIANT" ? "No Cumple" :
                             vendor.complianceStatus === "UNDER_REVIEW" ? "En Revisión" : "Desconocido"}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(vendor);
                            }}
                            className="h-8 w-8 p-0"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditVendor(vendor)}
                            className="h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteVendor(vendor.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Certificaciones */}
                    {vendor.certifications.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500 mr-2">Certificaciones:</span>
                          {vendor.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <Shield className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Agregar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Información del Proveedor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre del Proveedor *
                    </label>
                    <input
                      type="text"
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Proveedor
                    </label>
                    <select
                      value={formData.vendorType}
                      onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {vendorTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Criticidad
                    </label>
                    <select
                      value={formData.criticality}
                      onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="CRITICAL">Crítico</option>
                      <option value="HIGH">Alto</option>
                      <option value="MEDIUM">Medio</option>
                      <option value="LOW">Bajo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ubicación Geográfica
                    </label>
                    <input
                      type="text"
                      value={formData.geographicLocation}
                      onChange={(e) => setFormData({ ...formData, geographicLocation: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="País o región"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor del Contrato (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.contractValue}
                      onChange={(e) => setFormData({ ...formData, contractValue: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fin del Contrato
                    </label>
                    <input
                      type="date"
                      value={formData.contractEnd}
                      onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contacto Principal
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nombre del contacto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="email@proveedor.com"
                    />
                  </div>
                </div>
              </div>

              {/* Conexión y Accesos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-500" />
                  Tipo de Conexión y Accesos
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Conexión
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {connectionTypes.map(conn => (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, connectionType: conn.id })}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.connectionType === conn.id
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                            : "border-gray-200 dark:border-gray-600 hover:border-purple-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{conn.name}</div>
                        <div className="text-xs text-gray-500">{conn.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.systemAccess}
                      onChange={(e) => setFormData({ ...formData, systemAccess: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">
                      <Server className="h-4 w-4 inline mr-1" />
                      Acceso a Sistemas
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dataAccess}
                      onChange={(e) => setFormData({ ...formData, dataAccess: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">
                      <Database className="h-4 w-4 inline mr-1" />
                      Acceso a Datos
                    </span>
                  </label>
                </div>
              </div>

              {/* Tipos de Información */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-500" />
                  Tipo de Información Compartida
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dataTypes.map(dt => (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => toggleDataType(dt.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.dataTypes.includes(dt.id)
                          ? dt.sensitive
                            ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                            : "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                          : "border-gray-200 dark:border-gray-600 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {formData.dataTypes.includes(dt.id) && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        <span className="font-medium text-sm">{dt.name}</span>
                      </div>
                      {dt.sensitive && (
                        <span className="text-xs text-red-500">⚠️ Sensible</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificaciones */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Certificaciones de Seguridad
                </h3>
                <div className="flex flex-wrap gap-2">
                  {certifications.map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCertification(cert)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.certifications.includes(cert)
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {formData.certifications.includes(cert) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Descripción del servicio, observaciones, etc."
                />
              </div>

              {/* Preview Risk Score */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Risk Score Estimado:
                  </span>
                  <div className={`text-2xl font-bold ${getRiskColor(calculateRiskScore())}`}>
                    {calculateRiskScore()}/100
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      calculateRiskScore() >= 70 ? "bg-red-500" :
                      calculateRiskScore() >= 50 ? "bg-orange-500" :
                      calculateRiskScore() >= 30 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${calculateRiskScore()}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.vendorName}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                {isEditing ? "Guardar Cambios" : "Agregar Proveedor"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {selectedVendor && !showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${getVendorTypeInfo(selectedVendor.vendorType).color} flex items-center justify-center`}>
                    {(() => {
                      const TypeIcon = getVendorTypeInfo(selectedVendor.vendorType).icon;
                      return <TypeIcon className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedVendor.vendorName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getVendorTypeInfo(selectedVendor.vendorType).name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedVendor(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`text-3xl font-bold ${getRiskColor(selectedVendor.riskScore)}`}>
                    {selectedVendor.riskScore}
                  </div>
                  <div className="text-sm text-gray-500">Risk Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`text-3xl font-bold ${
                    selectedVendor.securityRating === "A" ? "text-green-500" :
                    selectedVendor.securityRating === "B" ? "text-blue-500" :
                    selectedVendor.securityRating === "C" ? "text-yellow-500" :
                    selectedVendor.securityRating === "D" ? "text-orange-500" : "text-red-500"
                  }`}>
                    {selectedVendor.securityRating || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">Security Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex justify-center mb-1">
                    {getComplianceIcon(selectedVendor.complianceStatus)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedVendor.complianceStatus === "COMPLIANT" ? "Cumple" :
                     selectedVendor.complianceStatus === "NON_COMPLIANT" ? "No Cumple" :
                     selectedVendor.complianceStatus === "UNDER_REVIEW" ? "En Revisión" : "Desconocido"}
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Criticidad:</span>
                  <Badge className={`ml-2 ${getCriticalityColor(selectedVendor.criticality)}`}>
                    {selectedVendor.criticality}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Tipo de Conexión:</span>
                  <span className="ml-2 font-medium">
                    {connectionTypes.find(c => c.id === selectedVendor.connectionType)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Ubicación:</span>
                  <span className="ml-2 font-medium">{selectedVendor.geographicLocation || "No especificada"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Valor Contrato:</span>
                  <span className="ml-2 font-medium">${selectedVendor.contractValue?.toLocaleString() || 0} USD</span>
                </div>
                <div>
                  <span className="text-gray-500">Fin Contrato:</span>
                  <span className="ml-2 font-medium">{selectedVendor.contractEnd || "No definido"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Última Evaluación:</span>
                  <span className="ml-2 font-medium">{selectedVendor.lastAssessment || "Nunca"}</span>
                </div>
              </div>

              {/* Accesos */}
              <div className="flex gap-4">
                <div className={`flex-1 p-3 rounded-lg ${selectedVendor.systemAccess ? "bg-orange-50 dark:bg-orange-900/20" : "bg-gray-50 dark:bg-gray-700/50"}`}>
                  <div className="flex items-center gap-2">
                    <Server className={`h-5 w-5 ${selectedVendor.systemAccess ? "text-orange-500" : "text-gray-400"}`} />
                    <span className="font-medium">Acceso a Sistemas</span>
                  </div>
                  <span className={`text-sm ${selectedVendor.systemAccess ? "text-orange-600" : "text-gray-500"}`}>
                    {selectedVendor.systemAccess ? "Sí" : "No"}
                  </span>
                </div>
                <div className={`flex-1 p-3 rounded-lg ${selectedVendor.dataAccess ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-700/50"}`}>
                  <div className="flex items-center gap-2">
                    <Database className={`h-5 w-5 ${selectedVendor.dataAccess ? "text-red-500" : "text-gray-400"}`} />
                    <span className="font-medium">Acceso a Datos</span>
                  </div>
                  <span className={`text-sm ${selectedVendor.dataAccess ? "text-red-600" : "text-gray-500"}`}>
                    {selectedVendor.dataAccess ? "Sí" : "No"}
                  </span>
                </div>
              </div>

              {/* Tipos de datos */}
              {selectedVendor.dataTypes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tipos de Información:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.dataTypes.map((dt, idx) => {
                      const dataType = dataTypes.find(d => d.id === dt);
                      return (
                        <Badge 
                          key={idx}
                          className={dataType?.sensitive 
                            ? "bg-red-100 text-red-700" 
                            : "bg-gray-100 text-gray-700"
                          }
                        >
                          {dataType?.name}
                          {dataType?.sensitive && " ⚠️"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Certificaciones */}
              {selectedVendor.certifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Certificaciones:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.certifications.map((cert, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-700">
                        <Shield className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacto */}
              {(selectedVendor.contactName || selectedVendor.contactEmail) && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contacto
                  </h4>
                  <p className="text-sm">{selectedVendor.contactName}</p>
                  <p className="text-sm text-blue-600">{selectedVendor.contactEmail}</p>
                </div>
              )}

              {/* Notas */}
              {selectedVendor.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notas:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    {selectedVendor.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                Cerrar
              </Button>
              <Button onClick={() => openEditVendor(selectedVendor)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
