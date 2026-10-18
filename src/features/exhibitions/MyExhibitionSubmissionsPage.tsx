import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppSidebar } from "../navigation/AppSidebar";
import { useI18n } from "../../i18n/I18nProvider";
import { getExhibition, getSubmissions, type Exhibition, type Submission } from "./exhibitionApi";

function SubmissionSection({ id, status }: { id: string; status: "approved" | "pending" | "rejected" }) {
  const { language, t } = useI18n();
  const [items, setItems] = useState<Submission[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getSubmissions(id, "mine", 0, status).then(page => { if (active) { setItems(page.items); setCursor(page.next_cursor); } })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, status, language]);
  async function more() {
    if (cursor === null || busy) return;
    setBusy(true); setError("");
    try {
      const page = await getSubmissions(id, "mine", cursor, status);
      setItems(current => [...new Map([...current, ...page.items].map(item => [item.submission_id, item])).values()]); setCursor(page.next_cursor);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); }
    finally { setBusy(false); }
  }
  return <section className="exhibition-personal-section" aria-labelledby={`submissions-${status}`}>
    <h2 id={`submissions-${status}`}>{t(status === "approved" ? "exhibitions.approved" : status === "pending" ? "exhibitions.pendingWorks" : "exhibitions.rejected")}</h2>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">{t("exhibitions.loading")}</p> : <>
      {!items.length && <p>{t("exhibitions.noSubmissions")}</p>}
      <div className="exhibition-personal-grid">{items.map(item => <article className="exhibition-card" key={item.submission_id}><Link to={`/${language}?work=${item.work_id}`}><img src={item.image_url} alt={item.title} loading="lazy"/></Link><div><h3>{item.title}</h3><span className={`exhibition-status ${status}`}>{t(status === "approved" ? "exhibitions.approved" : status === "pending" ? "exhibitions.pending" : "exhibitions.rejected")}</span>{item.rejection_reason && <p>{item.rejection_reason}</p>}</div></article>)}</div>
      {cursor !== null && <button className="pagination-load-more" disabled={busy} onClick={() => void more()}>{t("exhibitions.more")}</button>}
    </>}
  </section>;
}

export function MyExhibitionSubmissionsPage() {
  const { session } = useAuth();
  const { language, t } = useI18n();
  const { exhibitionId = "" } = useParams();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session) return;
    let active = true;
    getExhibition(exhibitionId).then(item => { if (active) setExhibition(item); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); });
    return () => { active = false; };
  }, [exhibitionId, session?.userId, language]);
  if (!session) return <Navigate replace to={`/${language}/login`}/>;
  return <main className="exhibitions-page app-page-with-sidebar"><AppSidebar/><div className="exhibitions-shell"><nav className="exhibition-toolbar"><Link to={`/${language}/exhibition/${exhibitionId}`}>{t("exhibitions.backToExhibition")}</Link></nav><header className="exhibitions-heading"><h1>{t("exhibitions.mySubmissions")}{exhibition && ` — ${exhibition.name}`}</h1></header>{error && <p role="alert">{error}</p>}<p>{t("exhibitions.limitHint")}</p><SubmissionSection id={exhibitionId} status="approved"/><SubmissionSection id={exhibitionId} status="pending"/><details className="exhibition-rejected-history"><summary>{t("exhibitions.rejected")}</summary><SubmissionSection id={exhibitionId} status="rejected"/></details></div></main>;
}
