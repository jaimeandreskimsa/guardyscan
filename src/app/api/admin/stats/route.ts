import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    // Obtener todos los usuarios con sus suscripciones
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        scans: {
          select: { id: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular métricas
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => 
      u.subscription && u.subscription.status === 'active'
    ).length;

    const totalRevenue = users.reduce((sum, user) => {
      if (user.subscription?.status === 'active') {
        // Calcular ingresos según el plan
        const planPrices: { [key: string]: number } = {
          'free': 0,
          'basic': 49000,      // $49.000 CLP
          'professional': 99000,// $99.000 CLP
          'enterprise': 199000  // $199.000 CLP
        };
        return sum + (planPrices[user.subscription.plan] || 0);
      }
      return sum;
    }, 0);

    const monthlyRecurring = totalRevenue; // MRR (Monthly Recurring Revenue)

    // Ingresos anuales proyectados
    const annualRevenue = monthlyRecurring * 12;

    // Distribución por planes
    const planDistribution = users.reduce((acc, user) => {
      const plan = user.subscription?.plan || 'free';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Usuarios activos recientes (último mes)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentActiveUsers = users.filter(u => 
      u.scans.length > 0 && new Date(u.createdAt) > lastMonth
    ).length;

    // Datos de usuarios para la tabla
    const userData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      plan: user.subscription?.plan || 'free',
      status: user.subscription?.status || 'inactive',
      scansCount: user.scans.length,
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
    });

  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de administración" },
      { status: 500 }
    );
  }
}
