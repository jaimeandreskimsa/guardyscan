"use client";

import { useAgent } from "@/components/dashboard/AgentContext";
import { Bot, Sparkles, ArrowRight, Shield, MessageCircle } from "lucide-react";

export function GuardyAgentCard() {
  const { toggleAgent } = useAgent();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-[1px] shadow-xl shadow-blue-500/20">
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 lg:p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="h-9 w-9 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white/30 animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">Guardy Agente</h3>
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-xl">
              Tu asistente de ciberseguridad con IA. Pregúntale sobre tu estado de seguridad, 
              vulnerabilidades, incidentes, recomendaciones y más.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { icon: Shield, text: "Estado de seguridad" },
                { icon: MessageCircle, text: "Recomendaciones" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Icon className="h-3 w-3" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => toggleAgent()}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-white/90 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Bot className="h-5 w-5" />
            Hablar con Guardy
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
