"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Headphones, Loader2, CheckCircle, MessageSquare, Send, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOTIVOS = [
  { value: "",                    label: "Selecciona un motivo..." },
  { value: "Contacto general",    label: "💬 Contacto general" },
  { value: "Solicitar servicios", label: "🛡️ Solicitar servicios" },
  { value: "Ley marco",           label: "⚖️ Ley marco" },
  { value: "Reportar bug",        label: "🐛 Reportar bug del sistema" },
];

export function ContactExpertButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleClose = () => { setOpen(false); setMessage(""); setSubject(""); };

  const handleSubmit = async () => {
    if (!subject) return;
    setLoading(true);
    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: message.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar solicitud");
      }

      setSent(true);
      setTimeout(() => {
        setSent(false);
        handleClose();
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-[1.03]"
        aria-label="Contactar Experto"
      >
        <Headphones className="h-4 w-4" />
        <span className="hidden sm:inline">Contactar Experto</span>
      </button>

      {/* Modal — rendered via portal to escape overflow:hidden parent */}
      {mounted && open && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl my-auto"
               onClick={e => e.stopPropagation()}>
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
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 relative">
                  <button
                    onClick={() => { setOpen(false); setMessage(""); }}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur">
                      <Headphones className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Contactar Experto
                      </h3>
                      <p className="text-sm text-white/80 mt-0.5">
                        Cuéntenos qué necesita y le asesoraremos
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Motivo del contacto <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className={`w-full px-4 py-3 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none ${
                          !subject
                            ? "border-gray-300 dark:border-gray-600 text-gray-400"
                            : "border-indigo-400 dark:border-indigo-500 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {MOTIVOS.map(m => (
                          <option key={m.value} value={m.value} disabled={m.value === ""}>{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="h-4 w-4 inline mr-1.5" />
                      Mensaje adicional <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        subject === "Solicitar servicios" ? "Describa el servicio que necesita: auditorías, pentest, ISO 27001..."
                        : subject === "Ley marco" ? "Indique en qué aspectos de la ley marco necesita orientación..."
                        : subject === "Reportar bug" ? "Describa el problema: qué ocurrió, en qué sección y cómo reproducirlo..."
                        : "Cuéntenos en qué podemos ayudarle..."
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3.5 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <strong>¿Qué incluye?</strong> Un especialista certificado analizará su caso y le contactará para ofrecerle una solución personalizada.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50"
                      onClick={handleSubmit}
                      disabled={loading || !subject}
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
        </div>,
        document.body
      )}
    </>
  );
}
