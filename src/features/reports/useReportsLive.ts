import { useEffect, useLayoutEffect, useRef } from "react";

/** Full lists subscribe only while mounted; bursts/hidden tabs collapse to one refresh. */
export function useReportsLive(refresh: () => void, enabled: boolean) {
  const latest = useRef(refresh);
  useLayoutEffect(() => { latest.current = refresh; });
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let dirty = false;
    const update = () => {
      dirty = true;
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(() => { dirty = false; latest.current(); }, 200);
    };
    const visible = () => { if (dirty && !document.hidden) update(); };
    window.addEventListener("inkfig:reports-changed", update);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("inkfig:reports-changed", update);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [enabled]);
}
