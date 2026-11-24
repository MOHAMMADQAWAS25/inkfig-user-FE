import { Expand, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { artworkImageProtection } from "./artworkImageProtection";

export type ArtworkImageLabels = { expand: string; close: string; fit: string; actual: string; failed: string };

export function ArtworkImageExpand({ url, title, labels }: { url: string; title: string; labels: ArtworkImageLabels }) {
  const location = useLocation(), navigate = useNavigate();
  const open = location.state?.artworkOriginalImage?.url === url;
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open) { setPresent(true); return; }
    const timer = window.setTimeout(() => setPresent(false), window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
    return () => window.clearTimeout(timer);
  }, [open]);
  const show = () => navigate(`${location.pathname}${location.search}${location.hash}`, {
    state: { ...location.state, artworkOriginalImage: { url } }, replace: open, preventScrollReset: true,
  });
  return <><button type="button" className="artwork-image-expand" aria-label={labels.expand} title={labels.expand} aria-haspopup="dialog" onClick={show}><Expand size={21} aria-hidden="true"/></button>
    {(open || present) && <OriginalImage key={url} active={open} url={url} title={title} labels={labels} onClose={() => { if (open) navigate(-1); }}/>}</>;
}

function OriginalImage({ active, url, title, labels, onClose }: { active: boolean; url: string; title: string; labels: ArtworkImageLabels; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);
  usePageScrollLock(true);
  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialog.current; node?.showModal(); close.current?.focus({ preventScroll: true });
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return createPortal(<dialog ref={dialog} className="artwork-original-dialog" data-closing={!active} aria-label={title} aria-modal="true" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="artwork-original-close" ref={close} type="button" aria-label={labels.close} title={labels.close} onClick={onClose}><X size={23}/></button>
    <div className="artwork-original-viewport" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      {failed ? <p role="status">{labels.failed}</p> : <img {...artworkImageProtection} className="artwork-original-image" src={url} alt={title} decoding="async" onError={() => setFailed(true)}/>}
    </div>
  </dialog>, document.body);
}
