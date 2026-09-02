/**
 * Rough reading time in minutes for a post body. Counts whitespace-separated
 * tokens for Latin scripts and characters for CJK-free RTL scripts, then
 * assumes ~200 "words" per minute. Always at least 1.
 */
export function readingTimeMinutes(body: string): number {
  const clean = body.replace(/^##\s.*$/gm, " ").replace(/https?:\/\/\S+/g, " ");
  const tokens = clean.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(tokens / 200));
}
