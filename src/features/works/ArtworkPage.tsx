import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, CalendarDays, Copy, Flag, Heart, Pencil, Share2, Trash2 } from "lucide-react";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { ApiError } from "../../api/httpClient";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { AppSidebar } from "../navigation/AppSidebar";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { ArtworkPageMedia } from "./ArtworkPageMedia";
import { Feed } from "../feed/Feed";
import { PostCard } from "../feed/PostCard";
import { ReportDialog } from "../reports/ReportDialog";
import { getPublicProfile, setProfileFollow } from "../profile/profileApi";
import { deleteWork, deleteWorkAsModerator, getWork, setWorkLike, setWorkSave, type FeedWork } from "./worksApi";
import { useRelatedArtworks } from "./useRelatedArtworks";
import { artworkPath, safeArtworkReturn } from "./artworkNavigation";
import { updateArtworkCache } from "./updateArtworkCache";
import "./artworkPage.css";

export function ArtworkPage() {
  const { workId = "" } = useParams();
  const { session } = useAuth(); const { language, t } = useI18n();
  const location = useLocation(); const navigate = useNavigate(); const client = useQueryClient();
  const viewer = session?.userId ?? "guest";
  const query = useQuery({ queryKey: ["artwork-detail", viewer, workId], queryFn: ({ signal }) => getWork(workId, signal), retry: false, staleTime: 0 });
  const work = query.data;
  const related = useRelatedArtworks(workId, viewer, Boolean(work));
  const creator = useQuery({ queryKey: ["artwork-creator", viewer, work?.owner_user_id], enabled: Boolean(session && work),
    queryFn: () => getPublicProfile(work!.owner_user_id), retry: false });
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [reporting, setReporting] = useState(false); const [moderating, setModerating] = useState(false);
  const [reason, setReason] = useState(""); const [deleting, setDeleting] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const requests = useRef(new Set<string>());
  const moderationForm = useRef<HTMLFormElement>(null);
  usePageScrollLock(moderating);
  useEffect(() => {
    if (!moderating) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    moderationForm.current?.querySelector("textarea")?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) { event.preventDefault(); setModerating(false); }
      if (event.key !== "Tab") return;
      const controls = Array.from(moderationForm.current?.querySelectorAll<HTMLElement>("textarea:not(:disabled),button:not(:disabled)") ?? []);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); previous?.focus(); };
  }, [moderating, deleting]);
  useEffect(() => { setNotice(""); setError(""); setModerating(false); setReporting(false); }, [workId]);
  const can = (permission: string) => Boolean(session && hasPermission(session.permissions, permission));
  const own = Boolean(work && session?.userId === work.owner_user_id);
  const returnTo = safeArtworkReturn(location.state?.returnTo, `/${language}`);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [workId]);
  useEffect(() => { if (work) document.title = `${work.title} | InkFig`; }, [work?.title]);
  const openWork = useCallback((item: FeedWork) => navigate(artworkPath(language, item.work_id), { state: { returnTo: location.pathname + location.search } }), [language, navigate, location.pathname, location.search]);
  const interact = useCallback(async (item: FeedWork, kind: "like" | "save") => {
    const permission = kind === "like" ? "works.like" : "works.save";
    const key = `${kind}:${item.work_id}`;
    if (!session || !hasPermission(session.permissions, permission) || requests.current.has(key)) return;
    requests.current.add(key); setError("");
    const next = kind === "like" ? !item.liked_by_me : !item.saved_by_me;
    const updated = kind === "like" ? { ...item, liked_by_me: next, like_count: Math.max(0, item.like_count + (next ? 1 : -1)) } : { ...item, saved_by_me: next };
    updateArtworkCache(client, updated);
    try { if (kind === "like") await setWorkLike(item.work_id, next); else await setWorkSave(item.work_id, next); }
    catch { updateArtworkCache(client, item); setError(t("artwork.actionFailed")); }
    finally { requests.current.delete(key); }
  }, [client, session, t]);
  const like = useCallback((item: FeedWork) => { void interact(item, "like"); }, [interact]);
  const save = useCallback((item: FeedWork) => { void interact(item, "save"); }, [interact]);
  const renderCard = useCallback((item: FeedWork, width: number, priority: boolean) => <PostCard work={item} width={width} priority={priority} onOpen={openWork} onLike={like} onSave={save} />, [openWork, like, save]);
  const loadMore = useCallback(() => { if (!related.isFetching && related.hasNextPage) void related.fetchNextPage(); }, [related.isFetching, related.hasNextPage, related.fetchNextPage]);
  async function follow() {
    if (!work || !creator.data || followBusy) return;
    setFollowBusy(true); setError("");
    try { await setProfileFollow(work.owner_user_id, !creator.data.is_following); await creator.refetch(); }
    catch { setError(t("artwork.actionFailed")); } finally { setFollowBusy(false); }
  }
  async function share(copyOnly = false) {
    if (!work) return;
    const url = new URL(artworkPath(language, work.work_id), window.location.origin).href;
    try {
      if (!copyOnly && navigator.share) await navigator.share({ title: work.title, url });
      else { await navigator.clipboard.writeText(url); setNotice(t("artwork.linkCopied")); }
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(t("artwork.shareFailed")); }
  }
  async function remove(moderator = false) {
    if (!work || deleting || (moderator && reason.trim().length < 10)) return;
    if (!moderator && !window.confirm(t("works.deleteConfirm"))) return;
    setDeleting(true); setError("");
    try {
      if (moderator) await deleteWorkAsModerator(work.work_id, reason.trim()); else await deleteWork(work.work_id);
      updateArtworkCache(client, work, true); navigate(returnTo, { replace: true });
    } catch { setError(t("artwork.actionFailed")); setDeleting(false); }
  }
  const back = () => location.state?.returnTo && returnTo === location.state.returnTo ? navigate(-1) : navigate(returnTo);
  return <main className="artwork-page app-page-with-sidebar"><AppSidebar /><div className="artwork-page-shell">
    <button className="artwork-page-back" type="button" onClick={back}><ArrowLeft size={18} />{t("artwork.back")}</button>
    {query.isPending ? <div className="artwork-page-skeleton" role="status">{t("works.loading")}</div> : !work || query.error ? <section className="artwork-page-unavailable" role="status"><h1>{t(query.error instanceof ApiError && query.error.status === 404 ? "artwork.unavailable" : "works.loadFailed")}</h1><button type="button" onClick={() => void query.refetch()}>{t("feed.retry")}</button><Link to={`/${language}`}>{t("artwork.home")}</Link></section> : <>
      <article className="artwork-page-hero">
        <ArtworkPageMedia url={work.image_url} title={work.title} mimeType={work.mime_type} failureLabel={t("feed.imageFailed")} />
        <section className="artwork-page-info" aria-labelledby="artwork-title">
          <div className="artwork-page-creator"><Link to={`/${language}/profile/${work.owner_user_id}`}>
            <ProfileAvatar name={work.artist_name} url={work.artist_avatar_url} language={language} className="artwork-creator-initial"/><strong>{work.artist_name}</strong></Link>
            {!own && session && creator.data && <button disabled={followBusy} type="button" onClick={() => void follow()}>{t(creator.data.is_following ? "profile.unfollow" : "profile.follow")}</button>}
          </div>
          <h1 id="artwork-title">{work.title}</h1>
          <span className="artwork-page-category">{language === "ar" ? work.type_name_ar : work.type_name_en}</span>
          <p className="artwork-page-description">{work.description || t("works.noDescription")}</p>
          <div className="artwork-page-date"><CalendarDays size={20} /><span>{t("artwork.created")}<time dateTime={work.created_at} title={new Date(work.created_at).toLocaleString(language)}>{new Date(work.created_at).toLocaleDateString(language, { year: "numeric", month: "short", day: "numeric" })}</time></span></div>
          {work.links.length > 0 && <div className="artwork-page-links">{work.links.map((link, index) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label || `${t("works.openLink")} ${index + 1}`}</a>)}</div>}
          <div className="artwork-page-actions"><button type="button" disabled={!can("works.like")} aria-pressed={work.liked_by_me} onClick={() => like(work)}><Heart size={22} fill={work.liked_by_me ? "currentColor" : "none"} />{work.like_count} {t("home.likes")}</button><button type="button" disabled={!can("works.save")} aria-pressed={work.saved_by_me} onClick={() => save(work)}><Bookmark size={22} fill={work.saved_by_me ? "currentColor" : "none"} />{t(work.saved_by_me ? "home.unsaveWork" : "home.saveWork")}</button></div>
          <div className="artwork-page-share"><button type="button" onClick={() => void share(true)}><Copy size={19} />{t("artwork.copyLink")}</button><button type="button" onClick={() => void share()}><Share2 size={19} />{t("artwork.share")}</button></div>
          <div className="artwork-page-manage">
            {own && can("works.upload") && <><Link to={`/${language}/profile?edit=${encodeURIComponent(work.work_id)}`}><Pencil size={16} />{t("works.editPost")}</Link><button type="button" disabled={deleting} onClick={() => void remove()}><Trash2 size={16} />{t("works.deletePost")}</button></>}
            {!own && can("reports.create") && <button type="button" onClick={() => setReporting(true)}><Flag size={16} />{t("reports.reportWork")}</button>}
            {can("works.delete_any") && <button type="button" onClick={() => setModerating(true)}><Trash2 size={16} />{t("works.moderateDelete")}</button>}
          </div>
        </section>
      </article>
      {error && <p role="alert" className="error-message">{error}</p>}{notice && <p role="status">{notice}</p>}
      <section className="artwork-page-related" aria-labelledby="related-artworks-title"><h2 id="related-artworks-title">{t("artwork.related")}</h2>
        <Feed key={workId} cacheKey={`related:${viewer}:${workId}`} restoreScroll={false} items={related.items} loading={related.isPending} loadingMore={related.isFetchingNextPage} error={related.error} hasNextPage={Boolean(related.hasNextPage)} loadMore={loadMore} retry={() => { if (related.items.length) loadMore(); else void related.refetch(); }} emptyMessage={t("artwork.noRelated")} renderItem={renderCard} />
      </section>
      {reporting && <ReportDialog targetType="work" targetUserId={work.owner_user_id} targetWorkId={work.work_id} onClose={() => setReporting(false)} t={t} />}
      {moderating && <div className="moderation-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !deleting) setModerating(false); }}><form ref={moderationForm} className="moderation-dialog" role="dialog" aria-modal="true" aria-label={t("works.moderateDelete")} onSubmit={event => { event.preventDefault(); void remove(true); }}><h2>{t("works.moderateDelete")}</h2><label>{t("works.deletionReason")}<textarea autoFocus required minLength={10} maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></label><button type="button" disabled={deleting} onClick={() => setModerating(false)}>{t("works.cancelModeration")}</button><button type="submit" disabled={deleting || reason.trim().length < 10}>{t("works.confirmModerateDelete")}</button>{error && <p role="alert">{error}</p>}</form></div>}
    </>}
  </div></main>;
}
