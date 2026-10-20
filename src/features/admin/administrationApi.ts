import { requestJson, userApiBaseUrl } from "../../api/httpClient";
import type { AuthSession } from "../../shared/types";

export interface ManagedUser { user_id:string; email:string; full_name:string; role:AuthSession["role"]; is_active:boolean }
export interface ManagedUserPage {items:ManagedUser[];next_cursor:number|null;total:number;summary:{total:number;active:number;administrators:number}}
export type ManagedUserFilters={limit?:number;query?:string;role?:AuthSession["role"];isActive?:boolean};
export async function getManagedUsersPage(cursor=0,filters:ManagedUserFilters={},signal?:AbortSignal){const query=new URLSearchParams({limit:String(filters.limit??10),cursor:String(cursor)});if(filters.query?.trim())query.set("query",filters.query.trim());if(filters.role)query.set("role",filters.role);if(filters.isActive!==undefined)query.set("is_active",String(filters.isActive));return (await requestJson<ManagedUserPage>(userApiBaseUrl,"GET",`/admin/users?${query.toString()}`,{signal})).data;}
export async function setManagedUserRole(userId:string,role:AuthSession["role"]){return (await requestJson<ManagedUser>(userApiBaseUrl,"PATCH",`/admin/users/${userId}/role`,{body:{role}})).data;}
export async function setManagedUserStatus(userId:string,isActive:boolean){return (await requestJson<ManagedUser>(userApiBaseUrl,"PATCH",`/admin/users/${userId}/status`,{body:{is_active:isActive}})).data;}
