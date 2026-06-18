import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const equipment = await prisma.equipment.findMany({
    where: { userId: session.user.id },
    orderBy: { physicalLocation: "asc" },
  });
  return NextResponse.json(equipment);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.equipment.create({
    data: { ...body, userId: session.user.id },
  });
  return NextResponse.json(item, { status: 201 });
}
