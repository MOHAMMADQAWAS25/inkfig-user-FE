import { useEffect, useRef, useState, type ReactNode } from "react";

export function AnimatedPresence({ open, children }: { open: boolean; children: ReactNode }) {
  const [present, setPresent] = useState(open);
  const lastContent = useRef(children);
  if (open) lastContent.current = children;
  useEffect(()=>{
    if(open){setPresent(true);return;}
    const timer=window.setTimeout(()=>setPresent(false),window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?0:180);
    return()=>window.clearTimeout(timer);
  },[open]);
  if(!open&&!present)return null;
  return <div className="animated-presence" data-exiting={!open} aria-hidden={!open||undefined} inert={!open}>{open?children:lastContent.current}</div>;
}
