import { useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** A same-URL history entry lets Back close a preview without leaving its gallery. */
export function useExhibitionArtworkNavigation(scope: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const origin = useRef<{ workId: string; rect?: DOMRect } | null>(null);
  const entry = location.state?.exhibitionArtworkPopup;
  const workId = entry?.scope === scope && typeof entry.workId === "string" && entry.workId.length > 0 ? entry.workId as string : null;
  const open = useCallback((id: string, rect?: DOMRect) => {
    origin.current = { workId: id, rect };
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      state: { ...location.state, exhibitionArtworkPopup: { scope, workId: id } },
      replace: Boolean(workId), preventScrollReset: true,
    });
  }, [location.pathname, location.search, location.hash, location.state, navigate, scope, workId]);
  const close = useCallback(() => { if (workId) navigate(-1); }, [navigate, workId]);
  return { workId, origin: origin.current?.workId === workId ? origin.current.rect : undefined, open, close };
}
