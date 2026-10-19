import { useEffect, useLayoutEffect, useRef } from "react";

/** Only mounted/open lists subscribe; hidden tabs defer one refresh until visible. */
export function useExhibitionLive(id:string|undefined,refresh:()=>void,enabled=true){
  const latest=useRef(refresh);
  useLayoutEffect(()=>{latest.current=refresh;});
  useEffect(()=>{
    if(!enabled||!id)return;
    let timer=0;let dirty=false;
    const update=(event:Event)=>{
      const changed=(event as CustomEvent<{exhibition_id?:string}>).detail?.exhibition_id;
      if(changed&&changed!==id)return;
      dirty=true;window.clearTimeout(timer);
      if(!document.hidden)timer=window.setTimeout(()=>{dirty=false;latest.current();},200);
    };
    const visible=()=>{if(dirty&&!document.hidden)update(new Event("refresh"));};
    window.addEventListener("inkfig:exhibitions-changed",update);document.addEventListener("visibilitychange",visible);
    return()=>{window.clearTimeout(timer);window.removeEventListener("inkfig:exhibitions-changed",update);document.removeEventListener("visibilitychange",visible);};
  },[id,enabled]);
}
