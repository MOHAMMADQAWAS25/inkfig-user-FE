import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { deleteExhibition } from "./exhibitionApi";

export function DeleteExhibitionDialog({ id, name, onClose, onDeleted }: {
  id: string; name: string; onClose: () => void; onDeleted: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  usePageScrollLock(true);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.showModal();
    cancel.current?.focus();
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  async function remove() {
    if (busy) return;
    setBusy(true); setError("");
    try { await deleteExhibition(id); onDeleted(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t("exhibitions.failed")); setBusy(false); }
  }
  return <dialog ref={dialog} className="exhibition-delete-dialog" aria-labelledby="delete-exhibition-title" aria-describedby="delete-exhibition-description"
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !busy) {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    } }}>
    <Trash2 size={28} aria-hidden="true"/><h2 id="delete-exhibition-title">{t("exhibitions.delete")}</h2>
    <strong>{name}</strong><p id="delete-exhibition-description">{t("exhibitions.deleteWarning")}</p>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="exhibition-actions"><button ref={cancel} type="button" disabled={busy} onClick={onClose}>{t("exhibitions.cancel")}</button>
      <button className="exhibition-delete-confirm" type="button" disabled={busy} onClick={() => void remove()}>{t(busy ? "exhibitions.deleting" : "exhibitions.delete")}</button></div>
  </dialog>;
}
