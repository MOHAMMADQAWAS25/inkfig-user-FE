import { requestJson, userApiBaseUrl } from "../../api/httpClient";
import type { AuthSession } from "../../shared/types";

export interface ManagedUser { user_id:string; email:string; full_name:string; role:AuthSession["role"]; is_active:boolean }
export async function getManagedUsers(){return (await requestJson<ManagedUser[]>(userApiBaseUrl,"GET","/admin/users")).data;}
export async function setManagedUserRole(userId:string,role:AuthSession["role"]){return (await requestJson<ManagedUser>(userApiBaseUrl,"PATCH",`/admin/users/${userId}/role`,{body:{role}})).data;}
export async function setManagedUserStatus(userId:string,isActive:boolean){return (await requestJson<ManagedUser>(userApiBaseUrl,"PATCH",`/admin/users/${userId}/status`,{body:{is_active:isActive}})).data;}
