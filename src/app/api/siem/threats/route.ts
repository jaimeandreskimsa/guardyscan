import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const threats = await (prisma as any).threatIntelligence.findMany({
      where: { active: true },
      orderBy: { lastSeen: 'desc' },
      take: 100,
    });

    return NextResponse.json(threats);
  } catch (error) {
    console.error("Error fetching threat intelligence:", error);
    return NextResponse.json(
      { error: "Error al obtener inteligencia de amenazas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { iocType, iocValue, threatType, severity, confidence, source, description, tags } = body;

    // Check if IOC already exists
    const existingIoc = await (prisma as any).threatIntelligence.findUnique({
      where: {
        iocType_iocValue: {
          iocType,
          iocValue,
        },
      },
    });

    if (existingIoc) {
      // Update existing IOC
      const updatedIoc = await (prisma as any).threatIntelligence.update({
        where: { id: existingIoc.id },
        data: {
          lastSeen: new Date(),
          confidence,
          active: true,
        },
      });
      return NextResponse.json(updatedIoc);
    }

    // Create new IOC
    const threat = await (prisma as any).threatIntelligence.create({
      data: {
        iocType,
        iocValue,
        threatType,
        severity,
        confidence,
        source: source || "manual",
        description: description || null,
        tags: tags || null,
      },
    });

    return NextResponse.json(threat, { status: 201 });
  } catch (error) {
    console.error("Error creating threat intelligence:", error);
    return NextResponse.json(
      { error: "Error al crear inteligencia de amenazas" },
      { status: 500 }
    );
  }
}