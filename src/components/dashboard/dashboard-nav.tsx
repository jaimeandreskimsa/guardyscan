"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Search, AlertTriangle, FileCheck, LogOut, Menu, 
  Settings, Users, Eye, TrendingUp, User, Bell, ShieldAlert, Shield, Building2, Radar, CreditCard, FolderArchive, Network, DollarSign, Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

interface DashboardNavProps {
  user: any;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegación actualizada con nuevas secciones
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Información de Seguridad y Gestión de Eventos", href: "/dashboard/siem", icon: Eye },
    { name: "Scanner", href: "/dashboard/scanner", icon: Radar },
    { name: "Vulnerabilidades", href: "/dashboard/vulnerabilities", icon: ShieldAlert },
    { name: "Riesgos", href: "/dashboard/risk-management", icon: TrendingUp },
    { name: "Inventario", href: "/dashboard/inventory", icon: Laptop },
    { name: "Trabajadores", href: "/dashboard/workers", icon: Users },
    { name: "Terceros", href: "/dashboard/third-party", icon: Network },
    { name: "Compliance", href: "/dashboard/compliance", icon: FileCheck },
    { name: "Plan de Continuidad del Negocio y Recuperación ante Desastres", href: "/dashboard/bcp", icon: Building2 },
    { name: "Documentos", href: "/dashboard/documents", icon: FolderArchive },
    { name: "Incidentes", href: "/dashboard/incidents", icon: AlertTriangle },
    { name: "Escaneos", href: "/dashboard/scans", icon: Search },
  ];

  // Agregar sección de Administración solo para admins
  const adminNavigation = user.role === 'admin' ? [
    { name: "Administración", href: "/dashboard/admin", icon: DollarSign },
  ] : [];

  const allNavigation = [...navigation, ...adminNavigation];

  // Obtener iniciales del usuario
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Colores de avatar basados en el email
  const getAvatarColor = (email: string | null | undefined) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-red-500"
    ];
    if (!email) return colors[0];
    const hash = email.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="GuardyScan"
              width={180}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {allNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side: Settings + Avatar */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </Link>

            {/* Avatar con Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 p-1 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  userMenuOpen ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
              >
                {/* Avatar */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Usuario"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className={`h-9 w-9 rounded-full ${getAvatarColor(user.email)} flex items-center justify-center text-white font-medium text-sm`}>
                    {getInitials(user.name)}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "Usuario"}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`h-12 w-12 rounded-full ${getAvatarColor(user.email)} flex items-center justify-center text-white font-semibold text-lg`}>
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.name || "Usuario"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-5 w-5 text-gray-400" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-5 w-5 text-gray-400" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span>Facturación</span>
                    </Link>
                    <Link
                      href="/dashboard/siem/alerts"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Bell className="h-5 w-5 text-gray-400" />
                      <span>Notificaciones</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile User Info */}
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg mx-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Usuario"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className={`h-10 w-10 rounded-full ${getAvatarColor(user.email)} flex items-center justify-center text-white font-medium`}>
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                  {user.name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 dark:text-gray-300"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2 text-red-600 w-full"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
