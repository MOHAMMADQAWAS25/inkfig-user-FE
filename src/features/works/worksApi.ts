import { mainApiBaseUrl, requestJson } from "../../api/httpClient";

export type WorkType = { type_id: string; code: string; name_en: string; name_ar: string };
export type WorkLink = { url: string; label: string | null };
export type Work = { work_id: string; owner_user_id: string; artist_name: string; type_id: string; type_name_en: string; type_name_ar: string; title: string; description: string; links: WorkLink[]; image_url: string; mime_type: string; like_count: number; liked_by_me: boolean; saved_by_me: boolean; created_at: string; search_rank?: number | null; similarity_score?: number | null };
export type WorkPage = { items: Work[]; next_cursor: string | number | null };
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
export async function getWorks(typeCode?: string, cursor?: string, ownerUserId?: string): Promise<WorkPage> {
  const query = new URLSearchParams();
  if (typeCode) query.set("type_code", typeCode);
  if (cursor) query.set("before", cursor);
  if (ownerUserId) query.set("owner_user_id", ownerUserId);
  const suffix=query.size?`?${query.toString()}`:"";
  return (await requestJson<WorkPage>(mainApiBaseUrl, "GET", `/works${suffix}`)).data;
}
export async function searchWorks(queryText: string, typeCode?: string, cursor?: number, ownerUserId?: string): Promise<WorkPage> {
  const query = new URLSearchParams({ query: queryText });
  if (typeCode) query.set("type_code", typeCode);
  if (cursor !== undefined) query.set("cursor", String(cursor));
  if (ownerUserId) query.set("owner_user_id", ownerUserId);
  const page = (await requestJson<WorkPage>(mainApiBaseUrl, "GET", `/works/search?${query.toString()}`)).data;
  return {...page,items:[...page.items].sort((left, right) => (left.search_rank ?? Number.MAX_SAFE_INTEGER) - (right.search_rank ?? Number.MAX_SAFE_INTEGER))};
}
function cursorSuffix(cursor?:string){return cursor?`?before=${encodeURIComponent(cursor)}`:"";}
export async function getMyWorks(cursor?:string): Promise<WorkPage> { return (await requestJson<WorkPage>(mainApiBaseUrl,"GET",`/works/me${cursorSuffix(cursor)}`)).data; }
export async function getUserWorks(userId:string,cursor?:string): Promise<WorkPage> { return (await requestJson<WorkPage>(mainApiBaseUrl,"GET",`/works/users/${userId}${cursorSuffix(cursor)}`)).data; }
export async function getLikedWorks(cursor?:string): Promise<WorkPage> { return (await requestJson<WorkPage>(mainApiBaseUrl,"GET",`/works/likes${cursorSuffix(cursor)}`)).data; }
export async function getSavedWorks(cursor?:string): Promise<WorkPage> { return (await requestJson<WorkPage>(mainApiBaseUrl,"GET",`/works/saves${cursorSuffix(cursor)}`)).data; }
export async function getWorkTypes(): Promise<WorkType[]> { return (await requestJson<WorkType[]>(mainApiBaseUrl, "GET", "/works/types")).data; }
export async function uploadWork(input: {typeId:string; title:string; description:string; links:{label:string;url:string}[]; file:File}): Promise<void> {
  if (validateWorkFile(input.file) !== null) throw new Error("Invalid work file");
  const links=input.links.filter(link=>link.url.trim()).map(link=>({url:link.url.trim(),label:link.label.trim()||null}));
  if(links.length>10||links.some(link=>!isValidWorkUrl(link.url))||new Set(links.map(link=>link.url)).size!==links.length)throw new Error("Invalid work links");
  const prepared = (await requestJson<{work_id:string; upload_url:string; upload_token:string}>(mainApiBaseUrl, "POST", "/works/uploads", {body:{type_id:input.typeId,title:input.title,description:input.description,links,file_name:input.file.name,mime_type:input.file.type,file_size:input.file.size}})).data;
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", input.file);
  const uploaded = await fetch(prepared.upload_url, {method:"PUT", headers:{"x-upsert":"false"}, body});
  if (!uploaded.ok) throw new Error("Upload failed");
  await requestJson<null>(mainApiBaseUrl, "POST", `/works/${prepared.work_id}/publish`);
}
export async function setWorkLike(id:string, liked:boolean):Promise<void> { await requestJson<null>(mainApiBaseUrl, liked ? "PUT" : "DELETE", `/works/${id}/like`); }
export async function setWorkSave(id:string, saved:boolean):Promise<void> { await requestJson<null>(mainApiBaseUrl, saved ? "PUT" : "DELETE", `/works/${id}/save`); }
export async function updateWork(id:string,input:{typeId:string;title:string;description:string;links:WorkLink[]}):Promise<void>{
  const links=input.links.filter(link=>link.url.trim()).map(link=>({url:link.url.trim(),label:link.label?.trim()||null}));
  if(links.length>10||links.some(link=>!isValidWorkUrl(link.url))||new Set(links.map(link=>link.url)).size!==links.length)throw new Error("Invalid work links");
  await requestJson<null>(mainApiBaseUrl,"PATCH",`/works/${id}`,{body:{type_id:input.typeId,title:input.title.trim(),description:input.description.trim(),links}});
}
export async function deleteWork(id:string):Promise<void>{await requestJson<null>(mainApiBaseUrl,"DELETE",`/works/${id}`);}
