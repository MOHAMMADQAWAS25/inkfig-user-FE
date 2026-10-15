import { useLayoutEffect } from "react";

export function usePageScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    const y = window.scrollY;
    const body = document.body;
    const saved = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const rootOverflow = document.documentElement.style.overflow;
    Object.assign(body.style, { overflow: "hidden", position: "fixed", top: `-${y}px`, width: "100%" });
    document.documentElement.style.overflow = "hidden";
    return () => {
      Object.assign(body.style, saved);
      document.documentElement.style.overflow = rootOverflow;
      window.scrollTo({ top: y, behavior: "instant" });
    };
  }, [active]);
}
