import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-5";

/**
 * Llama a Claude y retorna el texto de respuesta.
 * Incluye system prompt, historial de conversación y mensaje del usuario.
 */
export async function askClaude({
  system,
  messages,
  maxTokens = 2048,
  temperature = 0.7,
}: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Respuesta inesperada de Claude");
  return block.text;
}

/**
 * Guarda un diagnóstico generado por Claude en la base de datos.
 * type: "agent_response" | "report_analysis" | "scan_analysis"
 */
export async function saveDiagnostic({
  userId,
  type,
  content,
  context,
  tokens,
}: {
  userId: string;
  type: string;
  content: string;
  context?: string;
  tokens?: number;
}): Promise<void> {
  try {
    await (prisma as any).claudeDiagnostic.create({
      data: {
        userId,
        type,
        content,
        context: context?.substring(0, 1000),
        model: CLAUDE_MODEL,
        tokens: tokens ?? null,
      },
    });
  } catch (err) {
    // No bloquear el flujo principal si falla el guardado
    console.error("[saveDiagnostic] Error guardando diagnóstico:", err);
  }
}

/**
 * Obtiene el último diagnóstico guardado de un tipo para un usuario.
 * Devuelve null si no existe ninguno.
 */
export async function getLastDiagnostic(
  userId: string,
  type: string
): Promise<string | null> {
  try {
    const row = await (prisma as any).claudeDiagnostic.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });
    return row?.content ?? null;
  } catch (err) {
    console.error("[getLastDiagnostic] Error leyendo diagnóstico:", err);
    return null;
  }
}
