"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, AlertTriangle, FileCheck,
  ShieldAlert, Building2, Radar, Eye,
  FolderArchive, Network, ChevronLeft, ChevronRight, Shield,
  Users, DollarSign, UserCheck, Laptop, Target,
  Sparkles, Bot, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAgent } from "@/components/dashboard/AgentContext";
import { planCanAccessPath, planHasAgent, planDisplayName } from "@/lib/planRestrictions";

interface SidebarProps {
  user: any;
  plan?: string;
  isAdmin?: boolean;
}

// Navegación agrupada por categorías
const getNavigationGroups = (userRole: string) => {
  const baseGroups = [
    {
      name: "General",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      name: "Análisis",
      items: [
        { name: "Centro de Análisis", href: "/dashboard/scanner", icon: Radar },
      ]
    },
    {
      name: "Seguridad",
      items: [
        { name: "Monitoreo de Seguridad", href: "/dashboard/siem", icon: Eye },
        { name: "Vulnerabilidades", href: "/dashboard/vulnerabilities", icon: ShieldAlert },
        { name: "Incidentes", href: "/dashboard/incidents", icon: AlertTriangle },
      ]
    },
    {
      name: "Gestión",
      items: [
        { name: "Inventario de Activos", href: "/dashboard/inventory", icon: Laptop },
        { name: "Trabajadores", href: "/dashboard/workers", icon: Users },
        { name: "Proveedores", href: "/dashboard/third-party", icon: Network },
      ]
    },
    {
      name: "Gobernanza",
      items: [
        { name: "Cumplimiento Normativo", href: "/dashboard/compliance", icon: FileCheck },
        { name: "Continuidad de Negocio", href: "/dashboard/bcp", icon: Building2 },
        { name: "Comité", href: "/dashboard/committee", icon: Users },
      ]
    },
    {
      name: "Recursos",
      items: [
        { name: "Documentos", href: "/dashboard/documents", icon: FolderArchive },
      ]
    },
  ];

  // Agregar sección de Administración solo para admins
  if (userRole === 'admin') {
    baseGroups.push({
      name: "Administración",
      items: [
        { name: "Usuarios Activos", href: "/dashboard/admin/users", icon: UserCheck },
        { name: "Finanzas", href: "/dashboard/admin/finance", icon: DollarSign },
        { name: "Solicitudes de Asesoría", href: "/dashboard/admin/advisory", icon: MessageSquare },
      ]
    });
  }

  return baseGroups;
};

export function Sidebar({ user, plan = "FREE", isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAgentOpen, toggleAgent } = useAgent();

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cerrar sidebar en móvil al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Helpers
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string | null | undefined) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-red-500"
    ];
    if (!email) return colors[0];
    const hash = email.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 border-b border-gray-100/80`}>
        <Link href="/dashboard" className="flex items-center gap-2">
          {collapsed ? (
            <Shield className="h-8 w-8 text-blue-600" />
          ) : (
            <Image
              src="/logo.png"
              alt="GuardyScan"
              width={150}
              height={40}
              className="h-9 w-auto"
              priority
            />
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {getNavigationGroups(isAdmin ? 'admin' : (user.role ?? '')).map((group, groupIndex) => (
          <div key={group.name} className={groupIndex > 0 ? "mt-6" : ""}>
            {!collapsed && (
              <h3 className="px-3 mb-1.5 text-[10px] font-bold text-gray-400/80 uppercase tracking-widest">
                {group.name}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const isLocked = isAdmin ? false : !planCanAccessPath(plan, item.href);
                return (
                  <>
                    {isLocked ? (
                      <a
                        key={item.name}
                        href="/dashboard/billing"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group opacity-40 hover:opacity-60 ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? `${item.name} (requiere upgrade)` : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                        {!collapsed && (
                          <span className="font-medium text-sm text-gray-400 flex items-center gap-1.5 flex-1">
                            {item.name}
                            <span className="ml-auto text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">PRO</span>
                          </span>
                        )}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20 nav-active-glow"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"}`} />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.name}</span>
                        )}
                      </Link>
                    )}
                    {/* Guardy Agente — debajo del Dashboard */}
                    {item.href === "/dashboard" && (
                      (isAdmin || planHasAgent(plan)) ? (
                        <button
                          onClick={() => toggleAgent()}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                            isAgentOpen
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/20 dark:hover:to-blue-900/20"
                          } ${collapsed ? "justify-center" : ""}`}
                          title={collapsed ? "Guardy AI" : undefined}
                        >
                          <div className={`relative flex-shrink-0 ${isAgentOpen ? "" : "text-cyan-600 dark:text-cyan-400"}`}>
                            <Bot className={`h-5 w-5 ${isAgentOpen ? "text-white" : ""}`} />
                            {!isAgentOpen && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white dark:border-gray-800" />
                            )}
                          </div>
                          {!collapsed && (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-semibold text-sm">Guardy AI</span>
                              <Sparkles className={`h-3.5 w-3.5 ${isAgentOpen ? "text-yellow-300" : "text-yellow-500"}`} />
                            </div>
                          )}
                        </button>
                      ) : (
                        <a
                          href="/dashboard/billing"
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-40 hover:opacity-60 transition-all ${collapsed ? "justify-center" : ""}`}
                          title={collapsed ? "Guardy AI (requiere Professional)" : undefined}
                        >
                          <Bot className="h-5 w-5 flex-shrink-0 text-gray-400" />
                          {!collapsed && (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium text-sm text-gray-400">Guardy AI</span>
                              <span className="ml-auto text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">PRO</span>
                            </div>
                          )}
                        </a>
                      )
                    )}
                  </>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom footer placeholder - keep border for layout */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700" />
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <Shield className="h-6 w-6 text-blue-600" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white
          border-r border-gray-100/80
          flex flex-col
          transition-all duration-300 ease-in-out
          shadow-[1px_0_0_rgba(0,0,0,0.03)]
          ${collapsed ? "w-[72px]" : "w-64"}
          ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
      >
        {/* Close button for mobile */}
        {isMobile && mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {sidebarContent}
      </aside>
    </>
  );
}
