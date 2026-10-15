import { useEffect, useRef } from "react";

/** Consume the entire outside gesture: dismissing a layer must not activate what's behind it. */
export function useDismissOnly(open: boolean, contains: (target: Element) => boolean, dismiss: () => void) {
  const current = useRef({ open, contains, dismiss });
  current.current = { open, contains, dismiss };
  useEffect(() => {
    let swallowClick = false;
    const consume = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
    const outside = (event: Event) => current.current.open && event.target instanceof Element && !current.current.contains(event.target);
    const pointerdown = (event: PointerEvent) => {
      swallowClick = false;
      if (!outside(event)) return;
      swallowClick = true;
      consume(event);
      current.current.dismiss();
    };
    const click = (event: MouseEvent) => {
      if (swallowClick) { swallowClick = false; consume(event); return; }
      // Also covers keyboard/assistive-technology clicks without a preceding pointer event.
      if (outside(event)) { consume(event); current.current.dismiss(); }
    };
    document.addEventListener("pointerdown", pointerdown, true);
    document.addEventListener("click", click, true);
    return () => { document.removeEventListener("pointerdown", pointerdown, true); document.removeEventListener("click", click, true); };
  }, []);
}
