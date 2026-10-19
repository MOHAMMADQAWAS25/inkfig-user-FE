import { useCallback, useEffect, useRef, useState } from "react";
import { getNotifications, getUnreadNotificationCount, markNotificationsRead, type NotificationItem } from "./notificationApi";

/** Closed panels fetch counts only. In-flight responses are scoped to account + panel lifetime. */
export function useNotificationInbox(userId: string | undefined, open: boolean) {
  const [items,setItems]=useState<NotificationItem[]>([]);
  const [unread,setUnread]=useState(0);
  const [cursor,setCursor]=useState<number|null>(null);
  const [loading,setLoading]=useState(false);
  const [loadingMore,setLoadingMore]=useState(false);
  const generation=useRef(0);
  const moreLock=useRef(false);
  const refreshing=useRef(false);
  const epoch=useRef(0);
  const visiblePages=useRef(1);
  useEffect(()=>{
    const token=++generation.current;let active=true;let timer=0;let running=false;let queued=false;let dirty=false;
    setItems([]);setCursor(null);setLoading(Boolean(open&&userId));setLoadingMore(false);moreLock.current=false;refreshing.current=false;visiblePages.current=1;
    if(!userId){setUnread(0);return;}
    const valid=()=>active&&generation.current===token;
    async function load(){
      if(!valid())return;
      if(document.hidden){dirty=true;return;}
      if(running){queued=true;return;}
      running=true;
      refreshing.current=true;++epoch.current;moreLock.current=false;setLoadingMore(false);
      try{
        if(open){
          const page=await getNotifications();
          let all=page.items;let next=page.next_cursor;
          for(let index=1;index<visiblePages.current&&next!==null;index++){
            if(!valid()||document.hidden)break;
            const following=await getNotifications(next);all=[...all,...following.items];next=following.next_cursor;
          }
          if(!valid())return;
          if(document.hidden){dirty=true;return;}
          setItems([...new Map(all.map(item=>[item.notification_id,item])).values()]);setCursor(next);setUnread(page.unread_count);
          if(page.unread_count>0){await markNotificationsRead();if(valid())setUnread(0);}
        }else{
          const count=await getUnreadNotificationCount();if(valid())setUnread(count.unread_count);
        }
      }catch{/* Keep saved notifications authoritative; reopening/reconnecting retries. */}
      finally{running=false;if(valid()){refreshing.current=false;setLoading(false);if(queued){queued=false;void load();}}}
    }
    const schedule=()=>{dirty=true;window.clearTimeout(timer);if(!document.hidden)timer=window.setTimeout(()=>{dirty=false;void load();},150);};
    const visible=()=>{if(dirty&&!document.hidden)schedule();};
    void load();window.addEventListener("inkfig:notifications-changed",schedule);document.addEventListener("visibilitychange",visible);
    return()=>{active=false;++generation.current;window.clearTimeout(timer);window.removeEventListener("inkfig:notifications-changed",schedule);document.removeEventListener("visibilitychange",visible);};
  },[userId,open]);
  const more=useCallback(async()=>{
    if(!userId||!open||cursor===null||moreLock.current||refreshing.current)return;
    const token=generation.current;const version=epoch.current;moreLock.current=true;setLoadingMore(true);
    try{
      const page=await getNotifications(cursor);
      if(generation.current!==token||epoch.current!==version)return;
      visiblePages.current++;
      setItems(current=>[...new Map([...current,...page.items].map(item=>[item.notification_id,item])).values()]);setCursor(page.next_cursor);
    }catch{/* Retry using the same continuation. */}
    finally{if(generation.current===token&&epoch.current===version){moreLock.current=false;setLoadingMore(false);}}
  },[userId,open,cursor]);
  return {items,unread,cursor,loading,loadingMore,more};
}
