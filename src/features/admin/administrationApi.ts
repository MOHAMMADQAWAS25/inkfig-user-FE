import { requestJson, userApiBaseUrl } from "../../api/httpClient";
import type { AuthSession } from "../../shared/types";

export interface ManagedUser { user_id:string; email:string; full_name:string; role:AuthSession["role"]; is_active:boolean }
export interface ManagedUserPage {items:ManagedUser[];next_cursor:number|null}
export async function getManagedUsersPage(cursor?:number){const query=new URLSearchParams({limit:"100"});if(cursor!==undefined)query.set("cursor",String(cursor));return (await requestJson<ManagedUserPage>(userApiBaseUrl,"GET",`/admin/users?${query.toString()}`)).data;}
export async function getManagedUsers(){const users:ManagedUser[]=[];let cursor:number|undefined;do{const page=await getManagedUsersPage(cursor);users.push(...page.items);cursor=page.next_cursor??undefined;}while(cursor!==undefined);return users;}
export async function setManagedUserRole(userId:string,role:AuthSession["role"]){return (await requestJson<ManagedUser>(userApiBaseUrl,"PATCH",`/admin/users/${userId}/role`,{body:{role}})).data;}
export async function setManagedUserStatus(userId:string,isActive:boolean){return (await requestJson<ManagedUser>(userApiBaseUrl,"PATCH",`/admin/users/${userId}/status`,{body:{is_active:isActive}})).data;}
