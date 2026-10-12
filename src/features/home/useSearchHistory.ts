import { useEffect, useRef, useState } from "react";
import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type SearchEntry={search_history_id:string;query:string;normalized_query:string;last_searched_at:string};
const guestKey="inkfig:guest-search-history";
export const normalizeSearch=(query:string)=>query.trim().toLowerCase();
export function visibleSearchHistory(items:SearchEntry[],query:string){const normalized=normalizeSearch(query);return normalized?items.filter(item=>item.normalized_query===normalized).slice(0,1):items.slice(0,4);}
function guestHistory():SearchEntry[]{try{const data:unknown=JSON.parse(localStorage.getItem(guestKey)??"[]");return Array.isArray(data)?data.filter((item):item is SearchEntry=>typeof item?.query==="string"&&typeof item?.search_history_id==="string"&&item.query.trim().length>0&&item.query.length<=500).map(item=>({...item,normalized_query:normalizeSearch(item.query)})).slice(0,20):[];}catch{return [];}}
function saveGuest(items:SearchEntry[]){try{localStorage.setItem(guestKey,JSON.stringify(items));}catch{/* Storage may be disabled. */}}

export function useSearchHistory(userId:string|undefined){
 const [items,setItems]=useState<SearchEntry[]>([]);const [loading,setLoading]=useState(false);const [error,setError]=useState(false);
 const owner=useRef(userId);owner.current=userId;const revision=useRef(0);const queue=useRef<Promise<unknown>>(Promise.resolve());
 useEffect(()=>{revision.current+=1;setItems([]);setError(false);setLoading(false);},[userId]);
 async function refresh(){const currentOwner=userId;const version=++revision.current;setLoading(true);setError(false);try{await queue.current;const next=currentOwner?(await requestJson<SearchEntry[]>(userApiBaseUrl,"GET","/search-history")).data:guestHistory();if(owner.current===currentOwner&&revision.current===version)setItems(next);}catch{if(owner.current===currentOwner&&revision.current===version)setError(true);}finally{if(owner.current===currentOwner&&revision.current===version)setLoading(false);}}
 function mutate(action:"record"|"remove"|"clear",value?:string){const currentOwner=userId;const version=++revision.current;setError(false);
  // Hide deleted rows immediately; refresh restores canonical state on failure.
  if(action==="clear")setItems([]);else if(action==="remove")setItems(current=>current.filter(item=>item.search_history_id!==value));
  const operation=queue.current.catch(()=>undefined).then(async()=>{
   if(owner.current!==currentOwner)return;
   let next:SearchEntry[];
   if(currentOwner){if(action==="record")next=(await requestJson<SearchEntry[]>(userApiBaseUrl,"POST","/search-history",{body:{query:value}})).data;else{await requestJson<null>(userApiBaseUrl,"DELETE",action==="clear"?"/search-history":`/search-history/${encodeURIComponent(value!)}`);next=(await requestJson<SearchEntry[]>(userApiBaseUrl,"GET","/search-history")).data;}}
   else{next=guestHistory();if(action==="clear")next=[];else if(action==="remove")next=next.filter(item=>item.search_history_id!==value);else{const query=value!.trim();const normalized_query=normalizeSearch(query);next=[{search_history_id:normalized_query,query,normalized_query,last_searched_at:new Date().toISOString()},...next.filter(item=>item.normalized_query!==normalized_query)].slice(0,20);}saveGuest(next);}
   if(owner.current===currentOwner&&revision.current===version)setItems(next);
  }).catch(()=>{if(owner.current===currentOwner){setError(true);void refresh();}});
  queue.current=operation;
 }
 return {items,loading,error,refresh,record:(query:string)=>{const trimmed=query.trim();if(trimmed&&trimmed.length<=500)mutate("record",trimmed);},remove:(id:string)=>mutate("remove",id),clear:()=>mutate("clear")};
}
