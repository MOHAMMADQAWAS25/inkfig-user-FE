import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

export type AvatarUpload = { object_path:string; upload_url:string; upload_token:string };

export function isValidProfileAvatar(file: File): boolean {
  return PROFILE_AVATAR_ACCEPT.split(",").includes(file.type) && file.size > 0 && file.size <= PROFILE_AVATAR_MAX_BYTES;
}

export async function putAvatarFile(upload: AvatarUpload, file: File): Promise<void> {
  const response=await fetch(upload.upload_url,{method:"PUT",headers:{"Content-Type":file.type,"x-upsert":"false"},body:file});
  if(!response.ok)throw new Error("Avatar upload failed");
}

export async function uploadProfileAvatar(file:File):Promise<string>{
  const upload=(await requestJson<AvatarUpload>(userApiBaseUrl,"POST","/profiles/avatar-uploads",{body:{file_name:file.name,mime_type:file.type,file_size:file.size}})).data;
  await putAvatarFile(upload,file);
  return (await requestJson<{avatar_url:string}>(userApiBaseUrl,"POST","/profiles/avatar-uploads/complete",{body:{object_path:upload.object_path}})).data.avatar_url;
}
