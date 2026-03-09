"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  Loader2,
  Minimize2,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { label: "📊 Mi estado", text: "¿Cuál es mi estado de seguridad actual?" },
  { label: "⚠️ Vulnerabilidades", text: "¿Qué vulnerabilidades críticas tengo?" },
  { label: "🚨 Incidentes", text: "¿Hay incidentes abiertos que deba atender?" },
  { label: "📈 Escaneos", text: "¿Cómo van mis últimos escaneos?" },
  { label: "🔒 Cumplimiento", text: "¿Cómo está mi cumplimiento normativo?" },
  { label: "📋 Riesgos", text: "¿Qué riesgos tengo identificados?" },
  { label: "🏢 Proveedores", text: "¿Cómo están mis proveedores?" },
  { label: "💡 Recomendaciones", text: "¿Qué debo priorizar para mejorar mi seguridad?" },
];

export function GuardyAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Stop pulse after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history }),
        });

        const data = await res.json();

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || data.error || "Error al procesar la consulta.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "⚠️ Error de conexión. Verifica tu conexión a internet e intenta de nuevo.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Format markdown-like text to simple HTML
  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowPulse(false);
          }}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Abrir Guardy Agente"
        >
          {/* Pulse animation */}
          {showPulse && (
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />
          )}
          {/* Main button */}
          <div className="relative flex items-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-5 py-3.5 rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
            <Shield className="h-5 w-5" />
            <span className="font-semibold text-sm">Guardy Agente</span>
            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            🛡️ Tu asistente de ciberseguridad con IA
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[70vh] sm:h-[600px] max-h-[80vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  Guardy Agente
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                </h3>
                <p className="text-blue-100 text-xs">Asistente IA de ciberseguridad</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Limpiar chat"
                  title="Limpiar conversación"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Minimizar"
              >
                <Minimize2 className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Welcome */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-3.5 shadow-sm max-w-[85%]">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      🛡️ ¡Hola! Soy <strong>Guardy</strong>, tu asistente de
                      ciberseguridad con IA.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Estoy conectado a todos los módulos de tu plataforma. Puedo explicarte
                      en lenguaje simple tus vulnerabilidades, incidentes, escaneos y mucho más.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Pregúntame lo que necesites 👇
                    </p>
                  </div>
                </div>
                {/* Quick questions */}
                <div className="pl-11 space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Preguntas sugeridas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => sendMessage(q.text)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-500 to-pink-500"
                      : "bg-gradient-to-br from-cyan-500 to-blue-600"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-md"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-md"
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === "user" ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">Guardy está analizando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions after conversation */}
          {messages.length > 0 && !isLoading && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.text)}
                    className="text-[11px] px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
          >
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none disabled:opacity-50 py-1.5"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-1.5">
              Guardy Agente · Powered by IA 🛡️
            </p>
          </form>
        </div>
      )}
    </>
  );
}
