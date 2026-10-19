import { mainApiBaseUrl, requestJson } from "../../api/httpClient";
import type { FeedWork } from "./worksApi";

export type RelatedPage = { items: FeedWork[]; next_cursor: string | null };
export async function getRelatedArtworks(id: string, cursor?: string, signal?: AbortSignal): Promise<RelatedPage> {
  const params = new URLSearchParams({ limit: "20" });
  if (cursor) params.set("cursor", cursor);
  const page = (await requestJson<RelatedPage>(mainApiBaseUrl, "GET", `/works/${encodeURIComponent(id)}/related?${params}`, { signal })).data;
  return { ...page, items: page.items.map(item => ({ ...item, description: "", links: [] })) };
}
