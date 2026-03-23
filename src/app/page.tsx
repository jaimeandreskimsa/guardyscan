"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Globe, BarChart3, Mail, Phone, MapPin, ShieldAlert, Bell, TrendingDown, Monitor, Users, Building2, BadgeCheck, RefreshCw, Crown, FolderOpen, Search, Network, KeyRound, Award, Scale, Archive, Workflow, Bot, Settings2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

// ── Pricing by currency ─────────────────────────────────────────
const PLAN_PRICES: Record<string, Record<'CLP' | 'MXN', { monthly: number; annual: number }>> = {
  'Básico':      { CLP: { monthly: 75000,  annual: 64000  }, MXN: { monthly: 1490,  annual: 1270  } },
  'Profesional': { CLP: { monthly: 284000, annual: 241000 }, MXN: { monthly: 5490,  annual: 4790  } },
  'Enterprise':  { CLP: { monthly: 854000, annual: 726000 }, MXN: { monthly: 16490, annual: 13990 } },
};

/** Format price with thousands separator per locale */
const fmtPrice = (name: string, period: 'monthly' | 'annual', curr: 'CLP' | 'MXN'): string => {
  if (name === 'Free') return '0';
  const val = PLAN_PRICES[name][curr][period];
  const sep = curr === 'CLP' ? '.' : ',';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
};

// ── Chat simulation script ────────────────────────────────────
const CHAT_SCRIPT = [
  { q: "¿Cuál es mi mayor riesgo hoy?",
    a: "Tu mayor riesgo es la falta de cifrado en 3 endpoints expuestos a internet. Te recomiendo priorizar el módulo de vulnerabilidades y cerrar esos hallazgos esta semana." },
  { q: "¿Cumplo con la Ley 21.663?",
    a: "Tienes 74 controles pendientes. Los más críticos son los de gestión de incidentes y notificación al CSIRT. Puedo mostrarte el plan de acción paso a paso." },
  { q: "¿Qué debo hacer primero?",
    a: "Activa el monitoreo continuo para los 6 proveedores críticos. Eso te cubre el 40% del riesgo de terceros con un solo clic." },
];

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
  const [currency, setCurrency] = useState<'CLP' | 'MXN'>('CLP');
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [chatTyping, setChatTyping] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [dashVisible, setDashVisible] = useState(false);
  const dashRef = useRef<HTMLDivElement>(null);
  const dashNums = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')),
      { threshold: 0.10 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Chat simulation loop
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const s = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.push(t); };
    const run = () => {
      setChatMessages([]);
      setChatTyping(false);
      let t = 600;
      CHAT_SCRIPT.forEach((item, i) => {
        s(() => setChatMessages(p => [...p, { type: 'user', text: item.q }]), t); t += 900;
        s(() => setChatTyping(true), t); t += 1500;
        s(() => { setChatTyping(false); setChatMessages(p => [...p, { type: 'ai', text: item.a }]); }, t);
        t += i < CHAT_SCRIPT.length - 1 ? 1100 : 3200;
      });
      s(run, t);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-scroll chat to bottom (only inside the container, never the page)
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, chatTyping]);

  // Dashboard visibility observer + auto-repeat every 5 s
  useEffect(() => {
    if (!dashRef.current) return;
    let loop: ReturnType<typeof setInterval>;
    const replay = () => {
      setDashVisible(false);
      setTimeout(() => setDashVisible(true), 80);
    };
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDashVisible(true);
          loop = setInterval(replay, 5000);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(dashRef.current);
    return () => { obs.disconnect(); clearInterval(loop); };
  }, []);

  // Count-up numbers when dashboard becomes visible
  useEffect(() => {
    // Reset numbers to 0 on hide
    if (!dashVisible) {
      dashNums.current.forEach(el => { if (el) el.textContent = '0'; });
      return;
    }
    // [score, hallazgos, donutCenter, stat1, stat2, stat3, stat4]
    const targets = [32, 87, 68, 24, 6, 18, 6];
    dashNums.current.forEach((el, i) => {
      if (!el) return;
      const target = targets[i] ?? 0;
      if (!target) return;
      const duration = 1100 + i * 90;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - p) ** 3;
        el.textContent = Math.round(eased * target).toString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, [dashVisible]);

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
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="container mx-auto max-w-7xl px-5">
          <div className="flex items-center justify-between h-[62px]">
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
            <nav className="hidden md:flex items-center gap-7">
              {[
                { label: 'Características', id: 'features' },
                { label: 'Demo',            id: 'demo' },
                { label: 'Precios',         id: 'pricing' },
                { label: 'Contacto',        id: 'contact' },
              ].map(n => (
                <button key={n.id} onClick={() => smoothScrollTo(n.id)}
                  className="text-[13.5px] font-medium text-gray-500 hover:text-gray-900 transition-colors tracking-[-0.01em]">
                  {n.label}
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2.5">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 h-9 px-4 rounded-xl">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="text-[13.5px] font-semibold h-9 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_2px_12px_rgba(79,70,229,0.35)] border-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(79,70,229,0.45)]">
                  Crear Cuenta
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden flex items-center min-h-[92vh] pt-20 pb-16 px-4"
        style={{ background: 'linear-gradient(160deg,#060c18 0%,#080f20 55%,#06101f 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.10) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Glow orb — blue, follows mouse */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 720, height: 720,
            background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)',
            top: '10%', left: '28%',
            transform: 'translate(-50%,-50%)',
            filter: 'blur(55px)',
          }}
        />
        {/* Glow orb — purple, counter-follows */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 480, height: 480,
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(236,72,153,0.08) 50%, transparent 70%)',
            bottom: '5%', right: '8%',
            filter: 'blur(65px)',
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #060c18)' }} />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── LEFT ── */}
            <div>
              {/* Badge */}
              <div className="hero-el hero-el-d1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-sm font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                Sistema operativo de ciberseguridad
              </div>

              {/* Title */}
              <h1 className="hero-el hero-el-d2 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
                Tu empresa segura,<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  sin complejidad
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-el hero-el-d3 text-lg md:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
                Guardy centraliza vulnerabilidades, riesgos, cumplimiento, continuidad operativa y proveedores en un solo sistema inteligente.
              </p>

              {/* Checkmarks */}
              <div className="hero-el hero-el-d4 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-lg">
                {[
                  "Detecta riesgos automáticamente",
                  "Prioriza lo crítico",
                  "Cumple con ISO 27001 y Ley 21.663",
                  "Todo conectado en un solo panel",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-400 stroke-[3]" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="hero-el hero-el-d5 flex flex-col sm:flex-row gap-3 items-start">
                <Link href="/auth/register">
                  <Button size="lg" className="text-base px-7 py-6 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-700/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-600/50 rounded-xl border border-blue-500/40">
                    Evaluar mi empresa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-7 py-6 border border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-sm transition-all duration-200"
                  onClick={() => smoothScrollTo('contact')}
                >
                  Ver demo
                </Button>
              </div>

              {/* Trust row */}
              <div className="hero-el hero-el-d6 flex items-center gap-8 mt-10 pt-8 border-t border-white/[0.08]">
                {[
                  { value: "150+",       label: "Empresas" },
                  { value: "ISO 27001",  label: "Compatible" },
                  { value: "Ley 21.663", label: "Chile & LATAM" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-white font-bold text-base">{s.value}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Floating dashboard cards ── */}
            <div className="relative hidden lg:block h-[540px]">

              {/* Card 1 – Security Score */}
              <div className="absolute top-0 left-4 w-64 hero-el hero-el-d2">
                <div style={{ animation: 'floatA 6s ease-in-out infinite' }}
                  className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.09] rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Score de Seguridad</span>
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-extrabold text-white">68</span>
                    <span className="text-gray-500 text-sm mb-1">/ 100</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-1.5 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-orange-400">
                    <TrendingDown className="h-3 w-3" />
                    Riesgo moderado · 24 escaneos
                  </div>
                </div>
              </div>

              {/* Card 2 – Hallazgos */}
              <div className="absolute top-24 right-0 w-52 hero-el hero-el-d3">
                <div style={{ animation: 'floatB 8s ease-in-out infinite 1s' }}
                  className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.09] rounded-2xl p-5 shadow-2xl">
                  <div className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-4">Hallazgos activos</div>
                  <div className="space-y-2.5">
                    {[
                      { dot: 'bg-red-500',   label: 'Altos',  count: 15 },
                      { dot: 'bg-amber-400', label: 'Medios', count: 68 },
                      { dot: 'bg-green-400', label: 'Bajos',  count: 4  },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                          <span className="text-gray-300 text-sm">{row.label}</span>
                        </div>
                        <span className="text-white font-bold text-sm">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3 – ISO compliance donut */}
              <div className="absolute bottom-8 left-8 w-60 hero-el hero-el-d4">
                <div style={{ animation: 'floatC 7s ease-in-out infinite 0.5s' }}
                  className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.09] rounded-2xl p-5 shadow-2xl">
                  <div className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-4">ISO 27001 Compliance</div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#818cf8" strokeWidth="3.5"
                          strokeDasharray="78 22" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-white">78%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-white">78%</div>
                      <div className="text-xs text-gray-500">en progreso</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    32 controles completados
                  </div>
                </div>
              </div>

              {/* Card 4 – Guardy AI notification */}
              <div className="absolute top-[50%] right-6 w-52 hero-el hero-el-d5">
                <div style={{ animation: 'floatA 9s ease-in-out infinite 2s' }}
                  className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.09] rounded-xl p-4 shadow-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-white">Guardy AI</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      </div>
                      <div className="text-[11px] text-gray-400 leading-tight">Hallazgo crítico detectado en dominio principal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 hero-el hero-el-d6">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-600">Scroll</span>
            <div className="w-px h-7 bg-gradient-to-b from-gray-600 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      {/* SECTION 2 — FEATURES GRID (12 modules) */}
      {/* ──────────────────────────────────────── */}
      <section id="features" className="relative py-28 px-4 overflow-hidden section-white">
        {/* Parallax orb */}
        <div className="parallax-orb w-[600px] h-[600px] top-[-100px] right-[-80px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Badge + Heading */}
          <div className="text-center mb-16 reveal">
            <div className="badge-prem mb-5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />Todo en un solo lugar</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-[-0.03em] leading-[1.08]">
              Una plataforma <span className="gradient-word">completa</span> para gestionar<br className="hidden md:block" /> la seguridad de tu empresa
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Guardy no es solo un scanner. Es un sistema integral que conecta todos los vectores de riesgo en una vista operativa clara.
            </p>
          </div>

          {/* 12-module grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {([
              { Icon: Globe,        grad: "from-blue-400/55 via-blue-300/20 to-indigo-500/35",    ic: "text-blue-600",    bg: "bg-gradient-to-br from-blue-100 to-blue-50",    title: "Evaluación Web",  desc: "Analiza certificados, DNS, cabeceras, tecnologías, cookies y WAF para detectar exposición.", delay: "reveal-d1" },
              { Icon: BarChart3,    grad: "from-indigo-400/55 via-indigo-300/20 to-purple-500/35",  ic: "text-indigo-600",  bg: "bg-gradient-to-br from-indigo-100 to-indigo-50",  title: "Monitoreo",        desc: "Consolida score, severidad, tendencias y hallazgos en un panel simple y ejecutivo.", delay: "reveal-d2" },
              { Icon: ShieldAlert,  grad: "from-orange-400/55 via-orange-300/20 to-amber-500/35",   ic: "text-orange-600",  bg: "bg-gradient-to-br from-orange-100 to-amber-50",  title: "Vulnerabilidades",  desc: "Prioriza remediación por criticidad, estado y exposición con trazabilidad completa.", delay: "reveal-d3" },
              { Icon: Bell,         grad: "from-red-400/55 via-red-300/20 to-rose-500/35",       ic: "text-red-600",     bg: "bg-gradient-to-br from-red-100 to-rose-50",     title: "Incidentes",      desc: "Registra eventos, seguimiento, SLA y resolución con visibilidad clara para el equipo.", delay: "reveal-d4" },
              { Icon: TrendingDown, grad: "from-amber-400/55 via-amber-300/20 to-yellow-500/35",   ic: "text-amber-600",   bg: "bg-gradient-to-br from-amber-100 to-yellow-50",   title: "Riesgos",          desc: "Evalúa impacto, probabilidad y tendencia con una visión cuantitativa del negocio.", delay: "reveal-d5" },
              { Icon: Monitor,      grad: "from-slate-400/55 via-slate-300/20 to-gray-500/35",     ic: "text-slate-600",   bg: "bg-gradient-to-br from-slate-100 to-gray-50",  title: "Activos",          desc: "Mantén inventario tecnológico, criticidad, responsables, parches y contexto operativo.", delay: "reveal-d6" },
              { Icon: Users,        grad: "from-violet-400/55 via-violet-300/20 to-purple-500/35",  ic: "text-violet-600",  bg: "bg-gradient-to-br from-violet-100 to-purple-50",  title: "Trabajadores",    desc: "Gestiona accesos críticos, roles, validaciones, capacitación y trazabilidad de personas.", delay: "reveal-d7" },
              { Icon: Building2,    grad: "from-sky-400/55 via-sky-300/20 to-cyan-500/35",       ic: "text-sky-600",     bg: "bg-gradient-to-br from-sky-100 to-cyan-50",     title: "Terceros",        desc: "Evalúa proveedores, exposición, cumplimiento, contratos y nivel de riesgo de la cadena.", delay: "reveal-d8" },
              { Icon: BadgeCheck,   grad: "from-green-400/55 via-green-300/20 to-emerald-500/35",  ic: "text-green-600",   bg: "bg-gradient-to-br from-green-100 to-emerald-50",   title: "Cumplimiento",    desc: "Mapea controles, progreso y evidencias para ISO 27001:2022 y Ley 21.663 de Chile.", delay: "reveal-d9" },
              { Icon: RefreshCw,    grad: "from-teal-400/55 via-teal-300/20 to-cyan-500/35",      ic: "text-teal-600",    bg: "bg-gradient-to-br from-teal-100 to-cyan-50",    title: "BCP / DRP",       desc: "Crea planes de continuidad y recuperación con métricas operativas como RTO y RPO.", delay: "reveal-d10" },
              { Icon: Crown,        grad: "from-yellow-400/55 via-yellow-300/20 to-amber-500/35",   ic: "text-yellow-600",  bg: "bg-gradient-to-br from-yellow-100 to-amber-50",  title: "Comité",          desc: "Formaliza miembros, decisiones y gobernanza del comité de ciberseguridad.", delay: "reveal-d11" },
              { Icon: FolderOpen,   grad: "from-rose-400/55 via-rose-300/20 to-pink-500/35",      ic: "text-rose-600",    bg: "bg-gradient-to-br from-rose-100 to-pink-50",    title: "Documentos",      desc: "Centraliza políticas, contratos, certificaciones y documentación crítica de la empresa.", delay: "reveal-d12" },
            ] as { Icon: React.ElementType; grad: string; ic: string; bg: string; title: string; desc: string; delay: string }[]).map((m) => (
              <div key={m.title} className={`reveal ${m.delay} p-[1.5px] rounded-[22px] bg-gradient-to-br ${m.grad} card-glow-light group`}>
                <div className="bg-white p-6 rounded-[20px] h-full">
                  <div className={`icon-box-prem ${m.bg} mb-4`}>
                    <m.Icon className={`h-5 w-5 ${m.ic}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 tracking-[-0.02em] text-[15px]">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── */}
      {/* SECTION 3 — DASHBOARD PREVIEW   */}
      {/* ──────────────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden section-slate">
        {/* Mesh orb */}
        <div className="parallax-orb w-[500px] h-[500px] bottom-[-60px] left-[-60px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div ref={dashRef} className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="badge-prem-purple mb-5"><span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />Visibilidad real</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-[-0.03em] leading-[1.08]">
              Datos <span className="gradient-word">claros</span> para actuar,<br className="hidden md:block" /> no solo para mirar
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              La propuesta de Guardy es simple: traducir complejidad técnica en una vista ejecutiva que cualquier líder de empresa pueda entender.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left column — 3 metric cards */}
            <div className="flex flex-col gap-4">
              <div className="reveal reveal-d1 p-[1.5px] rounded-[22px] bg-gradient-to-br from-orange-400/55 via-orange-300/20 to-indigo-400/35 card-glow-light">
                <div className="bg-white p-6 rounded-[20px]">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Score de seguridad consolidado</div>
                  <div className="flex items-end gap-2 mb-1">
                    <span ref={el => { dashNums.current[0] = el; }} className="text-5xl font-extrabold text-gray-900">0</span>
                    <span className="text-xl text-gray-400 mb-1">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-orange-400 to-amber-400 h-2 rounded-full" style={{ width: dashVisible ? '32%' : '0%', transition: 'width 1.3s ease 0.4s' }} />
                  </div>
                  <p className="text-sm text-gray-500">Riesgo moderado basado en 24 escaneos</p>
                </div>
              </div>
              <div className="reveal reveal-d2 p-[1.5px] rounded-[22px] bg-gradient-to-br from-red-400/55 via-red-300/20 to-purple-400/35 card-glow-light">
                <div className="bg-white p-6 rounded-[20px]">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Hallazgos por prioridad</div>
                  <div className="text-5xl font-extrabold text-gray-900 mb-2">
                    <span ref={el => { dashNums.current[1] = el; }}>0</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-red-500 font-semibold">15 altos</span>
                    <span className="text-amber-500 font-semibold">68 medios</span>
                    <span className="text-green-500 font-semibold">4 bajos</span>
                  </div>
                </div>
              </div>
              <div className="reveal reveal-d3 p-[1.5px] rounded-[22px] bg-gradient-to-br from-green-400/55 via-green-300/20 to-teal-400/35 card-glow-light">
                <div className="bg-white p-6 rounded-[20px]">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Estado de cumplimiento</div>
                  <div className="text-5xl font-extrabold text-gray-900 mb-2">0%</div>
                  <p className="text-sm text-gray-500">74 controles pendientes de implementar</p>
                </div>
              </div>
            </div>

            {/* Right column — mock chart card */}
            <div className="reveal reveal-d2 p-[1.5px] rounded-[22px] bg-gradient-to-br from-blue-400/55 via-indigo-300/25 to-purple-400/35 card-glow-light">
              <div className="bg-white p-6 rounded-[20px] h-full">
                <div className="font-semibold text-gray-900 mb-4">Monitoreo consolidado</div>
                {/* Donut mock */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#donutGrad)" strokeWidth="3"
                        strokeDasharray={dashVisible ? '32 68' : '0 100'} strokeLinecap="round"
                        className={dashVisible ? 'donut-draw' : ''} />
                      <defs>
                        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span ref={el => { dashNums.current[2] = el; }} className="text-2xl font-extrabold text-gray-900">0</span>
                      <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-gray-600">Críticos <strong>0</strong></span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" /><span className="text-gray-600">Altos <strong>15</strong></span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="text-gray-600">Medios <strong>68</strong></span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-gray-600">Bajos <strong>4</strong></span></div>
                  </div>
                </div>
                {/* Trend chart mock */}
                <div className="text-xs text-gray-400 mb-2">Tendencia últimos 7 días</div>
                <div className="flex items-end gap-1 h-16">
                  {[40, 55, 35, 60, 45, 70, 50].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, #3b82f6, #6366f1)`,
                        opacity: 0.7 + i * 0.04,
                        transform: dashVisible ? 'scaleY(1)' : 'scaleY(0)',
                        transformOrigin: 'bottom',
                        transition: `transform 0.55s ease ${0.3 + i * 0.07}s`,
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Escaneos completados",     value: "24", grad: "from-blue-400/55 via-blue-300/20 to-indigo-400/35",  delay: "reveal-d1" },
              { label: "Proveedores monitoreados", value: "6",  grad: "from-purple-400/55 via-purple-300/20 to-violet-400/35", delay: "reveal-d2" },
              { label: "Activos críticos",         value: "18", grad: "from-orange-400/55 via-orange-300/20 to-amber-400/35",  delay: "reveal-d3" },
              { label: "Documentos centralizados", value: "6",  grad: "from-teal-400/55 via-teal-300/20 to-green-400/35",    delay: "reveal-d4" },
            ].map((s, si) => (
              <div key={s.label} className={`reveal ${s.delay} p-[1.5px] rounded-[22px] bg-gradient-to-br ${s.grad} card-glow-light`}>
                <div className="bg-white p-5 rounded-[20px] text-center">
                  <div className="text-3xl font-extrabold text-gray-900">
                    <span ref={el => { dashNums.current[3 + si] = el; }}>0</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── */}
      {/* SECTION 4 — GUARDY AI    */}
      {/* ───────────────────────── */}
      <section id="demo" className="relative py-28 px-4 overflow-hidden section-white">
        {/* Parallax orbs */}
        <div className="parallax-orb w-[700px] h-[700px] top-[-200px] left-[-150px] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
        <div className="parallax-orb w-[400px] h-[400px] bottom-[-100px] right-[10%] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="badge-prem mb-5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1" />✦ Guardy AI</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-[-0.03em] leading-[1.08]">
              Tu analista de ciberseguridad <span className="gradient-word">con IA</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Guardy AI te explica lo importante con lenguaje claro, conecta módulos y convierte señales dispersas en decisiones concretas para el negocio.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div className="reveal reveal-d1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Menos ruido técnico.<br />Más acción.</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Convierte alertas y hallazgos en recomendaciones concretas. Guardy AI contextualiza cada señal con el estado real de tu empresa y te dice exactamente qué hacer primero.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-medium">Recomendaciones Priorizadas</span>
                <span className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-sm font-medium">Explicación En simple</span>
              </div>
            </div>

            {/* Right — Animated Chat */}
            <div className="reveal reveal-d2 p-[1.5px] rounded-[22px] bg-gradient-to-br from-blue-400/55 via-indigo-300/25 to-purple-400/35 card-glow-light">
              <div className="bg-white p-6 rounded-[20px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-500 font-medium">Guardy AI — activo</span>
                  <span className="ml-auto text-[10px] text-gray-300 font-mono">encrypted · guardy.ai</span>
                </div>
                {/* Messages */}
                <div ref={chatScrollRef} className="space-y-3 h-72 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex chat-bubble ${ msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`text-sm rounded-2xl px-4 py-2.5 max-w-[82%] leading-relaxed ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 border border-gray-200 text-gray-700 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatTyping && (
                    <div className="flex justify-start chat-bubble">
                      <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:160ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:320ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                {/* Input bar (decorative) */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-300 select-none">
                    Escribe una pregunta...
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── */}
      {/* SECTION 5 — USE CASES  */}
      {/* ─────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden section-slate">
        <div className="parallax-orb w-[500px] h-[500px] top-[10%] right-[-80px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="badge-prem-gray mb-5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />Casos de uso</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-[-0.03em] leading-[1.08]">
              Diseñado para empresas que necesitan<br className="hidden md:block" /> <span className="gradient-word">orden, trazabilidad y control</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {([
              { Icon: Search,     grad: "from-blue-400/55 via-blue-300/20 to-cyan-500/35",    ic: "text-blue-600",   bg: "bg-gradient-to-br from-blue-100 to-blue-50",   title: "No tienes equipo experto",      desc: "Guardy actúa como tu departamento de ciberseguridad: detecta, prioriza y te guía sin necesitar un CISO interno.", delay: "reveal-d1" },
              { Icon: BadgeCheck, grad: "from-green-400/55 via-green-300/20 to-teal-500/35",  ic: "text-green-600",  bg: "bg-gradient-to-br from-green-100 to-green-50",  title: "Necesitas cumplir normativas",   desc: "Mapea controles para ISO 27001 y Ley 21.663 con evidencias, avance y alertas para tus próximas auditorías.", delay: "reveal-d2" },
              { Icon: Network,    grad: "from-violet-400/55 via-violet-300/20 to-indigo-500/35", ic: "text-violet-600", bg: "bg-gradient-to-br from-violet-100 to-violet-50", title: "Trabajas con terceros críticos", desc: "Evalúa la exposición de tus proveedores, gestiona contratos y monitorea su cumplimiento en tiempo real.", delay: "reveal-d3" },
              { Icon: KeyRound,   grad: "from-orange-400/55 via-orange-300/20 to-amber-500/35",  ic: "text-orange-600", bg: "bg-gradient-to-br from-orange-100 to-amber-50", title: "Manejas datos sensibles",        desc: "Protege activos críticos con inventario, clasificación, control de acceso y trazabilidad completa de cambios.", delay: "reveal-d4" },
            ] as { Icon: React.ElementType; grad: string; ic: string; bg: string; title: string; desc: string; delay: string }[]).map((uc) => (
              <div key={uc.title} className={`reveal ${uc.delay} p-[1.5px] rounded-[22px] bg-gradient-to-br ${uc.grad} card-glow-light group`}>
                <div className="bg-white p-7 rounded-[20px] h-full">
                  <div className={`icon-box-prem ${uc.bg} mb-5`}>
                    <uc.Icon className={`h-5 w-5 ${uc.ic}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2.5 tracking-[-0.02em]">{uc.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── */}
      {/* SECTION 6 — COMPLIANCE      */}
      {/* ──────────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden section-white">
        <div className="parallax-orb w-[600px] h-[600px] bottom-[-150px] left-[5%] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="badge-prem-green mb-5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Cumplimiento</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-[-0.03em] leading-[1.08]">
              Cumple con lo que te exige <span className="gradient-word">la ley</span>,<br className="hidden md:block" /> sin perderte en la complejidad
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {([
              { Icon: Award,     grad: "from-amber-400/55 via-amber-300/20 to-yellow-500/35",  ic: "text-amber-600",  bg: "bg-gradient-to-br from-amber-100 to-yellow-50",  title: "ISO 27001:2022",      desc: "Mapa completo de controles, evidencias y avance hacia la certificación internacional.", delay: "reveal-d1" },
              { Icon: Scale,     grad: "from-blue-400/55 via-blue-300/20 to-indigo-500/35",   ic: "text-blue-600",   bg: "bg-gradient-to-br from-blue-100 to-blue-50",   title: "Ley 21.663 (Chile)",  desc: "Seguimiento de obligaciones del marco de ciberseguridad nacional con alertas automáticas.", delay: "reveal-d2" },
              { Icon: RefreshCw, grad: "from-teal-400/55 via-teal-300/20 to-cyan-500/35",     ic: "text-teal-600",   bg: "bg-gradient-to-br from-teal-100 to-cyan-50",   title: "BCP / DRP",           desc: "Planes de continuidad y recuperación con métricas RTO/RPO operativas y actualizadas.", delay: "reveal-d3" },
              { Icon: Archive,   grad: "from-rose-400/55 via-rose-300/20 to-pink-500/35",     ic: "text-rose-600",   bg: "bg-gradient-to-br from-rose-100 to-pink-50",   title: "Repositorio central", desc: "Políticas, certificaciones y evidencias en un solo lugar, disponibles para auditorías.", delay: "reveal-d4" },
            ] as { Icon: React.ElementType; grad: string; ic: string; bg: string; title: string; desc: string; delay: string }[]).map((c) => (
              <div key={c.title} className={`reveal ${c.delay} p-[1.5px] rounded-[22px] bg-gradient-to-br ${c.grad} card-glow-light group`}>
                <div className="bg-white p-6 rounded-[20px] h-full">
                  <div className={`icon-box-prem ${c.bg} mb-4`}>
                    <c.Icon className={`h-5 w-5 ${c.ic}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 tracking-[-0.02em]">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── */}
      {/* SECTION 7 — WHY GUARDY  */}
      {/* ──────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden section-slate">
        <div className="parallax-orb w-[700px] h-[700px] top-[-100px] right-[-100px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="badge-prem-purple mb-5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />Diferenciación</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-[-0.03em] leading-[1.08]">
              ¿Por qué <span className="gradient-word">Guardy</span>?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Porque una empresa real no necesita diez plataformas distintas. Necesita una sola vista que conecte todo y te diga qué hacer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {([
              { Icon: Workflow,  grad: "from-blue-400/55 via-blue-300/20 to-indigo-500/35",    ic: "text-blue-600",    bg: "bg-gradient-to-br from-blue-100 to-blue-50",   title: "Todo conectado",   desc: "Vulnerabilidades, riesgos, incidentes, cumplimiento y continuidad en un solo sistema.", delay: "reveal-d1" },
              { Icon: Bot,       grad: "from-violet-400/55 via-violet-300/20 to-purple-500/35",   ic: "text-violet-600",  bg: "bg-gradient-to-br from-violet-100 to-purple-50", title: "IA útil",           desc: "No solo detecta, también explica y recomienda en lenguaje de negocio.", delay: "reveal-d2" },
              { Icon: Settings2, grad: "from-orange-400/55 via-orange-300/20 to-amber-500/35",    ic: "text-orange-600",  bg: "bg-gradient-to-br from-orange-100 to-amber-50", title: "Hecho para operar", desc: "Flujos de trabajo reales: SLA, asignaciones, evidencias, auditorías y reportes.", delay: "reveal-d3" },
              { Icon: MapPin,    grad: "from-green-400/55 via-green-300/20 to-emerald-500/35",   ic: "text-green-600",   bg: "bg-gradient-to-br from-green-100 to-emerald-50",  title: "Contexto local",   desc: "Diseñado para las realidades regulatorias de Chile y Latinoamérica.", delay: "reveal-d4" },
            ] as { Icon: React.ElementType; grad: string; ic: string; bg: string; title: string; desc: string; delay: string }[]).map((d) => (
              <div key={d.title} className={`reveal ${d.delay} p-[1.5px] rounded-[22px] bg-gradient-to-br ${d.grad} card-glow-light group`}>
                <div className="bg-white p-6 rounded-[20px] h-full">
                  <div className={`icon-box-prem ${d.bg} mb-4`}>
                    <d.Icon className={`h-5 w-5 ${d.ic}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 tracking-[-0.02em]">{d.title}</h3>
                  <p className="text-sm text-gray-500">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="reveal p-[1.5px] rounded-[22px] bg-gradient-to-br from-indigo-400/55 via-purple-300/25 to-blue-400/35 max-w-3xl mx-auto">
            <div className="bg-white p-10 rounded-[20px] text-center">
              <div className="text-5xl gradient-word font-serif mb-4 leading-none">&ldquo;</div>
              <p className="text-xl font-medium text-gray-800 leading-relaxed mb-5 tracking-[-0.01em]">
                Guardy transforma la ciberseguridad en algo entendible para la empresa: qué tengo, qué me falta, dónde está el riesgo y qué hago ahora.
              </p>
              <p className="text-sm text-gray-400 tracking-wide">— Plataforma de gestión integral de ciberseguridad para empresas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── */}
      {/* SECTION 8 — PRICING     */}
      {/* ─────────────────────── */}
      <section id="pricing" className="relative py-28 px-4 overflow-hidden section-white">
        <div className="parallax-orb w-[700px] h-[700px] top-[-100px] left-[20%] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12 reveal">
            <div className="badge-prem mb-5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1" />Planes</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-[-0.03em] leading-[1.08]">
              Elige el <span className="gradient-word">nivel de control</span> que necesitas
            </h2>
            {/* Toggles row */}
            <div className="flex flex-col items-center gap-3 mt-4">
              {/* Billing period */}
              <div className="inline-flex items-center gap-0 bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingPeriod === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                >Mensual</button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingPeriod === 'annual' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                >Anual <span className="text-green-500 font-bold ml-1">-15%</span></button>
              </div>
              {/* Currency / country */}
              <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setCurrency('CLP')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    currency === 'CLP' ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>🇨🇱</span> Chile · CLP
                </button>
                <button
                  onClick={() => setCurrency('MXN')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    currency === 'MXN' ? 'bg-green-700 text-white shadow' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>🇲🇽</span> México · MXN
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                badge: "Entrada", name: "Free", monthly: 0, annual: 0,
                desc: "Descubre tu exposición",
                features: ["Análisis puntual de una web", "SSL / DNS / Headers", "Vista general de hallazgos", "Alertas limitadas"],
                cta: "Comenzar gratis", highlight: false,
                grad: "from-slate-400/55 via-slate-300/20 to-gray-500/35",
              },
              {
                badge: "Crecimiento", name: "Básico", monthly: 79, annual: 67,
                desc: "Monitoreo continuo",
                features: ["Monitoreo semanal", "Alertas automáticas", "Detección temprana", "Historial reciente"],
                cta: "Elegir Básico", highlight: false,
                grad: "from-blue-400/55 via-blue-300/20 to-indigo-500/35",
              },
              {
                badge: "Más popular", name: "Profesional", monthly: 299, annual: 254,
                desc: "Control de riesgos",
                features: ["Monitoreo avanzado", "Riesgos y vulnerabilidades", "Eventos e incidentes", "Cumplimiento base", "Integraciones"],
                cta: "Elegir Profesional", highlight: true,
                grad: "from-indigo-500/80 via-blue-500/60 to-violet-500/70",
              },
              {
                badge: "Escala", name: "Enterprise", monthly: 899, annual: 764,
                desc: "Gobierno y continuidad",
                features: ["Seguridad a escala", "BCP / DRP completo", "Gestión de terceros", "Soporte dedicado", "SLA e integraciones custom"],
                cta: "Hablar con ventas", highlight: false,
                grad: "from-violet-400/55 via-violet-300/20 to-purple-500/35",
              },
            ].map((plan, pi) => (
              <div
                key={plan.name}
                className={`reveal reveal-d${pi + 1} relative p-[1.5px] rounded-[22px] bg-gradient-to-br ${plan.grad} ${plan.highlight ? 'card-glow-light scale-[1.03]' : 'card-glow-light'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/40">✦ Más popular</span>
                  </div>
                )}
                <div className={`${plan.highlight ? 'pricing-popular' : 'bg-white'} p-6 rounded-[20px] flex flex-col h-full`}>
                  <div className="mb-4">
                    <span className={`text-xs font-semibold uppercase tracking-widest ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{!plan.highlight ? plan.badge : ""}</span>
                    <h3 className={`text-xl font-bold mt-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <div className="flex items-end gap-1 mt-3">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                        ${fmtPrice(plan.name, billingPeriod, currency)}
                      </span>
                      <span className={`text-sm mb-1 leading-none pb-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{currency}/mes</span>
                    </div>
                    <p className={`text-sm mt-1 ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{plan.desc}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.name === "Enterprise" ? "#contact" : "/auth/register"}>
                    <Button
                      className={`w-full transition-all ${plan.highlight
                        ? 'bg-white hover:bg-blue-50 text-blue-700 font-bold shadow-none border-0'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── */}
      {/* SECTION 9 — CONTACT     */}
      {/* ─────────────────────── */}
      <section id="contact" className="relative py-28 px-4 overflow-hidden section-slate">
        <div className="parallax-orb w-[500px] h-[500px] bottom-[-80px] right-[-80px] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="badge-prem mb-5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1" />💬 Contacto</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-[-0.03em] leading-[1.08]">
              ¿Tienes <span className="gradient-word">preguntas</span>?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Nuestro equipo está listo para ayudarte. Cuéntanos en qué etapa estás y coordinemos la mejor forma de avanzar.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left — contact info cards */}
            <div className="space-y-4">
              {[
                { Icon: Mail,  grad: "from-blue-400/55 via-blue-300/20 to-indigo-500/35",      ic: "text-blue-600",    bg: "bg-gradient-to-br from-blue-100 to-blue-50",     title: "Email",    lines: ["contacto@guardyscan.com", "soporte@guardyscan.com"], delay: "reveal-d1" },
                { Icon: Phone, grad: "from-green-400/55 via-green-300/20 to-teal-500/35",    ic: "text-green-600",   bg: "bg-gradient-to-br from-green-100 to-emerald-50",  title: "Teléfono", lines: ["+56 9 9337 2630", "Lunes a Viernes, 9:00 – 18:00"], delay: "reveal-d2" },
                { Icon: MapPin,grad: "from-purple-400/55 via-purple-300/20 to-violet-500/35", ic: "text-purple-600", bg: "bg-gradient-to-br from-purple-100 to-violet-50",  title: "Oficinas", lines: ["🇨🇱 San Sebastián 2750, Of. 902 · Las Condes", "🇲🇽 Av. Solidaridad 1024 Of. H3 · Playa del Carmen"], delay: "reveal-d3" },
              ].map((c) => (
                <div key={c.title} className={`reveal ${c.delay} p-[1.5px] rounded-[22px] bg-gradient-to-br ${c.grad} card-glow-light`}>
                  <div className="bg-white p-5 rounded-[20px] flex items-start gap-4">
                    <div className={`icon-box-prem ${c.bg} flex-shrink-0`}>
                      <c.Icon className={`h-5 w-5 ${c.ic}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{c.title}</div>
                      {c.lines.map((l, i) => <p key={i} className="text-gray-500 text-sm">{l}</p>)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="reveal reveal-d4 p-[1.5px] rounded-[22px] bg-gradient-to-br from-blue-500/70 to-indigo-600/60">
                <div className="rounded-[20px] p-5 bg-gradient-to-br from-blue-600 to-indigo-700">
                  <div className="font-semibold text-white mb-1">¿Necesitas ayuda urgente?</div>
                  <p className="text-sm text-blue-100 mb-3">Respuesta en menos de 24 horas hábiles para todos los planes.</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Phone className="h-4 w-4" />
                    +56 9 9337 2630
                  </div>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="reveal reveal-d2 p-[1.5px] rounded-[22px] bg-gradient-to-br from-indigo-400/55 via-blue-300/25 to-purple-400/35 card-glow-light">
              <div className="bg-white p-8 rounded-[20px]">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Agendemos una reunión</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text" required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email" required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                      <input
                        type="text"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all"
                        placeholder="Tu empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all"
                        placeholder="+56 9 ..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué te interesa?</label>
                    <select
                      value={contactForm.interest}
                      onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all resize-none"
                      placeholder="Cuéntanos en qué etapa está tu empresa..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl shadow-lg shadow-blue-500/25 border-0 transition-all"
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
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 overflow-hidden bg-gray-950">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
        <div className="container mx-auto max-w-7xl relative z-10">
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
              <p className="text-sm mb-4 max-w-xs text-gray-400">
                Plataforma líder en ciberseguridad empresarial. Protege tu organización con tecnología de punta.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => smoothScrollTo('features')} className="hover:text-white transition-colors">Funcionalidades</button></li>
                <li><button onClick={() => smoothScrollTo('pricing')} className="hover:text-white transition-colors">Precios</button></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentación</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="https://wa.me/56934401855" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2026 GuardyScan. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-400">
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
