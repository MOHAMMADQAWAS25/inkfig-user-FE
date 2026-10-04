import { mainApiBaseUrl, requestJson } from "../../api/httpClient";

export type WorkType = { type_id: string; code: string; name_en: string; name_ar: string };
export type WorkLink = { url: string; label: string | null };
export type Work = { work_id: string; owner_user_id: string; artist_name: string; type_id: string; type_name_en: string; type_name_ar: string; title: string; description: string; links: WorkLink[]; image_url: string; mime_type: string; like_count: number; liked_by_me: boolean; created_at: string };
export const MAX_WORK_FILE_SIZE = 10 * 1024 * 1024;
export const WORK_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export type WorkFileError = "empty" | "too-large" | "unsupported";

export function validateWorkFile(file: Pick<File, "size" | "type">): WorkFileError | null {
  if (file.size <= 0) return "empty";
  if (file.size > MAX_WORK_FILE_SIZE) return "too-large";
  if (!WORK_IMAGE_TYPES.includes(file.type as (typeof WORK_IMAGE_TYPES)[number])) return "unsupported";
  return null;
}

export function isValidWorkUrl(value: string): boolean {
  if (value.trim() === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
export async function getWorks(token?: string, typeCode?: string): Promise<Work[]> {
  const query = typeCode ? `?type_code=${encodeURIComponent(typeCode)}` : "";
  return (await requestJson<{items: Work[]}>(mainApiBaseUrl, "GET", `/works${query}`, {token})).data.items;
}
export async function getWorkTypes(): Promise<WorkType[]> { return (await requestJson<WorkType[]>(mainApiBaseUrl, "GET", "/works/types")).data; }
export async function uploadWork(token: string, input: {typeId:string; title:string; description:string; links:{label:string;url:string}[]; file:File}): Promise<void> {
  if (validateWorkFile(input.file) !== null) throw new Error("Invalid work file");
  const links=input.links.filter(link=>link.url.trim()).map(link=>({url:link.url.trim(),label:link.label.trim()||null}));
  if(links.length>10||links.some(link=>!isValidWorkUrl(link.url))||new Set(links.map(link=>link.url)).size!==links.length)throw new Error("Invalid work links");
  const prepared = (await requestJson<{work_id:string; upload_url:string; upload_token:string}>(mainApiBaseUrl, "POST", "/works/uploads", {token, body:{type_id:input.typeId,title:input.title,description:input.description,links,file_name:input.file.name,mime_type:input.file.type,file_size:input.file.size}})).data;
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", input.file);
  const uploaded = await fetch(prepared.upload_url, {method:"PUT", headers:{"x-upsert":"false"}, body});
  if (!uploaded.ok) throw new Error("Upload failed");
  await requestJson<null>(mainApiBaseUrl, "POST", `/works/${prepared.work_id}/publish`, {token});
}
export async function setWorkLike(token:string, id:string, liked:boolean):Promise<void> { await requestJson<null>(mainApiBaseUrl, liked ? "PUT" : "DELETE", `/works/${id}/like`, {token}); }
