import { useLayoutEffect, useRef, useState, type CSSProperties, type TouchEvent, type MouseEvent } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";

type Section = "posts" | "saved" | "likes";
const sections: Section[] = ["posts", "saved", "likes"];

export function useProfileSwipe(enabled: boolean, section: Section, select: (section: Section) => void) {
  const mobile = useMobileViewport();
  const start = useRef<{ x: number; y: number; scrollY: number; width: number; axis: "pending" | "horizontal" | "vertical" } | null>(null);
  const [drag, setDrag] = useState(0);
  const suppressUntil = useRef(0);
  const area = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = area.current;
    if (!enabled || !mobile || !element) return;
    const move = (event: globalThis.TouchEvent) => {
      if (event.touches.length !== 1) { start.current = null; setDrag(0); return; }
      const origin = start.current; if (!origin) return;
      const dx = event.touches[0].clientX - origin.x, dy = event.touches[0].clientY - origin.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) suppressUntil.current = Date.now() + 450;
      // Pick one axis for the entire gesture; ambiguous diagonals remain page scrolls.
      if (origin.axis === "pending" && Math.max(Math.abs(dx), Math.abs(dy)) > 8) origin.axis = Math.abs(dx) > Math.abs(dy) * 1.5 ? "horizontal" : "vertical";
      if (origin.axis !== "horizontal") return;
      if (!event.cancelable) { origin.axis = "vertical"; setDrag(0); return; }
      event.preventDefault();
      if (window.scrollY !== origin.scrollY) window.scrollTo({ top: origin.scrollY, behavior: "instant" });
      const edge = (section === "posts" && dx > 0) || (section === "likes" && dx < 0);
      setDrag(Math.max(-origin.width, Math.min(origin.width, dx * (edge ? .2 : 1))));
    };
    // React's delegated touchmove listener is passive; a native non-passive
    // listener is required to stop vertical panning during a horizontal swipe.
    element.addEventListener("touchmove", move, { passive: false });
    return () => element.removeEventListener("touchmove", move);
  }, [enabled, mobile, section]);
  return {
    ref: area,
    style: { "--profile-drag": `${drag}px`, "--profile-index": sections.indexOf(section) } as CSSProperties,
    "data-dragging": drag !== 0 || undefined,
    onTouchStart(event: TouchEvent) {
      suppressUntil.current = 0;
      const control = (event.target as Element).closest?.('input, textarea, select, [contenteditable="true"], video[controls]');
      start.current = enabled && mobile && !control && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, scrollY: window.scrollY, width: event.currentTarget.getBoundingClientRect().width || 360, axis: "pending" } : null;
    },
    onTouchCancel() { start.current = null; setDrag(0); },
    onTouchEnd(event: TouchEvent) {
      const origin = start.current;
      start.current = null;
      setDrag(0);
      if (!origin || event.touches.length || event.changedTouches.length !== 1) return;
      if (origin.axis === "horizontal" && window.scrollY !== origin.scrollY) window.scrollTo({ top: origin.scrollY, behavior: "instant" });
      const dx = event.changedTouches[0].clientX - origin.x;
      const dy = event.changedTouches[0].clientY - origin.y;
      if (origin.axis === "vertical" || Math.abs(dx) < Math.max(50, Math.min(95, origin.width * .18)) || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      suppressUntil.current = Date.now() + 450;
      const next = sections[sections.indexOf(section) + (dx < 0 ? 1 : -1)];
      if (next) select(next);
    },
    onClickCapture(event: MouseEvent) {
      if (Date.now() < suppressUntil.current) { event.preventDefault(); event.stopPropagation(); }
    },
  };
}
