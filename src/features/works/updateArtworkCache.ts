import type { QueryClient } from "@tanstack/react-query";
import type { FeedWork } from "./worksApi";

export function updateArtworkCache(client: QueryClient, work: FeedWork, remove = false) {
  for (const [key, value] of client.getQueriesData<unknown>({})) {
    if (!["artwork-feed", "related-artworks", "profile-gallery", "artwork-detail"].includes(String(key[0])) || !value) continue;
    const visit = (input: unknown): unknown => {
      if (Array.isArray(input)) return input.flatMap(item => {
        if (item && typeof item === "object" && "work_id" in item && item.work_id === work.work_id) return remove ? [] : [{ ...item, ...work }];
        return [visit(item)];
      });
      if (input && typeof input === "object") {
        if ("work_id" in input && input.work_id === work.work_id) return remove ? null : { ...input, ...work };
        return Object.fromEntries(Object.entries(input).map(([name, item]) => {
          const updated = visit(item);
          if (key[0] === "profile-gallery" && Array.isArray(updated) && (name === "likes" || name === "saved")) {
            const active = !remove && (name === "likes" ? work.liked_by_me : work.saved_by_me);
            const filtered = updated.filter(value => value?.work_id !== work.work_id || active);
            // Only the viewer's own private collections can gain a newly liked/saved item.
            if (active && key[1] === key[2] && !filtered.some(value => value?.work_id === work.work_id)) return [name, [work, ...filtered]];
            return [name, filtered];
          }
          return [name, updated];
        }));
      }
      return input;
    };
    client.setQueryData(key, visit(value));
  }
}
