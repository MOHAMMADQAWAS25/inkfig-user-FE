import { useLayoutEffect, useRef, useState } from "react";
import { artworkImageProtection } from "./artworkImageProtection";
import { useMobileViewport } from "../../lib/useMobileViewport";

type ArtworkPageMediaProps = {
  url: string;
  title: string;
  mimeType: string;
  failureLabel: string;
  dimensions?: { width: number; height: number };
  onDimensions?: (width: number, height: number) => void;
};

/** Page-only viewer: bounded, centered images without upscaling or popup framing. */
export function ArtworkPageMedia(props: ArtworkPageMediaProps) {
  // Remount on source changes so a failed image cannot hide the next artwork.
  return <ArtworkPageMediaSource key={props.url} {...props} />;
}

function ArtworkPageMediaSource({ url, title, mimeType, failureLabel, dimensions, onDimensions }: ArtworkPageMediaProps) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const mobile = useMobileViewport();
  const frame = useRef<HTMLDivElement>(null);
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
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); element.style.removeProperty("--artwork-mobile-media-limit"); };
  }, [mobile]);
  return <div className="artwork-page-media" data-ready={ready || failed} ref={frame}>
    {failed ? <p className="artwork-page-media-error" role="status">{failureLabel}</p>
      : mimeType.startsWith("video/")
        ? <video className="artwork-page-media-original" src={url} aria-label={title} controls playsInline preload="metadata" onLoadedMetadata={event => { setReady(true); onDimensions?.(event.currentTarget.videoWidth,event.currentTarget.videoHeight); }} onError={() => setFailed(true)} />
        : <img {...artworkImageProtection} className="artwork-page-media-original" src={url} alt={title} width={dimensions?.width} height={dimensions?.height} decoding="async" onLoad={event => { setReady(true); onDimensions?.(event.currentTarget.naturalWidth,event.currentTarget.naturalHeight); }} onError={() => setFailed(true)} />}
  </div>;
}
