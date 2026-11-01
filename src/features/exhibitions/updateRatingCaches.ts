import type { QueryClient } from "@tanstack/react-query";
import type { RatingState } from "./exhibitionRatingTypes";

export function updateRatingCaches(client: QueryClient, viewer: string, exhibitionId: string, workId: string, rating: RatingState) {
  const totals = { average: rating.average, vote_count: rating.vote_count };
  for (const [key, data] of client.getQueriesData({})) {
    if (key[1] !== viewer || !["artwork-feed", "artwork-detail", "related-artworks", "profile-gallery", "exhibition-public-works"].includes(String(key[0]))) continue;
    const visit = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(visit);
      if (!value || typeof value !== "object") return value;
      const row = value as Record<string, unknown>;
      const next = Object.fromEntries(Object.entries(row).map(([name, item]) => [name, visit(item)]));
      if (row.work_id !== workId) return next;
      if (key[0] === "exhibition-public-works" && key[2] === exhibitionId) next.rating = rating;
      const summary = row.exhibition_rating as { exhibition_id?: string } | undefined;
      if (summary?.exhibition_id === exhibitionId) next.exhibition_rating = { ...summary, ...totals };
      if (Array.isArray(row.exhibitions)) next.exhibitions = row.exhibitions.map(entry => entry.exhibition_id === exhibitionId ? { ...entry, rating: totals } : entry);
      return next;
    };
    if (data) client.setQueryData(key, visit(data));
  }
}
