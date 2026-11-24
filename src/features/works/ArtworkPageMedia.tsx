import { useLayoutEffect, useRef, useState } from "react";
import { artworkImageProtection } from "./artworkImageProtection";
import { useMobileViewport } from "../../lib/useMobileViewport";
import { ArtworkImageExpand, type ArtworkImageLabels } from "./ArtworkImageExpand";
import "./artworkViewer.css";

type ArtworkPageMediaProps = {
  url: string;
  title: string;
  mimeType: string;
  failureLabel: string;
  dimensions?: { width: number; height: number };
  onDimensions?: (width: number, height: number) => void;
  variant?: "page" | "popup";
  readOnly?: boolean;
  imageLabels?: ArtworkImageLabels;
};

/** Intrinsic, centered media in a frame whose size never depends on image ratio. */
export function ArtworkPageMedia(props: ArtworkPageMediaProps) {
  // Remount on source changes so a failed image cannot hide the next artwork.
  return <ArtworkPageMediaSource key={props.url} {...props} />;
}

function ArtworkPageMediaSource({ url, title, mimeType, failureLabel, dimensions, onDimensions, variant = "page", readOnly = false, imageLabels }: ArtworkPageMediaProps) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [natural, setNatural] = useState(dimensions);
  const [fitting, setFitting] = useState<{ width: number; height: number; gaps: boolean }>();
  const mobile = useMobileViewport();
  const frame = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element || !natural?.width || !natural.height || mimeType.startsWith("video/")) return;
    const measure = () => {
      // Layout dimensions exclude the parent card's temporary opening scale.
      const width = element.clientWidth, height = element.clientHeight;
      if (!width || !height) return;
      const scale = natural.height > natural.width ? height / natural.height
        : Math.min(width / natural.width, height / natural.height, 1);
      const next = { width: natural.width * scale, height: natural.height * scale,
        gaps: width - natural.width * scale > 2 || height - natural.height * scale > 2 };
      setFitting(previous => previous && Math.abs(previous.width-next.width)<.5 && Math.abs(previous.height-next.height)<.5 && previous.gaps===next.gaps ? previous : next);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element); window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, [natural, mimeType]);
  useLayoutEffect(() => {
    const element = frame.current;
    if (!mobile || !element) return;
    let width = -1;
    const measure = () => {
      const nextWidth = element.getBoundingClientRect().width;
      if (!nextWidth || Math.abs(nextWidth - width) < 1) return;
      width = nextWidth;
      // iOS browsers can change even svh while animating their browser chrome.
      // Re-measure only for a real width change, never a height-only scroll resize.
      const limit = Math.min(560, Math.max(180, window.innerHeight * .5));
      element.style.setProperty("--artwork-mobile-media-limit", `${limit}px`);
      const owner = element.closest<HTMLElement>(".artwork-page-hero,.artwork-fixed-viewer");
      owner?.style.setProperty("--artwork-mobile-details-limit", `${Math.min(600, Math.max(320, window.innerHeight * .65))}px`);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); element.style.removeProperty("--artwork-mobile-media-limit"); element.closest<HTMLElement>(".artwork-page-hero,.artwork-fixed-viewer")?.style.removeProperty("--artwork-mobile-details-limit"); };
  }, [mobile]);
  const imageClass = `artwork-page-media-original${variant === "popup" ? " artwork-media-original artwork-fixed-media-original" : ""}`;
  return <div className={`artwork-page-media${variant === "popup" ? " artwork-modal-media artwork-fixed-media" : ""}`} data-ready={ready || failed} ref={frame}>
    {!failed && ready && fitting?.gaps && <div className="artwork-frame-color" aria-hidden="true" style={{ backgroundImage: `url(${JSON.stringify(url)})` }}/ >}
    {failed ? <p className="artwork-page-media-error" role="status">{failureLabel}</p>
      : mimeType.startsWith("video/")
        ? <video className={imageClass} src={url} aria-label={title} controls={!readOnly} playsInline preload="metadata" onLoadedMetadata={event => { setReady(true); onDimensions?.(event.currentTarget.videoWidth,event.currentTarget.videoHeight); }} onError={() => setFailed(true)} />
        : <img {...artworkImageProtection} className={imageClass} style={fitting ? { width: fitting.width, height: fitting.height, ...(natural && natural.height > natural.width ? {maxWidth:"none",flexShrink:0} : {}) } : undefined} src={url} alt={title} width={dimensions?.width} height={dimensions?.height} decoding="async" onLoad={event => { setReady(true); setNatural({width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight}); onDimensions?.(event.currentTarget.naturalWidth,event.currentTarget.naturalHeight); }} onError={() => setFailed(true)} />}
    {!failed && ready && !mimeType.startsWith("video/") && imageLabels && <ArtworkImageExpand url={url} title={title} labels={imageLabels}/>}
  </div>;
}
