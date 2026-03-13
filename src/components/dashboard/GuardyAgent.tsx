"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAgent } from "@/components/dashboard/AgentContext";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  Loader2,
  Trash2,
  PanelRightClose,
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
  const { isAgentOpen: isOpen, toggleAgent, closeAgent } = useAgent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Keyboard shortcut: Ctrl/Cmd + Shift + A to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "a") {
        e.preventDefault();
        toggleAgent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAgent]);

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

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // Format markdown-like text to simple HTML
  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>")
      .replace(/• /g, "&bull; ");
  };

  return (
    <>
      {/* Sidebar Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => closeAgent()}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-full z-40 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl transition-transform duration-300 ease-in-out w-full sm:w-[420px] lg:w-[400px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
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
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Limpiar chat"
                title="Limpiar conversación"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            )}
            <button
              onClick={() => closeAgent()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar panel"
              title="Cerrar panel"
            >
              <PanelRightClose className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50 dark:bg-gray-950">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="space-y-5">
              {/* Welcome */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-4 shadow-sm flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    🛡️ ¡Hola! Soy <strong>Guardy</strong>, tu asistente de
                    ciberseguridad con IA.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Estoy conectado a todos los módulos de tu plataforma. Puedo
                    explicarte en lenguaje simple tus vulnerabilidades, incidentes,
                    escaneos y mucho más.
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Pregúntame lo que necesites 👇
                  </p>
                </div>
              </div>

              {/* Quick questions grid */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                  Preguntas sugeridas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => sendMessage(q.text)}
                      disabled={isLoading}
                      className="text-left text-xs px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50 hover:shadow-sm"
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
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
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
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-md"
                }`}
              >
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content),
                  }}
                />
                <p
                  className={`text-[10px] mt-2 ${
                    msg.role === "user" ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-500">
                    Guardy está analizando...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions after conversation */}
        {messages.length > 0 && !isLoading && (
          <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
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
          className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
          <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none disabled:opacity-50 py-1.5 resize-none max-h-[120px]"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 p-0 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-gray-400">
              Guardy Agente · Powered by IA 🛡️
            </p>
            <p className="text-[10px] text-gray-400">
              ⌘⇧A para abrir/cerrar
            </p>
          </div>
        </form>
      </aside>
    </>
  );
}
