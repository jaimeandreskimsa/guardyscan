"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Lock, FileCheck, TrendingUp, Users, Zap, ArrowRight, Globe, BarChart3, Eye, Mail, Phone, MapPin, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function HomePage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    interest: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

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
    setContactForm({ name: "", email: "", company: "", phone: "", interest: "", message: "" });
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
                Características
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
                  Iniciar Sesión
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
      <section className="relative overflow-hidden pt-28 pb-24 px-4">
        {/* Soft lavender-blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-100/80 dark:from-gray-900 dark:via-blue-950/40 dark:to-indigo-950/60" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-200/30 to-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-200/20 to-blue-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium mb-8 shadow-sm">
              Sistema operativo de ciberseguridad
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.05] mb-6">
              Tu empresa segura,<br />sin complejidad
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Guardy centraliza vulnerabilidades, riesgos, cumplimiento, continuidad operativa y proveedores en un solo sistema inteligente.
            </p>

            {/* Checkmarks 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-xl">
              {[
                "Detecta riesgos automáticamente",
                "Prioriza lo crítico",
                "Cumple con ISO 27001 y Ley 21.663",
                "Todo conectado en un solo panel",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <Link href="/auth/register">
                <Button size="lg" className="text-base px-7 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 rounded-xl">
                  Evaluar mi empresa
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 py-6 border-2 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl"
                onClick={() => smoothScrollTo('demo')}
              >
                Ver demo
              </Button>
            </div>

            {/* Secondary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 items-start mt-4">
              <Link href="/auth/register">
                <Button size="lg" className="text-base px-7 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 rounded-xl flex items-center gap-2">
                  🚀 Probar gratis
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 py-6 border-2 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl"
                onClick={() => smoothScrollTo('demo')}
              >
                Ver demo
              </Button>
            </div>
            <p className="mt-3 text-sm text-gray-400">No necesitas tarjeta · Configuración en minutos</p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      {/* SECTION 2 — FEATURES GRID (12 modules) */}
      {/* ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-7xl">
          {/* Badge + Heading */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-5">
              Todo en un solo lugar
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Una plataforma completa para gestionar<br className="hidden md:block" /> la seguridad de tu empresa
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Guardy no es solo un scanner. Es un sistema integral que conecta todos los vectores de riesgo en una vista operativa clara.
            </p>
          </div>

          {/* 12-module grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[
              { emoji: "🌐", title: "Evaluación Web", desc: "Analiza certificados, DNS, cabeceras, tecnologías, cookies y WAF para detectar exposición." },
              { emoji: "📊", title: "Monitoreo", desc: "Consolida score, severidad, tendencias y hallazgos en un panel simple y ejecutivo." },
              { emoji: "⚠️", title: "Vulnerabilidades", desc: "Prioriza remediación por criticidad, estado y exposición con trazabilidad completa." },
              { emoji: "🚨", title: "Incidentes", desc: "Registra eventos, seguimiento, SLA y resolución con visibilidad clara para el equipo." },
              { emoji: "📉", title: "Riesgos", desc: "Evalúa impacto, probabilidad y tendencia con una visión cuantitativa del negocio." },
              { emoji: "🖥️", title: "Activos", desc: "Mantén inventario tecnológico, criticidad, responsables, parches y contexto operativo." },
              { emoji: "👥", title: "Trabajadores", desc: "Gestiona accesos críticos, roles, validaciones, capacitación y trazabilidad de personas." },
              { emoji: "🤝", title: "Terceros", desc: "Evalúa proveedores, exposición, cumplimiento, contratos y nivel de riesgo de la cadena." },
              { emoji: "✅", title: "Cumplimiento", desc: "Mapea controles, progreso y evidencias para ISO 27001:2022 y Ley 21.663 de Chile." },
              { emoji: "📋", title: "BCP / DRP", desc: "Crea planes de continuidad y recuperación con métricas operativas como RTO y RPO." },
              { emoji: "👔", title: "Comité", desc: "Formaliza miembros, decisiones y gobernanza del comité de ciberseguridad." },
              { emoji: "📁", title: "Documentos", desc: "Centraliza políticas, contratos, certificaciones y documentación crítica de la empresa." },
            ].map((m) => (
              <div key={m.title} className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-3">{m.emoji}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{m.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── */}
      {/* SECTION 3 — DASHBOARD PREVIEW   */}
      {/* ──────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-5">
              Visibilidad real
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Datos claros para actuar,<br className="hidden md:block" /> no solo para mirar
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              La propuesta de Guardy es simple: traducir complejidad técnica en una vista ejecutiva que cualquier líder de empresa pueda entender.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left column — 3 metric cards */}
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Score de seguridad consolidado</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">32</span>
                  <span className="text-xl text-gray-400 mb-1">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: "32%" }} />
                </div>
                <p className="text-sm text-gray-500">Riesgo moderado basado en 24 escaneos</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Hallazgos por prioridad</div>
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">87</div>
                <div className="flex gap-3 text-sm">
                  <span className="text-red-500 font-semibold">15 altos</span>
                  <span className="text-yellow-500 font-semibold">68 medios</span>
                  <span className="text-green-500 font-semibold">4 bajos</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Estado de cumplimiento</div>
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">0%</div>
                <p className="text-sm text-gray-500">74 controles pendientes de implementar</p>
              </div>
            </div>

            {/* Right column — mock chart card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="font-semibold text-gray-900 dark:text-white mb-4">Monitoreo consolidado</div>
              {/* Donut mock */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="32 68" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">68</span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>Críticos <strong>0</strong></span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" /><span>Altos <strong>15</strong></span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span>Medios <strong>68</strong></span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span>Bajos <strong>4</strong></span></div>
                </div>
              </div>
              {/* Trend chart mock */}
              <div className="text-xs text-gray-400 mb-2">Tendencia últimos 7 días</div>
              <div className="flex items-end gap-1 h-16">
                {[40, 55, 35, 60, 45, 70, 50].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-blue-200 dark:bg-blue-800" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Escaneos completados", value: "24" },
              { label: "Proveedores monitoreados", value: "6" },
              { label: "Activos críticos", value: "18" },
              { label: "Documentos centralizados", value: "6" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-center">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── */}
      {/* SECTION 4 — GUARDY AI    */}
      {/* ───────────────────────── */}
      <section className="py-24 px-4 bg-[#0f1729]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 text-sm font-medium mb-5">
              Guardy AI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Tu analista de ciberseguridad con IA
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Guardy AI te explica lo importante con lenguaje claro, conecta módulos y convierte señales dispersas en decisiones concretas para el negocio.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Menos ruido técnico.<br />Más acción.</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Convierte alertas y hallazgos en recomendaciones concretas. Guardy AI contextualiza cada señal con el estado real de tu empresa y te dice exactamente qué hacer primero.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-900/60 border border-blue-700 rounded-full text-blue-300 text-sm font-medium">Recomendaciones Priorizadas</span>
                <span className="px-4 py-2 bg-indigo-900/60 border border-indigo-700 rounded-full text-indigo-300 text-sm font-medium">Explicación En simple</span>
              </div>
            </div>

            {/* Right — Chat mockup */}
            <div className="bg-[#151f38] rounded-2xl border border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">Guardy AI</span>
              </div>
              {[
                { q: "¿Cuál es mi mayor riesgo hoy?", a: "Tu mayor riesgo es la falta de cifrado en 3 endpoints expuestos a internet. Te recomiendo priorizar el módulo de vulnerabilidades y cerrar esos hallazgos esta semana." },
                { q: "¿Cumplo con la Ley 21.663?", a: "Tienes 74 controles pendientes. Los más críticos son los de gestión de incidentes y notificación al CSIRT. Puedo mostrarte el plan de acción paso a paso." },
                { q: "¿Qué debo hacer primero?", a: "Activa el monitoreo continuo para los 6 proveedores críticos. Eso te cubre el 40% del riesgo de terceros con un solo clic." },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">{item.q}</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-200 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-sm">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── */}
      {/* SECTION 5 — USE CASES  */}
      {/* ─────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium mb-5">
              Casos de uso
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Diseñado para empresas que necesitan<br className="hidden md:block" /> orden, trazabilidad y control
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { emoji: "🔍", title: "No tienes equipo experto", desc: "Guardy actúa como tu departamento de ciberseguridad: detecta, prioriza y te guía sin necesitar un CISO interno." },
              { emoji: "📜", title: "Necesitas cumplir normativas", desc: "Mapea controles para ISO 27001 y Ley 21.663 con evidencias, avance y alertas para tus próximas auditorías." },
              { emoji: "🤝", title: "Trabajas con terceros críticos", desc: "Evalúa la exposición de tus proveedores, gestiona contratos y monitorea su cumplimiento en tiempo real." },
              { emoji: "🔐", title: "Manejas datos sensibles", desc: "Protege activos críticos con inventario, clasificación, control de acceso y trazabilidad completa de cambios." },
            ].map((uc) => (
              <div key={uc.title} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{uc.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{uc.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── */}
      {/* SECTION 6 — COMPLIANCE      */}
      {/* ──────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-medium mb-5">
              Cumplimiento
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Cumple con lo que te exige la ley,<br className="hidden md:block" /> sin perderte en la complejidad
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "🏅", title: "ISO 27001:2022", desc: "Mapa completo de controles, evidencias y avance hacia la certificación internacional." },
              { icon: "⚖️", title: "Ley 21.663 (Chile)", desc: "Seguimiento de obligaciones del marco de ciberseguridad nacional con alertas automáticas." },
              { icon: "🔄", title: "BCP / DRP", desc: "Planes de continuidad y recuperación con métricas RTO/RPO operativas y actualizadas." },
              { icon: "📂", title: "Repositorio central", desc: "Políticas, certificaciones y evidencias en un solo lugar, disponibles para auditorías." },
            ].map((c) => (
              <div key={c.title} className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── */}
      {/* SECTION 7 — WHY GUARDY  */}
      {/* ──────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/40 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm font-medium mb-5">
              Diferenciación
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              ¿Por qué Guardy?
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Porque una empresa real no necesita diez plataformas distintas. Necesita una sola vista que conecte todo y te diga qué hacer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              { emoji: "🔗", title: "Todo conectado", desc: "Vulnerabilidades, riesgos, incidentes, cumplimiento y continuidad en un solo sistema." },
              { emoji: "🤖", title: "IA útil", desc: "No solo detecta, también explica y recomienda en lenguaje de negocio." },
              { emoji: "⚙️", title: "Hecho para operar", desc: "Flujos de trabajo reales: SLA, asignaciones, evidencias, auditorías y reportes." },
              { emoji: "🇨🇱", title: "Contexto local", desc: "Diseñado para las realidades regulatorias de Chile y Latinoamérica." },
            ].map((d) => (
              <div key={d.title} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-3xl mb-3">{d.emoji}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center max-w-3xl mx-auto">
            <p className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
              &ldquo;Guardy transforma la ciberseguridad en algo entendible para la empresa: qué tengo, qué me falta, dónde está el riesgo y qué hago ahora.&rdquo;
            </p>
            <p className="text-sm text-gray-400">— Plataforma de gestión integral de ciberseguridad para empresas</p>
          </div>
        </div>
      </section>

      {/* ─────────────────────── */}
      {/* SECTION 8 — PRICING     */}
      {/* ─────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-5">
              Planes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Elige el nivel de control que necesitas
            </h2>
            {/* Toggle */}
            <div className="inline-flex items-center gap-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 mt-4">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingPeriod === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >Mensual</button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingPeriod === 'annual' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >Anual <span className="text-green-500 font-bold ml-1">-15%</span></button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                badge: "Entrada", name: "Free", monthly: 0, annual: 0,
                desc: "Descubre tu exposición",
                features: ["Análisis puntual de una web", "SSL / DNS / Headers", "Vista general de hallazgos", "Alertas limitadas"],
                cta: "Comenzar gratis", ctaVariant: "outline" as const, highlight: false,
              },
              {
                badge: "Crecimiento", name: "Básico", monthly: 79, annual: 67,
                desc: "Monitoreo continuo",
                features: ["Monitoreo semanal", "Alertas automáticas", "Detección temprana", "Historial reciente"],
                cta: "Elegir Básico", ctaVariant: "outline" as const, highlight: false,
              },
              {
                badge: "Más popular", name: "Profesional", monthly: 299, annual: 254,
                desc: "Control de riesgos",
                features: ["Monitoreo avanzado", "Riesgos y vulnerabilidades", "Eventos e incidentes", "Cumplimiento base", "Integraciones"],
                cta: "Elegir Profesional", ctaVariant: "default" as const, highlight: true,
              },
              {
                badge: "Escala", name: "Enterprise", monthly: 899, annual: 764,
                desc: "Gobierno y continuidad",
                features: ["Seguridad a escala", "BCP / DRP completo", "Gestión de terceros", "Soporte dedicado", "SLA e integraciones custom"],
                cta: "Hablar con ventas", ctaVariant: "outline" as const, highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border flex flex-col ${
                  plan.highlight
                    ? 'bg-white dark:bg-gray-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">Más popular</span>
                  </div>
                )}
                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{!plan.highlight ? plan.badge : ""}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{plan.name}</h3>
                  <div className="flex items-end gap-1 mt-3">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      ${billingPeriod === 'monthly' ? plan.monthly : plan.annual}
                    </span>
                    <span className="text-gray-400 text-sm mb-1">/mes</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Enterprise" ? "#contact" : "/auth/register"}>
                  <Button
                    variant={plan.ctaVariant}
                    className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── */}
      {/* SECTION 9 — CONTACT     */}
      {/* ─────────────────────── */}
      <section id="contact" className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-5">
              💬 Contacto
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              ¿Tienes preguntas?
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Nuestro equipo está listo para ayudarte. Cuéntanos en qué etapa estás y coordinemos la mejor forma de avanzar.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left — contact info cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">Email</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">contacto@guardyscan.com</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">soporte@guardyscan.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">Teléfono</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">+56 9 9337 2630</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Lunes a Viernes, 9:00 – 18:00</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">Oficinas</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">🇨🇱 Chile</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">San Sebastián 2750, Oficina 902 · Las Condes</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">🇲🇽 México</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Av. Solidaridad 1024 Oficina H3 · Playa del Carmen</p>
                </div>
              </div>
              <div className="p-5 bg-blue-600 rounded-2xl text-white">
                <div className="font-semibold mb-1">¿Necesitas ayuda urgente?</div>
                <p className="text-sm text-blue-100 mb-3">Respuesta en menos de 24 horas hábiles para todos los planes.</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4" />
                  +56 9 8765 4321
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Agendemos una reunión</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input
                      type="text" required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email" required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Tu empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="+56 9 ..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">¿Qué te interesa?</label>
                  <select
                    value={contactForm.interest}
                    onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    <option>Quiero probar el plan Free</option>
                    <option>Necesito el plan Básico</option>
                    <option>Me interesa el plan Profesional</option>
                    <option>Necesito Enterprise / personalizado</option>
                    <option>Tengo dudas generales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                  <textarea
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    placeholder="Cuéntanos en qué etapa está tu empresa..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl"
                  disabled={sending}
                >
                  {sending ? (
                    <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Enviando...</>
                  ) : "Agendemos una reunión"}
                </Button>
                <div className="text-center space-y-1">
                  <button type="button" onClick={() => smoothScrollTo('demo')} className="text-sm text-blue-600 hover:underline">O ver una demo primero</button>
                  <p className="text-xs text-gray-400">Respondemos en menos de 24 horas hábiles.</p>
                </div>
              </form>
            </div>
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
                Plataforma líder en ciberseguridad empresarial. Protege tu organización con tecnología de punta.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => smoothScrollTo('features')} className="hover:text-white transition-colors">Funcionalidades</button></li>
                <li><button onClick={() => smoothScrollTo('pricing')} className="hover:text-white transition-colors">Precios</button></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentación</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://wa.me/56934401855" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 GuardyScan. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Todos los sistemas operativos
              </span>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}
