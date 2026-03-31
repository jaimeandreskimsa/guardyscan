import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { company, website, industry, companySize } = await req.json();

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(company?.trim() && { company: company.trim() }),
        ...(website?.trim() && { website: website.trim() }),
        ...(industry?.trim() && { industry: industry.trim() }),
        ...(companySize?.trim() && { companySize: companySize.trim() }),
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Error saving data" }, { status: 500 });
  }
}
