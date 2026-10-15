import { useEffect, useState } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";

export function useScrollHeader() {
  const mobile = useMobileViewport();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!mobile) { setHidden(false); return; }
    let anchor = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const position = Math.max(0, window.scrollY);
      const interacting = (document.activeElement?.matches("input, textarea") && document.activeElement.closest(".gallery-header")) || document.querySelector(".mobile-drawer-layer");
      if (position < 80 || interacting) { setHidden(false); anchor = position; }
      else if (Math.abs(position - anchor) > 8) { setHidden(position > anchor); anchor = position; }
    };
    const scroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { window.removeEventListener("scroll", scroll); window.cancelAnimationFrame(frame); };
  }, [mobile]);
  return hidden;
}
