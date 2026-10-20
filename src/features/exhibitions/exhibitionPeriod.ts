import type { Exhibition } from "./exhibitionApi";
export type ExhibitionPeriod = "current" | "upcoming" | "past";
export function exhibitionEnd(exhibition: Pick<Exhibition, "event_at" | "event_ends_at">) {
  return exhibition.event_ends_at || new Date(Date.parse(exhibition.event_at) + 24 * 60 * 60 * 1000).toISOString();
}
export function exhibitionPeriod(exhibition: Exhibition, now: number): ExhibitionPeriod {
  if (Date.parse(exhibition.event_at) > now) return "upcoming";
  return Date.parse(exhibitionEnd(exhibition)) > now ? "current" : "past";
}
