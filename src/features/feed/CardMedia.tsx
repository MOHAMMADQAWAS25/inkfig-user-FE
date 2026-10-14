import { useState, type ReactNode } from "react";

/** Pointer reactions must not pin hover overlays; keyboard focus still reveals them. */
export function CardMedia({ children }: { children: ReactNode }) {
  const [focusMode, setFocusMode] = useState<"pointer" | "keyboard">("keyboard");
  return <div className="artwork-pin-media" data-focus-mode={focusMode}
    onPointerDownCapture={()=>setFocusMode("pointer")}
    onKeyDownCapture={()=>setFocusMode("keyboard")}
    onPointerLeave={event=>{
      if(focusMode==="pointer" && document.activeElement instanceof HTMLElement && event.currentTarget.contains(document.activeElement)) document.activeElement.blur();
    }}>{children}</div>;
}
