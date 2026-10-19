export function artworkPath(language: string, id: string) { return `/${language}/artwork/${encodeURIComponent(id)}`; }
export function safeArtworkReturn(value: unknown, fallback: string): string {
  return typeof value === "string" && /^\/(en|ar)(\/|\?|$)/.test(value) && !value.includes("\\") ? value : fallback;
}
