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

  const subscription = await prisma.subscription
    .findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    })
    .catch(() => null);

  const plan = subscription?.plan ?? "FREE";

  // Server-side route guard: redirect to billing if plan can't access the path
  const pathname = headers().get("x-pathname") ?? "";
  if (pathname.startsWith("/dashboard") && !planCanAccessPath(plan, pathname)) {
    redirect("/dashboard/billing");
  }

  return (
    <DashboardShell user={session.user} plan={plan}>
      {children}
    </DashboardShell>
  );
}
