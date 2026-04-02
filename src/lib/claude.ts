import Anthropic from "@anthropic-ai/sdk";

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
