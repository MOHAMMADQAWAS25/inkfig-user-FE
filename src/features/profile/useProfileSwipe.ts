import { useRef, type TouchEvent, type MouseEvent } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";

type Section = "posts" | "saved" | "likes";
const sections: Section[] = ["posts", "saved", "likes"];

export function useProfileSwipe(enabled: boolean, section: Section, select: (section: Section) => void) {
  const mobile = useMobileViewport();
  const start = useRef<{ x: number; y: number } | null>(null);
  const suppressUntil = useRef(0);
  return {
    onTouchStart(event: TouchEvent) {
      start.current = enabled && mobile && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    },
    onTouchMove(event: TouchEvent) { if (event.touches.length !== 1) start.current = null; },
    onTouchCancel() { start.current = null; },
    onTouchEnd(event: TouchEvent) {
      const origin = start.current;
      start.current = null;
      if (!origin || event.touches.length || event.changedTouches.length !== 1) return;
      const dx = event.changedTouches[0].clientX - origin.x;
      const dy = event.changedTouches[0].clientY - origin.y;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      suppressUntil.current = Date.now() + 450;
      const next = sections[sections.indexOf(section) + (dx < 0 ? 1 : -1)];
      if (next) select(next);
    },
    onClickCapture(event: MouseEvent) {
      if (Date.now() < suppressUntil.current) { event.preventDefault(); event.stopPropagation(); }
    },
  };
}
