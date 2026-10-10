import { useEffect, useRef, useState } from "react";
import type { FeedWork } from "../works/worksApi";

export function LazyImage({ work, width, priority = false, failureLabel }: { work: FeedWork; width: number; priority?: boolean; failureLabel: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const constrained = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
  const variants = work.media?.sizes ?? [];
  const selected = constrained ? variants.filter(size => size.w <= 474) : variants;
  const candidates = selected.length ? selected : variants.slice(0, 1);
  const fallback = candidates.find(size => size.w >= width) ?? candidates[candidates.length - 1];
  useEffect(() => {
    setFailed(false);
    setLoaded(Boolean(ref.current?.complete && ref.current.naturalWidth));
  }, [work.image_url]);
  return <span className={`feed-media ${loaded ? "is-loaded" : ""}`} style={{ backgroundColor: work.media?.dominantColor ?? "#85866b" }}>
    {!failed && <img ref={ref} className="artwork-image feed-image" src={fallback?.url ?? work.image_url}
      srcSet={candidates.length ? candidates.map(size => `${size.url} ${size.w}w`).join(", ") : undefined}
      sizes={`${Math.ceil(width)}px`} width={work.media?.width} height={work.media?.height}
      alt={work.title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async"
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
    {failed && <span className="feed-image-error" role="img" aria-label={`${work.title}: ${failureLabel}`}>{failureLabel}</span>}
  </span>;
}
