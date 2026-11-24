import { Expand, Minimize, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import { artworkImageProtection } from "./artworkImageProtection";

export type ArtworkImageLabels = { expand: string; close: string; fit: string; actual: string; failed: string };

export function ArtworkImageExpand({ url, title, labels }: { url: string; title: string; labels: ArtworkImageLabels }) {
  const location = useLocation(), navigate = useNavigate();
  const open = location.state?.artworkOriginalImage?.url === url;
  const show = () => navigate(`${location.pathname}${location.search}${location.hash}`, {
    state: { ...location.state, artworkOriginalImage: { url } }, replace: open, preventScrollReset: true,
  });
  return <><button type="button" className="artwork-image-expand" aria-label={labels.expand} title={labels.expand} aria-haspopup="dialog" onClick={show}><Expand size={21} aria-hidden="true"/></button>
    {open && <OriginalImage key={url} url={url} title={title} labels={labels} onClose={() => navigate(-1)}/>}</>;
}

function OriginalImage({ url, title, labels, onClose }: { url: string; title: string; labels: ArtworkImageLabels; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(false);
  const [failed, setFailed] = useState(false);
  usePageScrollLock(true);
  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialog.current; node?.showModal(); close.current?.focus({ preventScroll: true });
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  function toggleFit() {
    setFit(value => !value);
    viewport.current?.scrollTo?.({ top: 0, left: 0, behavior: "instant" });
  }
  return createPortal(<dialog ref={dialog} className="artwork-original-dialog" aria-label={title} aria-modal="true" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="artwork-original-toolbar"><span dir="auto">{title}</span><button type="button" onClick={toggleFit} disabled={failed} aria-label={fit ? labels.actual : labels.fit} title={fit ? labels.actual : labels.fit}>{fit ? <Expand size={20}/> : <Minimize size={20}/>}<span>{fit ? labels.actual : labels.fit}</span></button><button ref={close} type="button" aria-label={labels.close} title={labels.close} onClick={onClose}><X size={23}/></button></header>
    <div ref={viewport} className="artwork-original-viewport" data-fit={fit} tabIndex={0}>
      {failed ? <p role="status">{labels.failed}</p> : <div className="artwork-original-canvas"><img {...artworkImageProtection} className="artwork-original-image" src={url} alt={title} decoding="async" onError={() => setFailed(true)}/></div>}
    </div>
  </dialog>, document.body);
}
