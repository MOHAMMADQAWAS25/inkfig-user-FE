import { mainApiBaseUrl, requestJson } from "../../api/httpClient";

export type WorkType = { type_id: string; code: string; name_en: string; name_ar: string };
export type Work = { work_id: string; owner_user_id: string; artist_name: string; type_id: string; type_name_en: string; type_name_ar: string; title: string; description: string; image_url: string; mime_type: string; like_count: number; liked_by_me: boolean; created_at: string };
export async function getWorks(token?: string): Promise<Work[]> { return (await requestJson<{items: Work[]}>(mainApiBaseUrl, "GET", "/works", {token})).data.items; }
export async function getWorkTypes(): Promise<WorkType[]> { return (await requestJson<WorkType[]>(mainApiBaseUrl, "GET", "/works/types")).data; }
export async function uploadWork(token: string, input: {typeId:string; title:string; description:string; file:File}): Promise<void> {
  const prepared = (await requestJson<{work_id:string; upload_url:string; upload_token:string}>(mainApiBaseUrl, "POST", "/works/uploads", {token, body:{type_id:input.typeId,title:input.title,description:input.description,file_name:input.file.name,mime_type:input.file.type,file_size:input.file.size}})).data;
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", input.file);
  const uploaded = await fetch(prepared.upload_url, {method:"PUT", headers:{"x-upsert":"false"}, body});
  if (!uploaded.ok) throw new Error("Upload failed");
  await requestJson<null>(mainApiBaseUrl, "POST", `/works/${prepared.work_id}/publish`, {token});
}
export async function setWorkLike(token:string, id:string, liked:boolean):Promise<void> { await requestJson<null>(mainApiBaseUrl, liked ? "PUT" : "DELETE", `/works/${id}/like`, {token}); }
