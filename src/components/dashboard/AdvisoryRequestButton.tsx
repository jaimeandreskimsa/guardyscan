"use client";

import { useState } from "react";
import { Headphones, Loader2, CheckCircle, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdvisoryRequestButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar solicitud");
      }

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setMessage("");
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CTA Button */}
      <button
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-500 hover:scale-[1.02]"
      >
        <div className="relative rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Headphones className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-lg font-bold text-white">
                Solicitar Asesoría Profesional
              </h4>
              <p className="text-sm text-white/80 mt-0.5">
                Nuestro equipo de expertos en ciberseguridad le contactará
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-white/80 group-hover:text-white transition-colors">
              <span className="text-sm font-medium">Solicitar</span>
              <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            {sent ? (
              <div className="p-10 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Solicitud Enviada!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Nuestro equipo de ciberseguridad se pondrá en contacto con usted a la brevedad.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur">
                      <Headphones className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Solicitar Asesoría Profesional
                      </h3>
                      <p className="text-sm text-white/80 mt-0.5">
                        Cuéntenos qué necesita y le asesoraremos
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="h-4 w-4 inline mr-1.5" />
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describa brevemente en qué podemos ayudarle: auditorías, implementación ISO 27001, respuesta a incidentes, pentest..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <strong>¿Qué incluye?</strong> Un especialista certificado analizará su caso y le contactará para ofrecerle una solución personalizada.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setOpen(false); setMessage(""); }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" /> Enviar Solicitud</>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
