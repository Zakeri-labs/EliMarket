/** Server-only Google Gemini helpers. Do not import from client components. */

export function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    null
  );
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}
