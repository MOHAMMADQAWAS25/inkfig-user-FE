import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type NotificationItem={notification_id:string;event_type:"follow"|"like"|"save";actor_user_id:string;actor_name:string;actor_avatar_url:string|null;work_id:string|null;created_at:string;read:boolean};
export type NotificationFeed={items:NotificationItem[];unread_count:number};
export type WebSocketTicket={ticket:string;websocket_url:string;expires_in:number};

export async function getNotifications():Promise<NotificationFeed>{return (await requestJson<NotificationFeed>(userApiBaseUrl,"GET","/notifications?limit=50")).data;}
export async function markNotificationsRead():Promise<void>{await requestJson<null>(userApiBaseUrl,"PUT","/notifications/read");}
export async function getWebSocketTicket():Promise<WebSocketTicket>{return (await requestJson<WebSocketTicket>(userApiBaseUrl,"POST","/notifications/socket-ticket")).data;}
