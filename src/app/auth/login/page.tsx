"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevenir múltiples submits
    if (loading) return;
    
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas");
        setLoading(false);
      } else {
        // Redirect directo sin refresh
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link href="/" className="mb-12">
            <Image
              src="/logo.png"
              alt="GuardyScan"
              width={200}
              height={50}
              className="h-14 w-auto brightness-0 invert"
              priority
            />
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">
            Bienvenido de nuevo
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-md">
            Accede a tu plataforma de ciberseguridad y protege tu organización con inteligencia.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">Monitoreo 24/7</div>
                <div className="text-sm text-gray-400">Protección continua de activos</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">ISO 27001 & Ley 21.663</div>
                <div className="text-sm text-gray-400">Cumplimiento normativo garantizado</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">IA & Machine Learning</div>
                <div className="text-sm text-gray-400">Detección inteligente de amenazas</div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold text-cyan-400">500+</div>
                <div className="text-sm text-gray-400">Empresas protegidas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime garantizado</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">2M+</div>
                <div className="text-sm text-gray-400">Amenazas detectadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="GuardyScan"
                width={180}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Accede a tu panel de ciberseguridad
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder="tu@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-base bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all rounded-xl" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500">
                  ¿Nuevo en GuardyScan?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/auth/register">
                <Button variant="outline" className="w-full py-6 text-base rounded-xl border-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            Al iniciar sesión, aceptas nuestros{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">Términos de Servicio</Link>
            {" "}y{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">Política de Privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
