"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Error al enviar el correo de recuperación");
      }
    } catch (err) {
      setError("Error al procesar la solicitud");
    } finally {
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
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Link href="/" className="flex items-center space-x-3 mb-12">
            <Shield className="h-10 w-10 text-blue-400" />
            <span className="text-2xl font-bold">GuardyScan</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Recupera tu Cuenta
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Te enviaremos instrucciones para restablecer tu contraseña de forma segura.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Enlace Seguro</h3>
                <p className="text-gray-400 text-sm">
                  Recibirás un enlace temporal de un solo uso
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Válido por 1 Hora</h3>
                <p className="text-gray-400 text-sm">
                  El enlace expirará por seguridad
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Sin Compromiso</h3>
                <p className="text-gray-400 text-sm">
                  Tu cuenta permanece segura mientras tanto
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center space-x-3">
              <Shield className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">GuardyScan</span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tu correo electrónico y te enviaremos instrucciones para recuperarla.
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex">
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-green-900 font-semibold mb-2">
                    ¡Correo Enviado!
                  </h3>
                  <p className="text-green-700 text-sm mb-4">
                    Si existe una cuenta con <strong>{email}</strong>, recibirás instrucciones de recuperación.
                  </p>
                  <p className="text-green-600 text-sm mb-4">
                    Revisa tu bandeja de entrada (y spam). El enlace será válido por 1 hora.
                  </p>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver al Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Enviando..." : "Enviar Instrucciones"}
              </Button>

              <div className="flex items-center justify-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Link>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Regístrate gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
