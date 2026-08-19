type Params = Record<string, string | number>;

export function interpolate(text: string, params?: Params): string {
  if (!params) return text;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}
