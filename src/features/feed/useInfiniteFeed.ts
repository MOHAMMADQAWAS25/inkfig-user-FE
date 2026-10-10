import { useCallback, useMemo, useRef } from "react";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { getFeed, searchWorks, type FeedWork, type InfiniteFeedPage } from "../works/worksApi";

export type FeedScope = { category?: string; ownerId?: string; search?: string; viewer: string };

export function useInfiniteFeed(scope: FeedScope) {
  const client = useQueryClient();
  const queryKey = useMemo(() => ["artwork-feed", scope.viewer, scope.category ?? "", scope.ownerId ?? "", scope.search ?? ""] as const,
    [scope.viewer, scope.category, scope.ownerId, scope.search]);
  const requestLock = useRef<Promise<unknown> | null>(null);
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | number | null,
    queryFn: async ({ pageParam, signal }): Promise<InfiniteFeedPage> => {
      if (scope.search && scope.search.length >= 2) {
        const page = await searchWorks(scope.search, scope.category, pageParam === null ? undefined : Number(pageParam), scope.ownerId, signal);
        return { items: page.items, nextCursor: page.next_cursor, hasNextPage: page.next_cursor !== null };
      }
      return getFeed(scope.category, pageParam === null ? undefined : String(pageParam), scope.ownerId, signal);
    },
    getNextPageParam: (last, _pages, previous, params) => {
      if (!last.hasNextPage || last.nextCursor === null) return undefined;
      // A broken/repeated continuation must not create an endless request loop.
      return last.nextCursor === previous || params.includes(last.nextCursor) ? undefined : last.nextCursor;
    },
    retry: false,
    networkMode: "always",
    staleTime: 5 * 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const items = useMemo(() => {
    const byId = new Map<string, FeedWork>();
    for (const page of query.data?.pages ?? []) {
      for (const item of page.items) if (!byId.has(item.work_id)) byId.set(item.work_id, item);
    }
    return [...byId.values()];
  }, [query.data]);
  const loadMore = useCallback(() => {
    if (requestLock.current || query.isFetching || !query.hasNextPage) return;
    const request = query.fetchNextPage({ cancelRefetch: false });
    requestLock.current = request;
    void request.finally(() => { if (requestLock.current === request) requestLock.current = null; });
  }, [query.isFetching, query.hasNextPage, query.fetchNextPage]);
  const retry = useCallback(() => {
    if (items.length && query.hasNextPage) loadMore();
    else void query.refetch();
  }, [items.length, query.hasNextPage, loadMore, query.refetch]);
  const setItems = useCallback((update: (current: FeedWork[]) => FeedWork[]) => {
    client.setQueryData<InfiniteData<InfiniteFeedPage>>(queryKey, current => {
      if (!current) return current;
      const existing = [...new Map(current.pages.flatMap(page => page.items).map(item => [item.work_id, item])).values()];
      const updated = new Map(update(existing).map(item => [item.work_id, item]));
      return { ...current, pages: current.pages.map(page => ({ ...page,
        items: page.items.flatMap(item => { const next = updated.get(item.work_id); return next ? [next] : []; }),
      })) };
    });
  }, [client, queryKey]);
  return { items, setItems, loading: query.isPending, loadingMore: query.isFetchingNextPage,
    error: query.error, hasNextPage: query.hasNextPage, loadMore, retry, cacheKey: JSON.stringify(queryKey) };
}
