import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function ExhibitionNavbar({ children, label }: { children: ReactNode; label?: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [geometry, setGeometry] = useState({ left: 0, width: 0, height: 76 });
  useLayoutEffect(() => {
    const measure = () => {
      const rect = slot.current?.getBoundingClientRect();
      if (!rect) return;
      const height = bar.current?.getBoundingClientRect().height || 76;
      setGeometry(previous => previous.left === rect.left && previous.width === rect.width && previous.height === height ? previous : { left: rect.left, width: rect.width, height });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (slot.current) observer?.observe(slot.current);
    if (bar.current) observer?.observe(bar.current);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  return <div ref={slot} className="exhibition-toolbar-slot" style={{ height: geometry.height }}>
    <nav ref={bar} className="exhibition-toolbar" aria-label={label} style={geometry.width ? { left: geometry.left, width: geometry.width } : undefined}>{children}</nav>
  </div>;
}
