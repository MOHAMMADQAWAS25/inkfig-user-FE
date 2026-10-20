import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getExhibition, getSubmissions } from "./exhibitionApi";
import { exhibitionEnd } from "./exhibitionPeriod";
import { useExhibitionLive } from "./useExhibitionLive";

/** Update the page only at schedule boundaries, not on every countdown tick. */
export function useExhibitionClock(start?: string, end?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer = 0;
    const update = () => {
      const current = Date.now();
      setNow(current);
      const next = [start, end].map(value => Date.parse(value || ""))
        .filter(value => value > current).sort((a, b) => a - b)[0];
      window.clearTimeout(timer);
      if (next !== undefined) timer = window.setTimeout(update, Math.min(next - current, 2_147_483_647));
    };
    update();
    const visible = () => { if (!document.hidden) update(); };
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", visible); };
  }, [start, end]);
  return now;
}

/** Public gallery only: viewer-scoped, in-memory cache, never private submissions. */
export function useExhibitionGallery(id: string | undefined, viewer: string) {
  const details = useQuery({
    queryKey: ["exhibition-detail", viewer, id],
    queryFn: () => getExhibition(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const selected = details.data;
  const now = useExhibitionClock(selected?.event_at, selected ? exhibitionEnd(selected) : undefined);
  const started = Boolean(selected && Date.parse(selected.event_at) <= now);
  const works = useInfiniteQuery({
    queryKey: ["exhibition-public-works", viewer, id],
    queryFn: ({ pageParam }) => getSubmissions(id!, "public", pageParam),
    initialPageParam: 0,
    getNextPageParam: page => page.next_cursor ?? undefined,
    enabled: Boolean(id && started),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  useExhibitionLive(id, () => { void details.refetch(); if (started) void works.refetch(); }, Boolean(id));
  return {
    selected, now, started, works,
    // Show one initial loading stage; cached/background updates retain the wall.
    loading: Boolean(id && (details.isPending || (started && works.isPending))),
    error: details.error || (started ? works.error : null),
    submissions: started ? works.data?.pages.flatMap(page => page.items) ?? [] : [],
    refresh: async () => { await details.refetch({ throwOnError: true }); if (started) await works.refetch({ throwOnError: true }); },
  };
}
