import { useEffect, useState } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";

export function useScrollHeader() {
  const mobile = useMobileViewport();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!mobile) { setProgress(0); return; }
    let previous = Math.max(0, window.scrollY);
    let offset = 0;
    let wasLocked = false;
    let frame = 0;
    const update = () => {
      frame = 0;
      const position = Math.max(0, window.scrollY);
      // Fixing/unfixing the body for a drawer is not a user scroll gesture.
      if (document.body.style.position === "fixed") {
        wasLocked = true; previous = position; offset = 0; setProgress(0); return;
      }
      if (wasLocked) { wasLocked = false; previous = position; offset = 0; setProgress(0); return; }
      const interacting = (document.activeElement?.matches("input, textarea") && document.activeElement.closest(".gallery-header")) || document.querySelector('.mobile-drawer-layer, #notifications-panel, #account-discovery-panel');
      offset = position <= 0 || interacting ? 0 : Math.min(1, Math.max(0, offset + (position - previous) / 160));
      previous = position;
      setProgress(offset);
    };
    const scroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { window.removeEventListener("scroll", scroll); window.cancelAnimationFrame(frame); };
  }, [mobile]);
  return progress;
}
