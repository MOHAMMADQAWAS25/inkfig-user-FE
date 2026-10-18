import { useRef, useState, type ReactNode } from "react";

/** Pointer reactions must not pin hover overlays; keyboard focus still reveals them. */
export function CardMedia({ children }: { children: ReactNode }) {
  const [focusMode, setFocusMode] = useState<"pointer" | "keyboard">("keyboard");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  return <div className="artwork-pin-media" data-focus-mode={focusMode}
    onPointerDownCapture={()=>setFocusMode("pointer")}
    onKeyDownCapture={()=>setFocusMode("keyboard")}
    onTouchStart={event=>{
      if (!window.matchMedia?.("(max-width: 720px)").matches) return;
      moved.current = false;
      touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      if (!touch.current) moved.current = true;
    }}
    onTouchMove={event=>{
      if (!touch.current) return;
      if (event.touches.length !== 1 || Math.hypot(event.touches[0].clientX-touch.current.x, event.touches[0].clientY-touch.current.y)>10) moved.current = true;
    }}
    onTouchCancel={()=>{ if(touch.current) moved.current=true; }}
    onClickCapture={event=>{ if(moved.current && window.matchMedia?.("(max-width: 720px)").matches){event.preventDefault();event.stopPropagation();moved.current=false;} }}
    onPointerLeave={event=>{
      if(focusMode==="pointer" && document.activeElement instanceof HTMLElement && event.currentTarget.contains(document.activeElement)) document.activeElement.blur();
    }}>{children}</div>;
}
