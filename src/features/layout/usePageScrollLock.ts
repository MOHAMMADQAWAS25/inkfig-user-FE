import { useLayoutEffect } from "react";

let locks = 0;
let restore: (() => void) | undefined;

export function usePageScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    locks += 1;
    if (locks > 1) return () => { if (--locks === 0) { restore?.(); restore = undefined; } };
    const y = window.scrollY;
    const body = document.body;
    const saved = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const rootOverflow = document.documentElement.style.overflow;
    const mobile = window.matchMedia?.("(max-width: 720px)").matches ?? false;
    const rootOverscroll = document.documentElement.style.overscrollBehavior;
    if (mobile) {
      body.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
    } else Object.assign(body.style, { overflow: "hidden", position: "fixed", top: `-${y}px`, width: "100%" });
    document.documentElement.style.overflow = "hidden";
    let touchY = 0;
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const touchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const nextY = event.touches[0].clientY, delta = nextY - touchY;
      touchY = nextY;
      let element = event.target instanceof Element ? event.target : null;
      while (element && element !== body && element !== document.documentElement) {
        const style = getComputedStyle(element);
        if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight
          && ((delta < 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) || (delta > 0 && element.scrollTop > 0))) return;
        element = element.parentElement;
      }
      event.preventDefault();
    };
    if (mobile) {
      document.addEventListener("touchstart", touchStart, { passive: true, capture: true });
      document.addEventListener("touchmove", touchMove, { passive: false, capture: true });
    }
    restore = () => {
      document.removeEventListener("touchstart", touchStart, true);
      document.removeEventListener("touchmove", touchMove, true);
      Object.assign(body.style, saved);
      document.documentElement.style.overflow = rootOverflow;
      document.documentElement.style.overscrollBehavior = rootOverscroll;
      if (!mobile || window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" });
    };
    return () => { if (--locks === 0) { restore?.(); restore = undefined; } };
  }, [active]);
}
