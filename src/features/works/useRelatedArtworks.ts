import { useInfiniteQuery } from "@tanstack/react-query";
import { getRelatedArtworks } from "./relatedArtworksApi";

export function useRelatedArtworks(id: string, viewer: string, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ["related-artworks", viewer, id], enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => getRelatedArtworks(id, pageParam, signal),
    getNextPageParam: (page, _pages, previous, params) => page.next_cursor && page.next_cursor !== previous && !params.includes(page.next_cursor) ? page.next_cursor : undefined,
    staleTime: 300_000, gcTime: 300_000, retry: false, refetchOnWindowFocus: false,
  });
  const items = [...new Map((query.data?.pages ?? []).flatMap(page => page.items).filter(item => item.work_id !== id).map(item => [item.work_id, item])).values()];
  return { ...query, items };
}
