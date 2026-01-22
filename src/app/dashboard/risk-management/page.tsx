"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Shield, Target, Building, Calculator, Users, BarChart3, TrendingDown } from "lucide-react";
import RiskHeatMap from "@/components/charts/RiskHeatMap";
import RiskTrendChart from "@/components/charts/RiskTrendChart";
import MonteCarloChart from "@/components/charts/MonteCarloChart";
import BIAMatrix from "@/components/charts/BIAMatrix";

interface Risk {
  id: string;
  title: string;
  category: string;
  probability: number;
  impact: number;
  riskScore: number;
  status: string;
  owner: string;
}

interface BIA {
  id: string;
  assetName: string;
  assetType?: string;
  businessFunction?: string;
  criticality: string;
  rto: number;
  rpo: number;
  mtpd?: number;
  financialImpact: any;
  operationalImpact?: string;
  reputationalImpact?: string;
}

interface ThirdParty {
  id: string;
  vendorName: string;
  criticality: string;
  riskScore: number;
  securityRating: string;
}

export default function RiskManagementPage() {
  const { data: session } = useSession();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [biaData, setBiaData] = useState<BIA[]>([]);
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const [risksRes, biaRes, tpRes, simulationsRes] = await Promise.all([
        fetch("/api/risk-management/risks"),
        fetch("/api/risk-management/bia"),
        fetch("/api/risk-management/third-party"),
        fetch("/api/risk-management/simulations")
      ]);

      const risksData = await risksRes.json();
      const biaData = await biaRes.json();
      const tpData = await tpRes.json();
      const simulationsData = await simulationsRes.json();

      setRisks(risksData || []);
      setBiaData(biaData || []);
      setThirdParties(tpData || []);
      setSimulations(simulationsData || []);
    } catch (error) {
      console.error("Error loading risk data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runMonteCarloSimulation = async () => {
    try {
      await fetch("/api/risk-management/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Risk Portfolio Simulation",
          description: "Monte Carlo simulation of current risk portfolio",
          riskFactors: risks.map(r => ({
            name: r.title,
            probability: r.probability,
            impact: r.impact * 100000, // Convert to monetary value
            distribution: "normal"
          })),
          iterations: 10000
        })
      });
      loadRiskData();
    } catch (error) {
      console.error("Error running simulation:", error);
    }
  };

  const generateDemoData = async () => {
    try {
      // Create demo risks
      const demoRisks = [
        {
          title: "Ransomware Attack",
          description: "Critical systems compromised by ransomware",
          category: "cyber",
          probability: 0.15,
          impact: 4.5
        },
        {
          title: "Third-party Data Breach",
          description: "Vendor security incident exposing customer data",
          category: "compliance",
          probability: 0.08,
          impact: 3.8
        },
        {
          title: "Cloud Service Outage",
          description: "Extended outage of critical cloud infrastructure",
          category: "operational",
          probability: 0.25,
          impact: 3.2
        }
      ];

      for (const risk of demoRisks) {
        await fetch("/api/risk-management/risks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(risk)
        });
      }

      // Create demo BIA
      const demoBIA = [
        {
          assetName: "Customer Database",
          assetType: "data",
          businessFunction: "Customer Management",
          criticality: "CRITICAL",
          rto: 4,
          rpo: 1,
          financialImpact: { "1h": 50000, "4h": 200000, "24h": 1000000 }
        },
        {
          assetName: "Payment Processing System",
          assetType: "system",
          businessFunction: "Revenue Generation",
          criticality: "CRITICAL",
          rto: 2,
          rpo: 0.5,
          financialImpact: { "1h": 100000, "4h": 500000, "24h": 2000000 }
        }
      ];

      for (const bia of demoBIA) {
        await fetch("/api/risk-management/bia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bia)
        });
      }

      loadRiskData();
    } catch (error) {
      console.error("Error generating demo data:", error);
    }
  };

  // Calculate metrics
  const criticalRisks = risks.filter(r => r.riskScore >= 4.0).length;
  const highRisks = risks.filter(r => r.riskScore >= 3.0 && r.riskScore < 4.0).length;
  const avgRiskScore = risks.length > 0 ? risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length : 0;
  const criticalAssets = biaData.filter(b => b.criticality === "CRITICAL").length;
  const highRiskVendors = thirdParties.filter(tp => tp.riskScore >= 70).length;

  const getRiskColor = (score: number) => {
    if (score >= 4.0) return "bg-red-500";
    if (score >= 3.0) return "bg-orange-500";
    if (score >= 2.0) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getCriticalityBadge = (criticality: string) => {
    const colors = {
      CRITICAL: "destructive",
      HIGH: "secondary",
      MEDIUM: "outline",
      LOW: "outline"
    };
    return colors[criticality as keyof typeof colors] || "outline";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Gestión de Riesgos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Evaluación Cuantitativa de Riesgos y Análisis de Impacto al Negocio
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={runMonteCarloSimulation}>
            <Calculator className="mr-2 h-4 w-4" />
            Monte Carlo
          </Button>
          <Button onClick={generateDemoData} variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Datos Demo
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Riesgos Críticos
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {criticalRisks}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Score ≥ 4.0
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Riesgos Altos
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              {highRisks}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Score 3.0-3.9
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Puntuación Promedio
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {avgRiskScore.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Promedio del portafolio
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Activos Críticos
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {criticalAssets}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              BIA críticos
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Proveedores Alto Riesgo
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {highRiskVendors}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Terceros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Mapa de Calor de Riesgos
            </CardTitle>
            <CardDescription>Distribución de riesgos por probabilidad vs impacto</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskHeatMap data={risks.map(r => ({
              name: r.title,
              probability: r.probability,
              impact: r.impact,
              riskScore: r.riskScore,
              category: r.category
            }))} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Análisis de Tendencias de Riesgos
            </CardTitle>
            <CardDescription>Evolución de riesgos en el tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskTrendChart data={[
              { month: 'Ene', inherentRisk: 3.5, residualRisk: 2.1, riskAppetite: 2.5, newRisks: 2 },
              { month: 'Feb', inherentRisk: 3.8, residualRisk: 2.3, riskAppetite: 2.5, newRisks: 3 },
              { month: 'Mar', inherentRisk: 4.0, residualRisk: 2.5, riskAppetite: 2.5, newRisks: 1 },
              { month: 'Abr', inherentRisk: 3.9, residualRisk: 2.4, riskAppetite: 2.5, newRisks: 0 },
              { month: 'May', inherentRisk: 3.7, residualRisk: 2.2, riskAppetite: 2.5, newRisks: risks.length },
            ]} />
          </CardContent>
        </Card>
      </div>

      {/* Business Impact Analysis */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Matriz de Análisis de Impacto al Negocio
          </CardTitle>
          <CardDescription>Activos críticos y sus objetivos de recuperación</CardDescription>
        </CardHeader>
        <CardContent>
          <BIAMatrix data={biaData.map(b => ({
            id: b.id,
            assetName: b.assetName,
            assetType: b.assetType || 'system',
            businessFunction: b.businessFunction || 'General',
            criticality: b.criticality as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
            rto: b.rto,
            rpo: b.rpo,
            mtpd: b.mtpd || null,
            financialImpact: typeof b.financialImpact === 'object' ? null : (b.financialImpact as number),
            operationalImpact: b.operationalImpact || null,
            reputationalImpact: b.reputationalImpact || null
          }))} />
        </CardContent>
      </Card>

      {/* Monte Carlo Results */}
      {simulations.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Resultados Simulación Monte Carlo
            </CardTitle>
            <CardDescription>Análisis cuantitativo de riesgos y cálculos VaR</CardDescription>
          </CardHeader>
          <CardContent>
            <MonteCarloChart data={simulations[0]} />
          </CardContent>
        </Card>
      )}

      {/* Risk Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Principales Riesgos
            </CardTitle>
            <CardDescription>Riesgos de mayor prioridad que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            {risks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se identificaron riesgos</p>
                <Button onClick={generateDemoData} className="mt-4">
                  Generar Riesgos Demo
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {risks
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 10)
                  .map((risk) => (
                    <div key={risk.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className={`w-3 h-3 rounded-full mt-2 ${getRiskColor(risk.riskScore)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{risk.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {risk.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Score: {risk.riskScore.toFixed(1)}</span>
                          <span>P: {(risk.probability * 100).toFixed(0)}%</span>
                          <span>I: {risk.impact.toFixed(1)}</span>
                          <span>Owner: {risk.owner || "Unassigned"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Evaluación de Riesgos de Terceros
            </CardTitle>
            <CardDescription>Evaluación de riesgos de seguridad de proveedores</CardDescription>
          </CardHeader>
          <CardContent>
            {thirdParties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sin evaluaciones de terceros</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {thirdParties
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 10)
                  .map((vendor) => (
                    <div key={vendor.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{vendor.vendorName}</span>
                          <Badge variant={getCriticalityBadge(vendor.criticality) as any} className="text-xs">
                            {vendor.criticality}
                          </Badge>
                          {vendor.securityRating && (
                            <Badge variant="outline" className="text-xs">
                              Rating: {vendor.securityRating}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Risk Score: {vendor.riskScore.toFixed(0)}/100</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}