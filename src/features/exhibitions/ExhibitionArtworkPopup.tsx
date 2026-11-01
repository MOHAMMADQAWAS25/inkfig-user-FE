import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { ApiError } from "../../api/httpClient";
import { useAuth } from "../auth/AuthContext";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { getWork, setWorkLike, setWorkSave, type Work } from "../works/worksApi";
import { updateArtworkCache } from "../works/updateArtworkCache";
import { ExhibitionRatingControls } from "./ExhibitionRatingControls";
import type { RatingState } from "./exhibitionRatingTypes";

export function ExhibitionArtworkPopup({ workId, onClose, exhibitionId, rating, votingOpen = false }: { workId: string; onClose: () => void; exhibitionId?: string; rating?: RatingState; votingOpen?: boolean }) {
  const { session } = useAuth(); const { language, t } = useI18n(); const client = useQueryClient();
  const dialog = useRef<HTMLDialogElement>(null); const close = useRef<HTMLButtonElement>(null);
  const active = useRef(true); const pending = useRef(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const query = useQuery({ queryKey: ["artwork-detail", session?.userId ?? "guest", workId], queryFn: ({ signal }) => getWork(workId, signal), staleTime: 0, retry: false });
  usePageScrollLock(true);
  useLayoutEffect(() => {
    active.current = true;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialog.current; node?.showModal(); close.current?.focus({preventScroll:true});
    return () => { active.current = false; node?.close(); if (previous?.isConnected) previous.focus({preventScroll:true}); };
  }, []);
  const can = (permission: string) => Boolean(session && hasPermission(session.permissions, permission));
  async function interact(work: Work, kind: "like" | "save") {
    if (pending.current || !can(kind === "like" ? "works.like" : "works.save")) return;
    pending.current = true; setBusy(true); setError("");
    try {
      if (kind === "like") await setWorkLike(work.work_id, !work.liked_by_me);
      else await setWorkSave(work.work_id, !work.saved_by_me);
      if (!active.current) return;
      const fresh = await query.refetch();
      if (active.current && fresh.data && !fresh.isError) updateArtworkCache(client, fresh.data);
      else if (active.current) setError(t("artwork.actionFailed"));
    } catch { if (active.current) setError(t("artwork.actionFailed")); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  }
  return createPortal(<dialog ref={dialog} className="exhibition-artwork-popup" aria-label={query.data?.title ?? t("works.viewDetails")} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose(); }}>
    {query.data && !query.isError ? <ArtworkDetailModal containedInDialog interactionBusy={busy} language={language} work={query.data} canLike={can("works.like")} canSave={can("works.save")}
      canReport={can("reports.create") && query.data.owner_user_id !== session?.userId} onClose={onClose} onToggleLike={work => void interact(work,"like")} onToggleSave={work => void interact(work,"save")} t={t}
      mediaFooter={exhibitionId ? <ExhibitionRatingControls key={`${exhibitionId}:${workId}`} exhibitionId={exhibitionId} workId={workId} rating={rating} votingOpen={votingOpen}/> : undefined}
      extraDetails={error ? <p className="error-message" role="alert">{error}</p> : undefined}/> :
      <div className="artwork-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="artwork-modal exhibition-artwork-popup-state">
          <button ref={close} className="artwork-modal-close" type="button" aria-label={t("works.closeDetails")} onClick={onClose}><X size={22}/></button>
          <h2>{t("works.viewDetails")}</h2>
          {query.isPending ? <p role="status">{t("works.loading")}</p> : <><p role="alert">{t(query.error instanceof ApiError && query.error.status === 404 ? "artwork.unavailable" : "works.loadFailed")}</p><button type="button" onClick={() => void query.refetch()}>{t("feed.retry")}</button></>}
        </section>
      </div>}
  </dialog>, document.body);
}
