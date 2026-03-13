"use client";

import { AgentProvider } from "@/components/dashboard/AgentContext";
import { Sidebar } from "@/components/dashboard/sidebar";
import { GuardyAgent } from "@/components/dashboard/GuardyAgent";
import { ContactExpertButton } from "@/components/dashboard/ContactExpertButton";

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <AgentProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <GuardyAgent />
        <ContactExpertButton />
      </div>
    </AgentProvider>
  );
}
