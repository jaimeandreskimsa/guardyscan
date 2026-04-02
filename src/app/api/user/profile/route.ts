import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Ensures a URL has the https:// scheme. Returns empty string if input is empty. */
function normalizeUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return "https://" + trimmed;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      company: true,
      website: true,
      industry: true,
      companySize: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, company, website, industry, companySize } = await req.json();

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(company !== undefined && { company: company.trim() }),
        ...(website !== undefined && { website: normalizeUrl(website) }),
        ...(industry !== undefined && { industry: industry.trim() }),
        ...(companySize !== undefined && { companySize: companySize.trim() }),
      },
      select: {
        name: true,
        email: true,
        company: true,
        website: true,
        industry: true,
        companySize: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
