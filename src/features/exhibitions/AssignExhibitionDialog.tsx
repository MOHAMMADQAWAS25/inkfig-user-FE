import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { getEligibleExhibitions, submitWork, type Exhibition } from "./exhibitionApi";

export function AssignExhibitionDialog({ workId, onClose }: { workId: string; onClose: () => void }) {
  const { language, t } = useI18n();
  const [items, setItems] = useState<Exhibition[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const dialog = useRef<HTMLElement>(null);
  usePageScrollLock(true);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    let active = true;
    getEligibleExhibitions(0, workId).then(page => {
      if (active) { setItems(page.items); setCursor(page.next_cursor); }
    }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [workId, language]);
  async function more() {
    if (cursor === null || busy) return;
    setBusy(true); setError("");
    try {
      const page = await getEligibleExhibitions(cursor, workId);
      setItems(current => [...new Map([...current, ...page.items].map(item => [item.exhibition_id, item])).values()]);
      setCursor(page.next_cursor);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); }
    finally { setBusy(false); }
  }
  async function assign() {
    if (!selected || busy) return;
    setBusy(true); setError("");
    try { await submitWork(selected, workId); setDone(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); }
    finally { setBusy(false); }
  }
  return <div className="profile-connections-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={dialog} tabIndex={-1} className="exhibition-assign-dialog" role="dialog" aria-modal="true" aria-labelledby="assign-exhibition-title" onKeyDown={event => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key === "Tab") {
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]') ?? []);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <header><h2 id="assign-exhibition-title">{t("exhibitions.assign")}</h2><button type="button" disabled={busy} aria-label={t("exhibitions.cancel")} onClick={onClose}><X size={20}/></button></header>
      {done ? <p role="status">{t("exhibitions.submitted")}</p> : <>
        <p>{t("exhibitions.limitHint")}</p>
        {loading ? <p role="status">{t("exhibitions.loading")}</p> : !items.length ? <p>{t("exhibitions.noEligible")}</p> : <fieldset className="exhibition-choices"><legend>{t("exhibitions.chooseExhibition")}</legend>{items.map(item => <label key={item.exhibition_id}><input type="radio" name="exhibition" value={item.exhibition_id} checked={selected === item.exhibition_id} onChange={() => setSelected(item.exhibition_id)}/><span><strong>{item.name}</strong><small>{new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(item.event_at))}</small></span></label>)}</fieldset>}
        {cursor !== null && <button disabled={busy} type="button" onClick={() => void more()}>{t("exhibitions.more")}</button>}
        <button className="primary-button" type="button" disabled={loading || busy || !selected} onClick={() => void assign()}>{t("exhibitions.submit")}</button>
      </>}
      {error && <p role="alert" className="error-message">{error}</p>}
    </section>
  </div>;
}
