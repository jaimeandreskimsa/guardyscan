import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: "Acceso denegado. Solo admins." }, { status: 403 });
    }

    // Métricas optimizadas (sin cargar todos los usuarios en memoria)
    const [
      totalUsers,
      activeSubscriptions,
      users,
      subscriptionsByPlan,
      recentActiveUsersRows,
      totalUsersForTable,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.user.findMany({
        include: {
          subscription: true,
          _count: { select: { scans: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      prisma.scan.findMany({
        where: {
          createdAt: { gt: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.user.count(),
    ]);

    // Calcular ingresos según el plan
    const planPrices: { [key: string]: number } = {
      FREE: 0,
      BASIC: 49000,
      PROFESSIONAL: 99000,
      ENTERPRISE: 199000,
    };

    const subscriptionsByPlanMap = subscriptionsByPlan.reduce((acc, row) => {
      acc[row.plan] = row._count.plan;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = Object.entries(subscriptionsByPlanMap).reduce((sum, [plan, count]) => {
      return sum + (planPrices[plan] || 0) * count;
    }, 0);

    const monthlyRecurring = totalRevenue; // MRR (Monthly Recurring Revenue)

    // Ingresos anuales proyectados
    const annualRevenue = monthlyRecurring * 12;

    // Distribución por planes
    const planDistribution = subscriptionsByPlanMap;

    // Usuarios activos recientes (último mes)
    const recentActiveUsers = recentActiveUsersRows.length;

    // Datos de usuarios para la tabla
    const userData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      plan: user.subscription?.plan || 'FREE',
      status: user.subscription?.status || 'INACTIVE',
      scansCount: user._count.scans,
      createdAt: user.createdAt,
      subscriptionEnd: user.subscription?.currentPeriodEnd,
    }));

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        monthlyRecurring,
        annualRevenue,
        recentActiveUsers,
        planDistribution,
      },
      users: userData,
      pagination: {
        page,
        limit,
        total: totalUsersForTable,
        totalPages: Math.max(1, Math.ceil(totalUsersForTable / limit)),
      },
    });

  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de administración" },
      { status: 500 }
    );
  }
}
