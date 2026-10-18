import { artworkImageProtection } from "../works/artworkImageProtection";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function ArtworkMedia({ url, title, mimeType, readOnly, failureLabel }: { url: string; title: string; mimeType: string; readOnly: boolean; failureLabel: string }) {
  const [failed, setFailed] = useState(false);
  const [frame, setFrame] = useState<{ url: string; scale: number } | null>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => setFailed(false), [url]);
  const video = mimeType.startsWith("video/");
  useLayoutEffect(() => {
    const media = mediaRef.current;
    const image = imageRef.current;
    if (!media || !image || video || failed) return;
    const measure = () => {
      // Layout dimensions exclude the visual framing transform. Measuring the
      // unframed image prevents padding/blur from creating its own permanent gap.
      const width = image.offsetWidth;
      const height = image.offsetHeight;
      const hasGap = image.complete && image.naturalWidth > 0 && width > 0 && height > 0
        && (media.clientWidth - width > 2 || media.clientHeight - height > 2);
      const padding = Math.min(36, Math.max(20, window.innerWidth * .025));
      const scale = hasGap ? Math.max(.75, 1 - 2 * padding / Math.min(width, height)) : 1;
      setFrame(previous => previous?.url === url && previous.scale === scale ? previous : { url, scale });
    };
    measure();
    image.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(media);
    observer?.observe(image);
    return () => {
      image.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [url, video, failed]);
  const scale = !failed && !video && frame?.url === url ? frame.scale : 1;
  return <div ref={mediaRef} className="artwork-modal-media" data-framed={scale < 1}>
    {scale < 1 && <img {...artworkImageProtection} className="artwork-media-backdrop" src={url} alt="" aria-hidden="true" draggable={false} decoding="async" />}
    {failed ? <p className="artwork-media-unavailable" role="status">{failureLabel}</p> : video
      ? <video className="artwork-media-original" src={url} controls={!readOnly} playsInline preload="metadata" onError={() => setFailed(true)}/>
      : <img {...artworkImageProtection} key={url} ref={imageRef} className="artwork-media-original" style={scale < 1 ? { transform: `scale(${scale})` } : undefined} src={url} alt={title} draggable={false} decoding="async" onError={() => setFailed(true)}/>}
  </div>;
}
