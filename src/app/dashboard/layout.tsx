import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Redirect new users (created in last 10 min) who haven't finished onboarding
  if (session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { onboardingCompleted: true, createdAt: true },
    });
    const isNew = user?.createdAt && (Date.now() - new Date(user.createdAt).getTime()) < 10 * 60 * 1000;
    if (isNew && !user?.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}
