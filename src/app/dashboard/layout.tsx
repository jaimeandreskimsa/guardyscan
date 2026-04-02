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

  // Fetch subscription AND role directly from DB — never trust the stale JWT
  const dbUser = await prisma.user
    .findUnique({
      where: { id: session.user.id },
      select: { role: true, subscription: { select: { plan: true } } },
    })
    .catch(() => null);

  const isAdmin = dbUser?.role === "admin";
  const plan = isAdmin ? "ENTERPRISE" : (dbUser?.subscription?.plan ?? "FREE");

  // Server-side route guard: redirect to billing if plan can't access the path
  const pathname = headers().get("x-pathname") ?? "";
  if (!isAdmin && pathname.startsWith("/dashboard") && !planCanAccessPath(plan, pathname)) {
    redirect("/dashboard/billing");
  }

  return (
    <DashboardShell user={session.user} plan={plan}>
      {children}
    </DashboardShell>
  );
}
