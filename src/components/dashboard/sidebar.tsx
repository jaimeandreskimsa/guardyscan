"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Search, AlertTriangle, FileCheck, LogOut,
  Settings, Eye, TrendingUp, ShieldAlert, Building2, Radar, 
  FolderArchive, Network, ChevronLeft, ChevronRight, Shield,
  CreditCard, Bell, User, HelpCircle, Users, DollarSign, UserCheck
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  user: any;
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
      name: "Seguridad",
      items: [
        { name: "SIEM", href: "/dashboard/siem", icon: Eye },
        { name: "Scanner", href: "/dashboard/scanner", icon: Radar },
        { name: "Vulnerabilidades", href: "/dashboard/vulnerabilities", icon: ShieldAlert },
        { name: "Incidentes", href: "/dashboard/incidents", icon: AlertTriangle },
      ]
    },
    {
      name: "Gestión",
      items: [
        { name: "Riesgos", href: "/dashboard/risk-management", icon: TrendingUp },
        { name: "Terceros", href: "/dashboard/third-party", icon: Network },
        { name: "Cumplimiento Normativo", href: "/dashboard/compliance", icon: FileCheck },
        { name: "BCP/DRP", href: "/dashboard/bcp", icon: Building2 },
        { name: "Comité", href: "/dashboard/committee", icon: Users },
      ]
    },
    {
      name: "Recursos",
      items: [
        { name: "Documentos", href: "/dashboard/documents", icon: FolderArchive },
        { name: "Escaneos", href: "/dashboard/scans", icon: Search },
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
      ]
    });
  }

  return baseGroups;
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 border-b border-gray-200 dark:border-gray-700`}>
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

      {/* User Profile Section - At Top */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        {/* User Profile */}
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${collapsed ? "justify-center" : ""}`}>
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "Usuario"}
              className="h-10 w-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className={`h-10 w-10 rounded-full ${getAvatarColor(user.email)} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}>
              {getInitials(user.name)}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {user.name || "Usuario"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-1 mt-3">
          <Link
            href="/dashboard/billing"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Facturación" : undefined}
          >
            <CreditCard className="h-5 w-5 text-gray-400" />
            {!collapsed && <span className="text-sm">Facturación</span>}
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Configuración" : undefined}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            {!collapsed && <span className="text-sm">Configuración</span>}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {getNavigationGroups(user.role).map((group, groupIndex) => (
          <div key={group.name} className={groupIndex > 0 ? "mt-6" : ""}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.name}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"}`} />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
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
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
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
