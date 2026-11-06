import { useEffect } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";

/** The phone header stays visible. Only keyboard-dismiss focus needs tracking. */
export function useScrollHeader() {
  const mobile = useMobileViewport();
  useEffect(() => {
    if (!mobile) return;
    const viewport = window.visualViewport;
    let viewportHeight = viewport?.height ?? window.innerHeight;
    const keyboardResize = () => {
      const height = viewport?.height ?? window.innerHeight;
      if (height - viewportHeight > 100 && document.activeElement instanceof HTMLInputElement && document.activeElement.closest(".gallery-header")) document.activeElement.blur();
      viewportHeight = height;
    };
    viewport?.addEventListener("resize", keyboardResize);
    return () => viewport?.removeEventListener("resize", keyboardResize);
  }, [mobile]);
  return 0;
}
