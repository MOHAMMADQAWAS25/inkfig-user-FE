import { mainApiBaseUrl, requestJson } from "../../api/httpClient";
import type { RatingState } from "./exhibitionRatingTypes";

export async function getExhibitionRating(exhibitionId: string, workId: string, signal?: AbortSignal): Promise<RatingState> {
  return (await requestJson<RatingState>(mainApiBaseUrl, "GET",
    `/exhibitions/${exhibitionId}/works/${workId}/rating`, { signal })).data;
}

export async function changeExhibitionRating(exhibitionId: string, workId: string, score: number | null, signal?: AbortSignal): Promise<RatingState> {
  return (await requestJson<RatingState>(mainApiBaseUrl, score === null ? "DELETE" : "PUT",
    `/exhibitions/${exhibitionId}/works/${workId}/rating`, { ...(score === null ? {} : { body: { score } }), signal })).data;
}
