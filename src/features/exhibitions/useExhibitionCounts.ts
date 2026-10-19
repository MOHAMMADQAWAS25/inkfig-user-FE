import { useEffect } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { getExhibitionCounts } from "./exhibitionApi";

type Subscription={users:number;timer:number;update:()=>void};
const subscriptions=new WeakMap<QueryClient,Map<string,Subscription>>();

export function useExhibitionCounts(){
  const {session}=useAuth();
  const enabled=Boolean(session&&hasPermission(session.permissions,"exhibitions.manage"));
  const client=useQueryClient();
  useEffect(()=>{
    if(!enabled||!session)return;
    let entries=subscriptions.get(client);
    if(!entries){entries=new Map();subscriptions.set(client,entries);}
    const userId=session.userId;
    let subscription=entries.get(userId);
    if(!subscription){
      const entry:Subscription={users:0,timer:0,update:()=>{
        window.clearTimeout(entry.timer);
        entry.timer=window.setTimeout(()=>void client.invalidateQueries({queryKey:["exhibition-counts",userId]},{cancelRefetch:false}),150);
      }};
      subscription=entry;entries.set(userId,entry);window.addEventListener("inkfig:exhibitions-changed",entry.update);
    }
    subscription.users++;
    return()=>{
      subscription.users--;
      if(!subscription.users){window.clearTimeout(subscription.timer);window.removeEventListener("inkfig:exhibitions-changed",subscription.update);entries.delete(userId);}
    };
  },[enabled,session?.userId,client]);
  const query=useQuery({queryKey:["exhibition-counts",session?.userId],queryFn:getExhibitionCounts,enabled,staleTime:30_000,retry:false,refetchOnWindowFocus:false});
  return enabled?query.data:undefined;
}
