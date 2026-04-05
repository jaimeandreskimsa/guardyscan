import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaude, saveDiagnostic } from "@/lib/claude";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, company: true },
    });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const { title, description, severity, source, category } = await req.json();

    // Cache key — reuse explanation if same finding was already explained for this user
    const cacheKey = `siem_finding:${title}:${severity}:${source}`;

    const existing = await (prisma as any).claudeDiagnostic.findFirst({
      where: { userId: user.id, type: "siem_finding", context: cacheKey },
      orderBy: { createdAt: "desc" },
    });

    if (existing?.content) {
      return NextResponse.json({ explanation: existing.content, cached: true });
    }

    // Generate with Claude
    const system = `Eres un experto en ciberseguridad que analiza hallazgos de seguridad web para empresas. 
Tu tarea es explicar de forma clara, técnica pero accesible, qué significa un hallazgo de seguridad, 
por qué es un riesgo, cómo podría ser explotado, y qué pasos concretos se deben tomar para solucionarlo.
Responde siempre en español. Sé directo y práctico. Usa máximo 250 palabras.`;

    const prompt = `Analiza el siguiente hallazgo de seguridad detectado en ${source}${user.company ? ` (empresa: ${user.company})` : ''}:

**Hallazgo:** ${title}
**Severidad:** ${severity}
**Categoría:** ${category || 'seguridad web'}
**Descripción técnica:** ${description}

Explica:
1. Qué significa este problema en términos simples
2. Por qué representa un riesgo real (cómo podría explotarlo un atacante)
3. Pasos concretos para solucionarlo (ordenados por prioridad)`;

    const explanation = await askClaude({
      system,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 600,
      temperature: 0.4,
    });

    // Save to DB
    await saveDiagnostic({
      userId: user.id,
      type: "siem_finding",
      content: explanation,
      context: cacheKey,
    });

    return NextResponse.json({ explanation, cached: false });
  } catch (error) {
    console.error("Error explaining finding:", error);
    return NextResponse.json({ error: "Error al generar explicación" }, { status: 500 });
  }
}
