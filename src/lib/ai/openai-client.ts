/** Server-only OpenAI helpers. Do not import from client components. */

import { AI_TEXT_MODEL } from "@/lib/ai/ai-config";

export function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

export function hasOpenAiApiKey() {
  return Boolean(getOpenAiApiKey());
}

export async function openAiChatJson(input: {
  system: string;
  user: string;
  temperature?: number;
  model?: string;
}): Promise<Record<string, unknown> | null> {
  const key = getOpenAiApiKey();
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: input.model ?? AI_TEXT_MODEL,
      temperature: input.temperature ?? 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI chat failed (${res.status}): ${detail.slice(0, 240)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) return null;

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  }
}
