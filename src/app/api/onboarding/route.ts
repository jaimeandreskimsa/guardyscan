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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { company, website, industry, companySize } = await req.json();

    // 1. Save profile fields on the User
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(company?.trim() && { company: company.trim() }),
        ...(website?.trim() && { website: normalizeUrl(website) }),
        ...(industry?.trim() && { industry: industry.trim() }),
        ...(companySize?.trim() && { companySize: companySize.trim() }),
        onboardingCompleted: true,
      },
    });

    // 2. Create an Organization (if the user gave a company name and doesn't have one yet)
    if (company?.trim()) {
      const existingOrg = await prisma.organization.count({
        where: { ownerId: session.user.id },
      });

      if (existingOrg === 0) {
        // Generate a unique slug from the company name
        let baseSlug = company
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let slug = baseSlug;
        let counter = 1;
        while (await prisma.organization.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        const org = await prisma.organization.create({
          data: {
            name: company.trim(),
            slug,
            website: normalizeUrl(website) || null,
            industry: industry?.trim() || null,
            size: companySize?.trim() || null,
            ownerId: session.user.id,
          },
        });

        // Add owner as OWNER member
        await prisma.organizationMember.create({
          data: {
            organizationId: org.id,
            userId: session.user.id,
            role: "OWNER",
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Error saving data" }, { status: 500 });
  }
}
