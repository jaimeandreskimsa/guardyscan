import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const vendors = await prisma.thirdPartyRisk.findMany({
    where: { userId: session.user.id },
    orderBy: { riskScore: "desc" },
  });
  return NextResponse.json(vendors);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const vendor = await prisma.thirdPartyRisk.create({
    data: { ...body, userId: session.user.id },
  });
  return NextResponse.json(vendor, { status: 201 });
}
