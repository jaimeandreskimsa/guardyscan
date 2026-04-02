"use client";

import { AgentProvider } from "@/components/dashboard/AgentContext";
import { Sidebar } from "@/components/dashboard/sidebar";
import { GuardyAgent } from "@/components/dashboard/GuardyAgent";
import { ContactExpertButton } from "@/components/dashboard/ContactExpertButton";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Settings, CreditCard, LogOut, Bell, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DashboardShellProps {
  user: any;
  plan?: string;
  isAdmin?: boolean;
  children: React.ReactNode;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function TopBar({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-end gap-0.5 px-5 bg-white/80 backdrop-blur-xl border-b border-gray-100/90 shadow-[0_1px_0_rgba(0,0,0,0.04)]">

      {/* Contact Expert — inline header button */}
      <ContactExpertButton />

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200/80 mx-1" />

      {/* Notifications */}
      <button className="relative p-2.5 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group">
        <Bell className="h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600 transition-colors" />
        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full ring-[1.5px] ring-white" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200/80 mx-2" />

      {/* User dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group"
        >
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name ?? "avatar"}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200/60"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm ring-2 ring-gray-200/60">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-[13px] font-semibold text-gray-800 max-w-[120px] truncate leading-none mb-0.5">
              {user?.name || "Usuario"}
            </p>
            <p className="text-[11px] text-gray-400 max-w-[120px] truncate leading-none">
              {user?.role === "admin" ? "Administrador" : "Usuario"}
            </p>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="dropdown-menu absolute right-0 top-[calc(100%+8px)] w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-blue-50/60 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {user?.image ? (
                  <img src={user.image} alt={user.name ?? "avatar"} className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2 px-2">
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-150 group"
                onClick={() => setOpen(false)}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100/70 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="font-medium">Facturación</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100/70 hover:text-gray-900 rounded-xl transition-all duration-150 group"
                onClick={() => setOpen(false)}
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100/70 flex items-center justify-center shrink-0 group-hover:bg-gray-200/60 transition-colors">
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="font-medium">Configuración</span>
              </Link>
            </div>

            <div className="px-2 pb-2 border-t border-gray-100/80 pt-1.5">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-150 w-full group"
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="font-semibold">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function DashboardShell({ user, plan = "FREE", isAdmin = false, children }: DashboardShellProps) {
  return (
    <AgentProvider>
      <div className="min-h-screen bg-[#f7f8fc] flex">
        <Sidebar user={user} plan={plan} isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar user={user} />
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        <GuardyAgent plan={isAdmin ? "ENTERPRISE" : plan} />
      </div>
    </AgentProvider>
  );
}
