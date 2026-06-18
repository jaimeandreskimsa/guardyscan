import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const workers = await prisma.worker.findMany({
    where: { userId: session.user.id },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json(workers);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const worker = await prisma.worker.create({
    data: { ...body, userId: session.user.id },
  });
  return NextResponse.json(worker, { status: 201 });
}
