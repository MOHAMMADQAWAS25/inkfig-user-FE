import { useLayoutEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { usePageScrollLock } from "../layout/usePageScrollLock";

export function ReportDetailsDialog({ title, closeLabel, busy, onClose, children }: {
  title: string; closeLabel: string; busy: boolean; onClose: () => void; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  usePageScrollLock(true);
  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialog.current;
    node?.showModal();
    close.current?.focus({ preventScroll: true });
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);

  return <dialog ref={dialog} className="moderation-detail moderation-detail-dialog" aria-label={title} aria-modal="true" aria-busy={busy}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget || busy) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <button ref={close} className="moderation-detail-close" type="button" aria-label={closeLabel} disabled={busy} onClick={onClose}><X size={18} /></button>
    {children}
  </dialog>;
}
