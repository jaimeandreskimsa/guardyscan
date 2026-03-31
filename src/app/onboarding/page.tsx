"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Shield, Building2, Globe, Users, ArrowRight, ArrowLeft,
  Check, Zap, Target, FileCheck, Lock, Sparkles, Loader2,
  ChevronDown,
} from "lucide-react";

const INDUSTRIES = [
  "Tecnología / Software",
  "Finanzas / Banca",
  "Salud / Clínicas",
  "Retail / Comercio",
  "Educación",
  "Gobierno / Sector Público",
  "Manufactura / Industrial",
  "Servicios / Consultoría",
  "Telecomunicaciones",
  "Inmobiliaria",
  "Medios / Entretenimiento",
  "Otro",
];

const COMPANY_SIZES = [
  { label: "1–10", value: "1-10" },
  { label: "11–50", value: "11-50" },
  { label: "51–200", value: "51-200" },
  { label: "201–500", value: "201-500" },
  { label: "500+", value: "500+" },
];

const GOALS = [
  {
    id: "web",
    icon: Globe,
    label: "Proteger mi sitio web",
    desc: "Análisis de vulnerabilidades y configuración segura",
  },
  {
    id: "data",
    icon: Lock,
    label: "Proteger datos de clientes",
    desc: "Privacidad y cifrado de información sensible",
  },
  {
    id: "compliance",
    icon: FileCheck,
    label: "Cumplimiento normativo",
    desc: "ISO 27001, GDPR, NIS2, SOC 2, ENS",
  },
  {
    id: "infra",
    icon: Target,
    label: "Seguridad de infraestructura",
    desc: "Servidores, cloud y redes internas",
  },
];

const STEPS = [
  { label: "Tu empresa", num: 1 },
  { label: "Objetivos", num: 2 },
  { label: "Primer escaneo", num: 3 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  // Pre-fill company from session
  useEffect(() => {
    if (session?.user?.name) {
      // Don't pre-fill name as company — let the user type it
    }
  }, [session]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const toggleGoal = (id: string) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async (startScan = false) => {
    setLoading(true);
    try {
      // 1. Save onboarding data + create organization
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, website, industry, companySize }),
      });

      if (startScan && website) {
        // 2. Normalize URL
        let url = website.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }

        // 3. Launch the scan directly
        const scanRes = await fetch("/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUrl: url, scanType: "FULL" }),
        });

        // 4. Redirect to scanner history tab so user sees it processing
        router.push("/dashboard/scanner?tab=history");
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[400px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 relative overflow-hidden p-10 text-white">
        {/* Orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="GuardyScan"
            width={160}
            height={44}
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        {/* Mid content */}
        <div className="flex-1 flex flex-col justify-center relative z-10 mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-5 w-fit">
            <Sparkles className="h-3 w-3" />
            Configuración inicial
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3">
            Personaliza tu<br />
            <span className="text-blue-300">experiencia</span> de seguridad
          </h2>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Solo toma 2 minutos. Tus datos nos ayudan a adaptar el análisis a las necesidades reales de tu organización.
          </p>

          <div className="space-y-3">
            {[
              "Análisis personalizado para tu industria",
              "Informes ejecutivos adaptados a tu empresa",
              "Recomendaciones basadas en tu tamaño",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/25 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                  <Check className="h-2.5 w-2.5 text-blue-300" />
                </div>
                <span className="text-sm text-white/65">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step progress */}
        <div className="relative z-10 space-y-2.5">
          {STEPS.map(({ label, num }) => {
            const done = step > num;
            const active = step === num;
            return (
              <div
                key={num}
                className={`flex items-center gap-3 transition-all duration-300 ${active ? "opacity-100" : done ? "opacity-75" : "opacity-30"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${done ? "bg-emerald-400 text-emerald-900" : active ? "bg-blue-400 text-blue-900" : "bg-white/10 text-white/40"}`}
                >
                  {done ? <Check className="h-3 w-3" /> : num}
                </div>
                <span className={`text-sm font-medium ${active ? "text-white" : "text-white/50"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-100/80">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900 text-sm">GuardyScan</span>
          </div>
          {/* Mobile step dots */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {STEPS.map(({ num }) => (
              <div
                key={num}
                className={`rounded-full transition-all duration-300 ${num === step ? "w-5 h-2 bg-blue-500" : num < step ? "w-2 h-2 bg-emerald-400" : "w-2 h-2 bg-gray-200"}`}
              />
            ))}
          </div>
          <div className="hidden lg:block" />
          <button
            onClick={() => handleComplete(false)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Saltar por ahora →
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
          <div className="w-full max-w-[480px]">

            {/* ── STEP 1: Company info ── */}
            {step === 1 && (
              <div className="onboarding-step space-y-6">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Paso 1 de 3</p>
                  <h1 className="text-2xl font-black text-gray-900">Cuéntanos sobre tu empresa</h1>
                  <p className="text-gray-400 mt-1 text-sm">Esta información personaliza toda tu experiencia en GuardyScan</p>
                </div>

                <div className="space-y-4">
                  {/* Company name */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Nombre de la empresa
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Ej: Acme Corporation"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-gray-50/50 placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Sitio web principal
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://www.tuempresa.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-gray-50/50 placeholder:text-gray-300"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Esta URL será el objetivo de tu primer escaneo de seguridad</p>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Industria</label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-gray-50/50 appearance-none text-gray-700 pr-10"
                      >
                        <option value="">Selecciona tu industria...</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Company size */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      <Users className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                      Tamaño de la empresa
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {COMPANY_SIZES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setCompanySize(s.value)}
                          className={`py-2.5 px-1 rounded-xl border text-xs font-bold text-center transition-all duration-150 ${companySize === s.value ? "bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-200/70 shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300 bg-gray-50/50"}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">Número de empleados</p>
                  </div>
                </div>

                <button
                  onClick={goNext}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Goals ── */}
            {step === 2 && (
              <div className="onboarding-step space-y-6">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Paso 2 de 3</p>
                  <h1 className="text-2xl font-black text-gray-900">¿Qué deseas proteger?</h1>
                  <p className="text-gray-400 mt-1 text-sm">Selecciona todos los que apliquen a tu organización</p>
                </div>

                <div className="space-y-2.5">
                  {GOALS.map((g) => {
                    const Icon = g.icon;
                    const selected = goals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${selected ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/50"}`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Icon className={`h-5 w-5 ${selected ? "text-blue-600" : "text-gray-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${selected ? "text-blue-800" : "text-gray-800"}`}>{g.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "bg-blue-500 border-blue-500 scale-110" : "border-gray-300"}`}>
                          {selected && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </button>
                  <button
                    onClick={goNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: First scan ── */}
            {step === 3 && (
              <div className="onboarding-step space-y-6">
                <div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Paso 3 de 3</p>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                    <Zap className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900">¡Todo listo!</h1>
                  <p className="text-gray-400 mt-1 text-sm">
                    Tu cuenta está configurada. ¿Quieres iniciar tu primer análisis de seguridad ahora?
                  </p>
                </div>

                {website ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-3.5 w-3.5 text-blue-500" />
                      <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">URL a analizar</p>
                    </div>
                    <p className="text-sm font-bold text-blue-800 truncate">{website}</p>
                    <p className="text-xs text-blue-400 mt-0.5">Escanearemos este sitio inmediatamente</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      URL a escanear
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://www.tuempresa.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all bg-gray-50/50 placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                )}

                {/* Summary chips */}
                <div className="flex flex-wrap gap-2">
                  {company && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      <Building2 className="h-3 w-3" /> {company}
                    </span>
                  )}
                  {industry && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      {industry}
                    </span>
                  )}
                  {companySize && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      <Users className="h-3 w-3" /> {companySize} empleados
                    </span>
                  )}
                  {goals.map((g) => {
                    const found = GOALS.find((x) => x.id === g);
                    return found ? (
                      <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                        <Check className="h-3 w-3" /> {found.label}
                      </span>
                    ) : null;
                  })}
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleComplete(true)}
                    disabled={loading || !website}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4" /> Iniciar primer escaneo
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleComplete(false)}
                    disabled={loading}
                    className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Ir al Dashboard →
                  </button>
                </div>

                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Atrás
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
