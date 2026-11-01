import type { CSSProperties, ReactNode } from "react";
import { useScrollHeader } from "./useScrollHeader";

/** Keep per-frame mobile movement out of HomePage and its gallery/search tree. */
export function ScrollHeader({ children }: { children: ReactNode }) {
  const progress = useScrollHeader();
  return <header className={`gallery-header${progress >= 1 ? " mobile-header-hidden" : ""}`}
    style={{ "--mobile-header-progress": progress } as CSSProperties}>{children}</header>;
}
