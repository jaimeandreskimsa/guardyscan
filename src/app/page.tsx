"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Lock, FileCheck, TrendingUp, Users, Zap, ArrowRight, Play, Sparkles, ChevronRight, Globe, BarChart3, Eye, Mail, Phone, MapPin, Send, AlertTriangle, Activity, Server, Wifi, Database, Monitor } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [activeDemo, setActiveDemo] = useState("dashboard");

  // Smooth scroll function - fintech style
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.");
    setContactForm({ name: "", email: "", company: "", message: "" });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 scroll-smooth">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="GuardyScan"
                width={200}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => smoothScrollTo('features')} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Caracteristicas
              </button>
              <button 
                onClick={() => smoothScrollTo('demo')} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Demo
              </button>
              <button 
                onClick={() => smoothScrollTo('pricing')} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Precios
              </button>
              <button 
                onClick={() => smoothScrollTo('contact')} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Contacto
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-sm font-medium">
                  Iniciar Sesion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25">
                  Crear Cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4" />
              Plataforma de Ciberseguridad #1 en Latinoamerica
              <ChevronRight className="h-4 w-4" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                Protege tu empresa
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                con inteligencia
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              SIEM avanzado, gestion de riesgos cuantitativa, cumplimiento ISO 27001 y 
              analisis de vulnerabilidades. Todo en una sola plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
                  Contratar Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => smoothScrollTo('demo')}
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">150+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Empresas protegidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">2M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Amenazas detectadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Uptime garantizado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitoreo continuo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">SIEM Avanzado</div>
                <div className="text-sm text-gray-500">Deteccion con ML</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Gestion de Riesgos</div>
                <div className="text-sm text-gray-500">Analisis cuantitativo</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">ISO 27001</div>
                <div className="text-sm text-gray-500">Cumplimiento total</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Ley 21.663</div>
                <div className="text-sm text-gray-500">Marco ciberseguridad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Funcionalidades
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Herramientas de nivel enterprise para proteger tu organizacion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">SIEM Avanzado</CardTitle>
                <CardDescription className="text-base">
                  Sistema de monitoreo con machine learning para deteccion de anomalias en tiempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-shadow">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Gestion de Riesgos</CardTitle>
                <CardDescription className="text-base">
                  Analisis cuantitativo con simulaciones Monte Carlo y Business Impact Analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                  <FileCheck className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Cumplimiento ISO 27001</CardTitle>
                <CardDescription className="text-base">
                  Controles y checklist completo para certificacion internacional
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Analisis de Vulnerabilidades</CardTitle>
                <CardDescription className="text-base">
                  Escaneo profundo de SSL, headers, puertos y configuraciones de seguridad
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Reportes Ejecutivos</CardTitle>
                <CardDescription className="text-base">
                  Genera informes PDF profesionales para directivos y auditorias
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Comite de Seguridad</CardTitle>
                <CardDescription className="text-base">
                  Gestion de reuniones, actas y seguimiento de acciones del comite
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              <Play className="h-4 w-4" />
              Demo Interactiva
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Explora el Dashboard
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Vista previa de las principales funcionalidades con datos de ejemplo
            </p>
          </div>

          {/* Demo Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "scans", label: "Escaneos", icon: Shield },
              { id: "siem", label: "SIEM", icon: Eye },
              { id: "incidents", label: "Incidentes", icon: AlertTriangle },
              { id: "compliance", label: "Compliance", icon: FileCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDemo(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeDemo === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Demo Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Browser Chrome */}
            <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Lock className="h-3 w-3 text-green-500" />
                  app.guardyscan.com/dashboard
                </div>
              </div>
            </div>

            {/* Demo Dashboard Content */}
            <div className="p-6 min-h-[500px]">
              {activeDemo === "dashboard" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Escaneos Totales</div>
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">1,247</div>
                      <div className="text-xs text-green-600 mt-1">↑ 12% vs mes anterior</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-600 dark:text-red-400 mb-1">Vulnerabilidades</div>
                      <div className="text-3xl font-bold text-red-700 dark:text-red-300">23</div>
                      <div className="text-xs text-green-600 mt-1">↓ 8 resueltas esta semana</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-600 dark:text-green-400 mb-1">Score Seguridad</div>
                      <div className="text-3xl font-bold text-green-700 dark:text-green-300">87%</div>
                      <div className="text-xs text-green-600 mt-1">↑ 5 puntos</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Activos Monitoreados</div>
                      <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">156</div>
                      <div className="text-xs text-gray-500 mt-1">12 servidores, 144 endpoints</div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-4">Actividad de Escaneos (7 días)</h4>
                      <div className="flex items-end gap-2 h-32">
                        {[65, 45, 78, 52, 90, 67, 85].map((height, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-4">Vulnerabilidades por Severidad</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-20">Crítica</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-red-500 h-3 rounded-full" style={{ width: "15%" }} />
                          </div>
                          <span className="text-sm font-medium w-8">3</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-20">Alta</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-orange-500 h-3 rounded-full" style={{ width: "35%" }} />
                          </div>
                          <span className="text-sm font-medium w-8">8</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-20">Media</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: "45%" }} />
                          </div>
                          <span className="text-sm font-medium w-8">10</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-20">Baja</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-blue-500 h-3 rounded-full" style={{ width: "10%" }} />
                          </div>
                          <span className="text-sm font-medium w-8">2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === "scans" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Escaneos Recientes</h3>
                    <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm">+ Nuevo Escaneo</div>
                  </div>
                  {[
                    { domain: "empresa.com", status: "Completado", score: 92, vulns: 2, date: "Hace 2 horas" },
                    { domain: "api.empresa.com", status: "Completado", score: 78, vulns: 5, date: "Hace 5 horas" },
                    { domain: "staging.empresa.com", status: "En progreso", score: null, vulns: null, date: "Ahora" },
                    { domain: "mail.empresa.com", status: "Completado", score: 95, vulns: 1, date: "Ayer" },
                    { domain: "cdn.empresa.com", status: "Completado", score: 88, vulns: 3, date: "Hace 2 días" },
                  ].map((scan, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          scan.status === "En progreso" ? "bg-yellow-100 dark:bg-yellow-900/50" : "bg-green-100 dark:bg-green-900/50"
                        }`}>
                          {scan.status === "En progreso" ? (
                            <Activity className="h-5 w-5 text-yellow-600 animate-pulse" />
                          ) : (
                            <Globe className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{scan.domain}</div>
                          <div className="text-sm text-gray-500">{scan.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {scan.score !== null && (
                          <div className={`text-lg font-bold ${
                            scan.score >= 90 ? "text-green-600" : scan.score >= 70 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {scan.score}%
                          </div>
                        )}
                        {scan.vulns !== null && (
                          <div className="text-sm text-gray-500">
                            {scan.vulns} vulnerabilidades
                          </div>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          scan.status === "Completado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {scan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeDemo === "siem" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 border border-red-200 dark:border-red-800 text-center">
                      <div className="text-3xl font-bold text-red-600">12</div>
                      <div className="text-sm text-red-600">Alertas Críticas</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 text-center">
                      <div className="text-3xl font-bold text-yellow-600">47</div>
                      <div className="text-sm text-yellow-600">Eventos Sospechosos</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800 text-center">
                      <div className="text-3xl font-bold text-green-600">1.2M</div>
                      <div className="text-sm text-green-600">Eventos Procesados</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">Eventos en Tiempo Real</h3>
                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 h-64 overflow-hidden">
                    <div className="space-y-1">
                      <div><span className="text-gray-500">[14:32:15]</span> <span className="text-yellow-400">WARN</span> Múltiples intentos de login fallidos desde 192.168.1.45</div>
                      <div><span className="text-gray-500">[14:32:12]</span> <span className="text-green-400">INFO</span> Escaneo de puertos completado en servidor web-prod-01</div>
                      <div><span className="text-gray-500">[14:32:08]</span> <span className="text-red-400">ALERT</span> Posible SQL Injection detectado en /api/users</div>
                      <div><span className="text-gray-500">[14:32:05]</span> <span className="text-green-400">INFO</span> Conexión SSL/TLS establecida correctamente</div>
                      <div><span className="text-gray-500">[14:32:01]</span> <span className="text-yellow-400">WARN</span> Certificado expira en 15 días (cdn.empresa.com)</div>
                      <div><span className="text-gray-500">[14:31:58]</span> <span className="text-green-400">INFO</span> Backup de configuración completado</div>
                      <div><span className="text-gray-500">[14:31:55]</span> <span className="text-red-400">ALERT</span> Tráfico anómalo detectado en puerto 8080</div>
                      <div><span className="text-gray-500">[14:31:52]</span> <span className="text-green-400">INFO</span> Regla de firewall actualizada correctamente</div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === "incidents" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Gestión de Incidentes</h3>
                    <div className="flex gap-2">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">3 Abiertos</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">5 En progreso</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">28 Resueltos</span>
                    </div>
                  </div>
                  {[
                    { id: "INC-2024-089", title: "Intento de acceso no autorizado a base de datos", severity: "Crítico", status: "Abierto", assignee: "Carlos M.", time: "Hace 1 hora" },
                    { id: "INC-2024-088", title: "Certificado SSL próximo a expirar", severity: "Medio", status: "En progreso", assignee: "Ana L.", time: "Hace 3 horas" },
                    { id: "INC-2024-087", title: "Vulnerabilidad XSS en formulario de contacto", severity: "Alto", status: "En progreso", assignee: "Pedro R.", time: "Hace 5 horas" },
                    { id: "INC-2024-086", title: "Actualización de parches pendiente en servidor", severity: "Medio", status: "Abierto", assignee: "Sin asignar", time: "Ayer" },
                  ].map((incident, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-500">{incident.id}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              incident.severity === "Crítico" ? "bg-red-100 text-red-700" :
                              incident.severity === "Alto" ? "bg-orange-100 text-orange-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {incident.severity}
                            </span>
                          </div>
                          <div className="font-medium mb-2">{incident.title}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Asignado: {incident.assignee}</span>
                            <span>{incident.time}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          incident.status === "Abierto" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeDemo === "compliance" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">ISO 27001</h4>
                        <span className="text-2xl font-bold text-green-600">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "78%" }} />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>A.5 Políticas de seguridad</span><span className="text-green-600">✓</span></div>
                        <div className="flex justify-between"><span>A.6 Organización</span><span className="text-green-600">✓</span></div>
                        <div className="flex justify-between"><span>A.7 Recursos humanos</span><span className="text-yellow-600">En progreso</span></div>
                        <div className="flex justify-between"><span>A.8 Gestión de activos</span><span className="text-green-600">✓</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Ley 21.663</h4>
                        <span className="text-2xl font-bold text-blue-600">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                        <div className="bg-blue-500 h-3 rounded-full" style={{ width: "92%" }} />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Gobernanza de ciberseguridad</span><span className="text-green-600">✓</span></div>
                        <div className="flex justify-between"><span>Gestión de incidentes</span><span className="text-green-600">✓</span></div>
                        <div className="flex justify-between"><span>Continuidad operacional</span><span className="text-green-600">✓</span></div>
                        <div className="flex justify-between"><span>Notificación CSIRT</span><span className="text-yellow-600">Pendiente</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-2">Próximas Auditorías</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-500">ISO 27001</div>
                        <div className="font-semibold">15 Feb 2026</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-500">Ley 21.663</div>
                        <div className="font-semibold">28 Mar 2026</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-500">PCI DSS</div>
                        <div className="font-semibold">10 Abr 2026</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA under demo */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">¿Te gustaría ver el dashboard completo?</p>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25">
                Contratar Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/50 px-4 py-2 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              Precios
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Planes para cada necesidad
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl">Basico</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">$100</span>
                  <span className="text-gray-600 dark:text-gray-400">/mes</span>
                </div>
                <CardDescription className="mt-2">
                  Para pequeñas empresas y startups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>50 escaneos/mes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>1 empresa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Análisis de vulnerabilidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Gestión de incidentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Dashboard básico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Soporte por email</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full mt-6" variant="outline">Contratar Plan</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-500 shadow-xl shadow-blue-500/10 scale-105">
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                  Más popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Profesional</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">$300</span>
                  <span className="text-gray-600 dark:text-gray-400">/mes</span>
                </div>
                <CardDescription className="mt-2">
                  Para empresas en crecimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>200 escaneos/mes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>1 empresa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>SIEM + Gestión de Riesgos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>ISO 27001 + Ley 21.663</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>BCP / DRP completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Soporte prioritario</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg">
                    Contratar Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">$900</span>
                  <span className="text-gray-600 dark:text-gray-400">/mes</span>
                </div>
                <CardDescription className="mt-2">
                  Para grandes organizaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Escaneos ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="font-semibold text-blue-600">Hasta 30 empresas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Todas las funcionalidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Multi-usuario por empresa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Consultoría incluida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Soporte 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>SLA garantizado</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full mt-6" variant="outline">Contactar Ventas</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Listo para proteger tu empresa?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
            Unete a mas de 150 empresas que confian en GuardyScan para su ciberseguridad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                Contratar Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent text-white border-2 border-white hover:bg-white/10">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <Mail className="h-4 w-4" />
              Contacto
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              ¿Tienes preguntas?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Nuestro equipo está listo para ayudarte a proteger tu empresa
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">contacto@guardyscan.com</p>
                  <p className="text-gray-600 dark:text-gray-400">soporte@guardyscan.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Teléfono</h3>
                  <p className="text-gray-600 dark:text-gray-400">+56 9 9337 2630</p>
                  <p className="text-gray-600 dark:text-gray-400">Lunes a Viernes, 9:00 - 18:00</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Oficinas</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Chile</p>
                  <p className="text-gray-600 dark:text-gray-400">San Sebastián 2750, Oficina 902</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">Las Condes, Región Metropolitana</p>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">México</p>
                  <p className="text-gray-600 dark:text-gray-400">Av. Solidaridad 1024 Oficina H3</p>
                  <p className="text-gray-600 dark:text-gray-400">Playa del Carmen</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl text-white">
                <h3 className="font-semibold text-lg mb-2">¿Necesitas ayuda urgente?</h3>
                <p className="text-white/90 text-sm mb-4">
                  Nuestro equipo de respuesta a incidentes está disponible 24/7 para clientes Enterprise.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4" />
                  +56 9 8765 4321 (Emergencias)
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y te responderemos en menos de 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mensaje
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-6"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="GuardyScan"
                  width={180}
                  height={45}
                  className="h-11 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm mb-4 max-w-xs">
                Plataforma lider en ciberseguridad empresarial. Protege tu organizacion con tecnologia de punta.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => smoothScrollTo('features')} className="hover:text-white transition-colors">Funcionalidades</button></li>
                <li><button onClick={() => smoothScrollTo('pricing')} className="hover:text-white transition-colors">Precios</button></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentacion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">Sobre nosotros</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terminos</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Seguridad</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">2026 GuardyScan. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Todos los sistemas operativos
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
