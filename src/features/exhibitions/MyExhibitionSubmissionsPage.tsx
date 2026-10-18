import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Check, X, Trash2, Ban, Clock3, ChevronRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { AppSidebar } from "../navigation/AppSidebar";
import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { getWork, setWorkLike, setWorkSave, type Work } from "../works/worksApi";
import { ExhibitionBackButton } from "./ExhibitionBackButton";
import { ExhibitionNavbar } from "./ExhibitionNavbar";
import { SubmissionArtist, SubmissionThumbnail } from "./SubmissionIdentity";
import { getExhibition, getSubmissions, reviewSubmission, withdrawSubmission, reviewWithdrawal, blockParticipant, getBlocks, unblockParticipant, type Block, type Exhibition, type Submission } from "./exhibitionApi";

type Status = "all" | "approved" | "pending" | "rejected";
type Action = { item: Submission; kind: "withdraw" | "pendingWithdraw" | "reject" | "block" | "approveWithdrawal" | "rejectWithdrawal" };

function SubmissionRecordsPage({ manage = false }: { manage?: boolean }) {
  const { session } = useAuth();
  const { language, t } = useI18n();
  const { exhibitionId = "" } = useParams();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<Status>("all");
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [workLoading, setWorkLoading] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockCursor, setBlockCursor] = useState<number | null>(null);
  const generation = useRef(0);
  const decision = useRef<HTMLFormElement>(null);
  const canManage = Boolean(session && ["supervisor", "admin", "system_administrator"].includes(session.role));
  const authorized = Boolean(session && (!manage || canManage));
  const scope = manage ? "manage" : "mine";
  const requiredReason = action && ["withdraw", "reject", "block", "rejectWithdrawal"].includes(action.kind);
  const label = (status: string) => t(status === "approved" ? "exhibitions.status.approved" : status === "rejected" ? "exhibitions.status.rejected" : "exhibitions.status.pending");
  const message = (cause: unknown) => cause instanceof Error ? cause.message : t("exhibitions.failed");
  usePageScrollLock(action !== null);
  useEffect(() => {
    if (!authorized) return;
    let active = true;
    getExhibition(exhibitionId).then(item => { if (active) setExhibition(item); }).catch(cause => { if (active) setError(message(cause)); });
    return () => { active = false; };
  }, [exhibitionId, authorized, language]);
  useEffect(() => {
    if (!authorized) return;
    let active = true;
    generation.current += 1;
    setLoading(true); setItems([]); setCursor(null); setError("");
    getSubmissions(exhibitionId, scope, 0, filter === "all" ? undefined : filter).then(page => {
      if (active) { setItems(page.items); setCursor(page.next_cursor); }
    }).catch(cause => { if (active) setError(message(cause)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; generation.current += 1; };
  }, [exhibitionId, scope, filter, revision, authorized, language]);
  useEffect(() => {
    if (!manage || !authorized) return;
    let active = true;
    getBlocks(exhibitionId).then(page => { if (active) { setBlocks(page.items); setBlockCursor(page.next_cursor); } }).catch(cause => { if (active) setError(message(cause)); });
    return () => { active = false; };
  }, [exhibitionId, manage, authorized, revision]);
  useEffect(() => {
    setWork(null);
    if (!selected) return;
    let active = true; setWorkLoading(true);
    getWork(selected.work_id).then(value => { if (active) setWork(value); }).catch(cause => { if (active) { setError(message(cause)); setSelected(null); } }).finally(() => { if (active) setWorkLoading(false); });
    return () => { active = false; };
  }, [selected?.submission_id]);
  useEffect(() => {
    if (!action) return;
    const previous = document.activeElement as HTMLElement | null;
    decision.current?.querySelector<HTMLElement>("textarea,button")?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [action]);
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await task(); setAction(null); setReason(""); setRevision(value => value + 1); setNotice(t("exhibitions.saved")); }
    catch (cause) { setError(message(cause)); }
    finally { setBusy(false); }
  }
  async function more() {
    if (cursor === null || busy || loading) return;
    const current = generation.current;
    setBusy(true); setError("");
    try {
      const page = await getSubmissions(exhibitionId, scope, cursor, filter === "all" ? undefined : filter);
      if (current !== generation.current) return;
      setItems(previous => [...new Map([...previous, ...page.items].map(item => [item.submission_id, item])).values()]); setCursor(page.next_cursor);
    } catch (cause) { if (current === generation.current) setError(message(cause)); }
    finally { setBusy(false); }
  }
  function ask(item: Submission, kind: Action["kind"]) { setReason(""); setError(""); setAction({ item, kind }); }
  async function moreBlocks() {
    if (blockCursor === null || busy) return;
    setBusy(true); setError("");
    try { const page = await getBlocks(exhibitionId, blockCursor); setBlocks(previous => [...new Map([...previous, ...page.items].map(item => [item.user_id, item])).values()]); setBlockCursor(page.next_cursor); }
    catch (cause) { setError(message(cause)); }
    finally { setBusy(false); }
  }
  async function perform() {
    if (!action) return;
    const { item, kind } = action;
    await run(async () => {
      if (kind === "withdraw" || kind === "pendingWithdraw") await withdrawSubmission(exhibitionId, item.submission_id, reason.trim() || undefined);
      else if (kind === "reject") await reviewSubmission(exhibitionId, item.submission_id, "rejected", reason);
      else if (kind === "block") await blockParticipant(exhibitionId, item.user_id, reason);
      else await reviewWithdrawal(exhibitionId, item.submission_id, kind === "approveWithdrawal" ? "approved" : "rejected", reason.trim() || undefined);
    });
  }
  async function toggleLike(target: Work) {
    const next = !target.liked_by_me;
    setWork({ ...target, liked_by_me: next, like_count: target.like_count + (next ? 1 : -1) });
    try { await setWorkLike(target.work_id, next); } catch (cause) { setWork(target); setError(message(cause)); }
  }
  async function toggleSave(target: Work) {
    setWork({ ...target, saved_by_me: !target.saved_by_me });
    try { await setWorkSave(target.work_id, !target.saved_by_me); } catch (cause) { setWork(target); setError(message(cause)); }
  }
  if (!session) return <Navigate replace to={`/${language}/login`}/>;
  if (!authorized) return <Navigate replace to={`/${language}/exhibition/${exhibitionId}`}/>;
  return <main className="exhibitions-page app-page-with-sidebar exhibition-records-page"><AppSidebar/><div className="exhibitions-shell">
    <ExhibitionNavbar label={t("exhibitions.actions")}><ExhibitionBackButton to={`/${language}/exhibition/${exhibitionId}`} label={t("exhibitions.backToExhibition")}/><strong>{t(manage ? "exhibitions.reviewQueue" : "exhibitions.mySubmissions")}</strong></ExhibitionNavbar>
    <header className="exhibition-records-heading"><div><h1>{t(manage ? "exhibitions.reviewQueue" : "exhibitions.mySubmissions")}</h1>{exhibition && <p>{exhibition.name}</p>}</div><label>{t("exhibitions.filterStatus")}<select value={filter} disabled={busy} onChange={event => { setFilter(event.target.value as Status); setSelected(null); }}>{(["all","approved","rejected","pending"] as const).map(status => <option key={status} value={status}>{status === "all" ? t("exhibitions.allStatuses") : label(status)}</option>)}</select></label></header>
    {error && <p className="error-message" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {loading ? <p role="status">{t("exhibitions.loading")}</p> : <section className="exhibition-record-list" aria-label={t(manage ? "exhibitions.reviewQueue" : "exhibitions.mySubmissions")}>
      {!items.length && <p className="exhibition-section-empty">{t("exhibitions.noSubmissions")}</p>}
      {items.map(item => <article className="exhibition-submission-record" data-review={manage} key={item.submission_id}>
        <button className="exhibition-record-open" onClick={() => { setSelected(item); setError(""); }} aria-label={`${t("works.viewDetails")}: ${item.title}`}>
          <SubmissionThumbnail url={item.image_url}/><span className="exhibition-record-info" data-review={manage}><strong>{item.title}</strong>{manage && <SubmissionArtist name={item.artist_name} avatar={item.artist_avatar_url} language={language}/>}<span className={`exhibition-status ${item.status}`}>{label(item.status)}</span>{item.withdrawal_status === "pending" && <small className="exhibition-withdrawal-badge"><Clock3 size={14}/>{t("exhibitions.deletionPending")}</small>}</span><ChevronRight className="exhibition-record-chevron" size={18} aria-hidden="true"/>
        </button>
        <div className="exhibition-record-actions">
          {manage ? <>
            {item.status !== "approved" && <button className="review-approve" disabled={busy} onClick={() => void run(() => reviewSubmission(exhibitionId,item.submission_id,"approved"))}><Check size={16}/>{t("exhibitions.approve")}</button>}
            {item.status !== "rejected" && <button className="review-reject" disabled={busy} onClick={() => ask(item,"reject")}><X size={16}/>{t("exhibitions.reject")}</button>}
            <button className="review-block" disabled={busy} onClick={() => ask(item,"block")}><Ban size={16}/>{t("exhibitions.block")}</button>
            {item.withdrawal_status === "pending" && <><button className="danger" disabled={busy} onClick={() => ask(item,"approveWithdrawal")}><Trash2 size={16}/>{t("exhibitions.approveDeletion")}</button><button disabled={busy} onClick={() => ask(item,"rejectWithdrawal")}>{t("exhibitions.rejectDeletion")}</button></>}
          </> : <>
            {item.status === "pending" && <button className="danger" disabled={busy} onClick={() => ask(item,"pendingWithdraw")}><Trash2 size={16}/>{t("exhibitions.removeSubmission")}</button>}
            {item.status === "approved" && <button disabled={busy || item.withdrawal_status === "pending"} onClick={() => ask(item,"withdraw")}><Trash2 size={16}/>{t("exhibitions.requestDeletion")}</button>}
          </>}
        </div>
      </article>)}
      {cursor !== null && <button className="pagination-load-more" disabled={busy} onClick={() => void more()}>{t("exhibitions.more")}</button>}
    </section>}
    {manage && <section className="exhibition-blocks"><h2>{t("exhibitions.blocked")}</h2>{blocks.map(item => <div key={item.user_id}><Link to={`/${language}/profile/${item.user_id}`}>{item.full_name}</Link><p>{item.reason}</p><button disabled={busy} onClick={() => void run(() => unblockParticipant(exhibitionId,item.user_id))}>{t("exhibitions.unblock")}</button></div>)}{!blocks.length && <p>{t("exhibitions.noBlocks")}</p>}{blockCursor !== null && <button disabled={busy} onClick={() => void moreBlocks()}>{t("exhibitions.more")}</button>}</section>}
    {workLoading && <p role="status">{t("exhibitions.loading")}</p>}
    {selected && work && <ArtworkDetailModal readOnly={manage} language={language} work={work} canLike={hasPermission(session.permissions,"works.like")} canSave={hasPermission(session.permissions,"works.save")} onClose={() => setSelected(null)} onToggleLike={toggleLike} onToggleSave={toggleSave} t={t} extraDetails={<section className="exhibition-submission-context"><span className={`exhibition-status ${selected.status}`}>{label(selected.status)}</span>{selected.rejection_reason && <div><h3>{t("exhibitions.rejectionReason")}</h3><p>{selected.rejection_reason}</p></div>}{selected.withdrawal_reason && <div><h3>{t("exhibitions.deletionReason")}</h3><p>{selected.withdrawal_reason}</p><p>{t(selected.withdrawal_status === "pending" ? "exhibitions.deletionPending" : "exhibitions.deletionRejected")}</p>{selected.withdrawal_review_reason && <p>{selected.withdrawal_review_reason}</p>}</div>}</section>}/>}
    {action && <div className="profile-connections-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setAction(null); }}><form ref={decision} className="exhibition-action-dialog form-stack" role="dialog" aria-modal="true" aria-labelledby="submission-action-title" onSubmit={event => { event.preventDefault(); void perform(); }} onKeyDown={event => {
      if (event.key === "Escape" && !busy) setAction(null);
      if (event.key === "Tab") { const nodes = Array.from(decision.current?.querySelectorAll<HTMLElement>("textarea,button:not(:disabled)") ?? []); const first = nodes[0], last = nodes[nodes.length-1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
    }}><h2 id="submission-action-title">{t(action.kind === "withdraw" ? "exhibitions.requestDeletion" : action.kind === "pendingWithdraw" ? "exhibitions.removeSubmission" : action.kind === "approveWithdrawal" ? "exhibitions.approveDeletion" : action.kind === "rejectWithdrawal" ? "exhibitions.rejectDeletion" : action.kind === "block" ? "exhibitions.block" : "exhibitions.reject")}</h2><p>{action.item.title}</p>{action.kind === "approveWithdrawal" && <blockquote>{action.item.withdrawal_reason}</blockquote>}{["withdraw","pendingWithdraw","approveWithdrawal"].includes(action.kind) && <p>{t("exhibitions.membershipOnly")}</p>}{requiredReason && <label>{t("exhibitions.reason")}<textarea required maxLength={2000} value={reason} disabled={busy} onChange={event => setReason(event.target.value)}/></label>}{error && <p role="alert">{error}</p>}<div className="exhibition-actions"><button className="primary-button" disabled={busy || Boolean(requiredReason && !reason.trim())}>{t("exhibitions.confirm")}</button><button type="button" disabled={busy} onClick={() => setAction(null)}>{t("exhibitions.cancel")}</button></div></form></div>}
  </div></main>;
}
export function MyExhibitionSubmissionsPage() { return <SubmissionRecordsPage/>; }
export function ReviewExhibitionSubmissionsPage() { return <SubmissionRecordsPage manage/>; }
