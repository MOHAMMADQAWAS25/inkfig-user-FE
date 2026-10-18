import { useRef, useState, type CSSProperties, type TouchEvent, type MouseEvent } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";

type Section = "posts" | "saved" | "likes";
const sections: Section[] = ["posts", "saved", "likes"];

export function useProfileSwipe(enabled: boolean, section: Section, select: (section: Section) => void) {
  const mobile = useMobileViewport();
  const start = useRef<{ x: number; y: number; width: number; axis: "pending" | "horizontal" | "vertical" } | null>(null);
  const [drag, setDrag] = useState(0);
  const suppressUntil = useRef(0);
  return {
    style: { "--profile-drag": `${drag}px`, "--profile-index": sections.indexOf(section) } as CSSProperties,
    "data-dragging": drag !== 0 || undefined,
    onTouchStart(event: TouchEvent) {
      suppressUntil.current = 0;
      const control = (event.target as Element).closest?.('a, input, textarea, summary, button:not(.artwork-image-button), video[controls]');
      start.current = enabled && mobile && !control && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, width: event.currentTarget.getBoundingClientRect().width || 360, axis: "pending" } : null;
    },
    onTouchMove(event: TouchEvent) {
      if (event.touches.length !== 1) { start.current = null; setDrag(0); return; }
      const origin = start.current; if (!origin) return;
      const dx = event.touches[0].clientX - origin.x, dy = event.touches[0].clientY - origin.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) suppressUntil.current = Date.now() + 450;
      if (origin.axis === "pending" && Math.max(Math.abs(dx), Math.abs(dy)) > 8) origin.axis = Math.abs(dx) > Math.abs(dy) * 1.25 ? "horizontal" : "vertical";
      if (origin.axis !== "horizontal") return;
      const edge = (section === "posts" && dx > 0) || (section === "likes" && dx < 0);
      setDrag(Math.max(-origin.width, Math.min(origin.width, dx * (edge ? .2 : 1))));
    },
    onTouchCancel() { start.current = null; setDrag(0); },
    onTouchEnd(event: TouchEvent) {
      const origin = start.current;
      start.current = null;
      setDrag(0);
      if (!origin || event.touches.length || event.changedTouches.length !== 1) return;
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
