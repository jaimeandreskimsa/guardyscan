"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Search, AlertTriangle, FileCheck, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function DashboardLayout({ children, locale }: { children: React.ReactNode; locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navigation = [
    { name: t('dashboard'), href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: t('scans'), href: `/${locale}/dashboard/scans`, icon: Search },
    { name: t('incidents'), href: `/${locale}/dashboard/incidents`, icon: AlertTriangle },
    { name: t('compliance'), href: `/${locale}/dashboard/compliance`, icon: FileCheck },
    { name: t('settings'), href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Image
              src="/logo.png"
              alt="GuardyScan"
              width={140}
              height={35}
              className="h-8 w-auto"
              priority
            />
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
