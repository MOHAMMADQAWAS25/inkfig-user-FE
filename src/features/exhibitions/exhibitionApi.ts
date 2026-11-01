import { mainApiBaseUrl, requestJson } from "../../api/httpClient";

export type ExhibitionInput = {
  name: string;
  description: string;
  event_at: string;
  event_ends_at?: string;
  participation_opens_at: string;
  participation_closes_at: string;
};
export type Exhibition = ExhibitionInput & {
  exhibition_id: string;
  creator_user_id: string;
  banner_url: string | null;
  participation_open: boolean;
  created_at: string;
};
export type Submission = {
  submission_id: string;
  work_id: string;
  user_id: string;
  artist_name: string;
  artist_avatar_url?: string | null;
  title: string;
  description?: string;
  type_name_en?: string;
  type_name_ar?: string;
  image_url: string;
  status: string;
  rejection_reason: string | null;
  withdrawal_status?: "pending" | "rejected" | null;
  withdrawal_reason?: string | null;
  withdrawal_review_reason?: string | null;
  created_at: string;
};
export type Block = { user_id: string; full_name: string; reason: string };
export type Page<T> = { items: T[]; next_cursor: number | null };
export type ExhibitionCounts={total:number;items:{exhibition_id:string;submissions:number;withdrawals:number}[]};
export async function getExhibitionCounts(){return (await requestJson<ExhibitionCounts>(mainApiBaseUrl,"GET","/exhibitions/pending-counts")).data;}
export async function listExhibitions(
  cursor = 0,
  period: "all" | "current" | "upcoming" | "past" = "all",
) {
  return (
    await requestJson<Page<Exhibition>>(
      mainApiBaseUrl,
      "GET",
      `/exhibitions?cursor=${cursor}&period=${period}`,
    )
  ).data;
}
export async function getExhibition(id: string) {
  return (
    await requestJson<Exhibition>(mainApiBaseUrl, "GET", `/exhibitions/${id}`)
  ).data;
}
export async function deleteExhibition(id: string) {
  await requestJson(mainApiBaseUrl, "DELETE", `/exhibitions/${id}`);
}
export async function saveExhibition(data: ExhibitionInput, id?: string) {
  return (
    await requestJson<Exhibition>(
      mainApiBaseUrl,
      id ? "PUT" : "POST",
      `/exhibitions${id ? `/${id}` : ""}`,
      { body: data },
    )
  ).data;
}
export async function getEligibleExhibitions(cursor = 0, workId?: string, exhibitionId?: string) {
  const query = new URLSearchParams({ cursor: String(cursor) });
  if (workId) query.set("work_id", workId);
  if (exhibitionId) query.set("exhibition_id", exhibitionId);
  return (await requestJson<Page<Exhibition>>(mainApiBaseUrl, "GET", `/exhibitions/eligible?${query}`)).data;
}
export async function getSubmissions(id: string, scope: string, cursor = 0, status?: "approved" | "pending" | "rejected") {
  return (
    await requestJson<Page<Submission>>(
      mainApiBaseUrl,
      "GET",
      `/exhibitions/${id}/submissions?scope=${scope}&cursor=${cursor}${status ? `&status=${status}` : ""}`,
    )
  ).data;
}
export async function submitWork(id: string, workId: string) {
  await requestJson(mainApiBaseUrl, "POST", `/exhibitions/${id}/submissions`, {
    body: { work_id: workId },
  });
}
export async function withdrawSubmission(id: string, submissionId: string, reason?: string) {
  await requestJson(mainApiBaseUrl, "POST", `/exhibitions/${id}/submissions/${submissionId}/withdrawal`, { body: { reason } });
}
export async function reviewWithdrawal(id: string, submissionId: string, status: "approved" | "rejected", reason?: string) {
  await requestJson(mainApiBaseUrl, "PATCH", `/exhibitions/${id}/submissions/${submissionId}/withdrawal`, { body: { status, reason } });
}
export async function reviewSubmission(
  id: string,
  submissionId: string,
  status: string,
  reason?: string,
) {
  await requestJson(
    mainApiBaseUrl,
    "PATCH",
    `/exhibitions/${id}/submissions/${submissionId}`,
    { body: { status, reason } },
  );
}
export async function blockParticipant(
  id: string,
  userId: string,
  reason: string,
) {
  await requestJson(
    mainApiBaseUrl,
    "PUT",
    `/exhibitions/${id}/blocks/${userId}`,
    { body: { reason } },
  );
}
export async function unblockParticipant(id: string, userId: string) {
  await requestJson(
    mainApiBaseUrl,
    "DELETE",
    `/exhibitions/${id}/blocks/${userId}`,
  );
}
export async function getBlocks(id: string, cursor = 0) {
  return (
    await requestJson<Page<Block>>(
      mainApiBaseUrl,
      "GET",
      `/exhibitions/${id}/blocks?cursor=${cursor}`,
    )
  ).data;
}
export async function uploadBanner(id: string, file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size <= 0 ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Select a JPEG, PNG or WebP image up to 10 MB.");
  const signed = (
    await requestJson<{ object_path: string; upload_url: string }>(
      mainApiBaseUrl,
      "POST",
      `/exhibitions/${id}/banner-uploads`,
      { body: { mime_type: file.type, file_size: file.size } },
    )
  ).data;
  const body = new FormData();
  body.append("", file);
  const response = await fetch(signed.upload_url, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body,
  });
  if (!response.ok) throw new Error("Banner upload failed.");
  await requestJson(
    mainApiBaseUrl,
    "POST",
    `/exhibitions/${id}/banner-uploads/complete`,
    { body: { object_path: signed.object_path } },
  );
}
