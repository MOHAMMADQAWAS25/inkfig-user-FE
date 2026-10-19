import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type NotificationItem={notification_id:string;event_type:"follow"|"like"|"save"|"submission_approved"|"submission_rejected"|"withdrawal_approved"|"withdrawal_rejected";actor_user_id:string;actor_name:string;actor_avatar_url:string|null;work_id:string|null;work_title:string|null;created_at:string;read:boolean;exhibition_id?:string|null;submission_id?:string|null;exhibition_name?:string|null;decision_reason?:string|null};
export type NotificationFeed={items:NotificationItem[];unread_count:number;next_cursor:number|null};
export type WebSocketTicket={ticket:string;websocket_url:string;expires_in:number};

export async function getNotifications(cursor?:number):Promise<NotificationFeed>{const query=new URLSearchParams({limit:"50"});if(cursor!==undefined)query.set("cursor",String(cursor));return (await requestJson<NotificationFeed>(userApiBaseUrl,"GET",`/notifications?${query.toString()}`)).data;}
export async function markNotificationsRead():Promise<void>{await requestJson<null>(userApiBaseUrl,"PUT","/notifications/read");}
export async function getWebSocketTicket():Promise<WebSocketTicket>{return (await requestJson<WebSocketTicket>(userApiBaseUrl,"POST","/notifications/socket-ticket")).data;}
export async function getUnreadNotificationCount(){return (await requestJson<{unread_count:number}>(userApiBaseUrl,"GET","/notifications/unread-count")).data;}

export function notificationTarget(item:NotificationItem,language:string){
  if(item.event_type.startsWith("submission_")||item.event_type.startsWith("withdrawal_"))return item.exhibition_id?`/${language}/exhibition/${item.exhibition_id}/submissions`:`/${language}/exhibition`;
  return item.event_type==="like"&&item.work_id?`/${language}/artwork/${item.work_id}`:`/${language}/profile/${item.actor_user_id}`;
}
