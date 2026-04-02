import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/prisma";
import { planCanAccessPath } from "@/lib/planRestrictions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch role + subscription from DB — never trust the stale JWT
  // Try by id first, fall back to email so stale tokens still work
  let dbUser = null;
  try {
    if (session.user.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, subscription: { select: { plan: true } } },
      });
    }
    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, subscription: { select: { plan: true } } },
      });
    }
  } catch (_) {
    dbUser = null;
  }

  // Belt-and-suspenders: also trust JWT role as last resort for admin
  const isAdmin =
    dbUser?.role === "admin" ||
    (session.user as any).role === "admin";
  const plan = isAdmin ? "ENTERPRISE" : (dbUser?.subscription?.plan ?? "FREE");

  // Server-side route guard: redirect to billing if plan can't access the path
  const pathname = headers().get("x-pathname") ?? "";
  if (!isAdmin && pathname.startsWith("/dashboard") && !planCanAccessPath(plan, pathname)) {
    redirect("/dashboard/billing");
  }

  return (
    <DashboardShell user={session.user} plan={plan} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  );
}
