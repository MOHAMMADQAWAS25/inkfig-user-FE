import { useState } from "react";
import { artworkImageProtection } from "./artworkImageProtection";

type ArtworkPageMediaProps = {
  url: string;
  title: string;
  mimeType: string;
  failureLabel: string;
};

/** Page-only viewer: bounded, centered images without upscaling or popup framing. */
export function ArtworkPageMedia(props: ArtworkPageMediaProps) {
  // Remount on source changes so a failed image cannot hide the next artwork.
  return <ArtworkPageMediaSource key={props.url} {...props} />;
}

function ArtworkPageMediaSource({ url, title, mimeType, failureLabel }: ArtworkPageMediaProps) {
  const [failed, setFailed] = useState(false);
  return <div className="artwork-page-media">
    {failed ? <p className="artwork-page-media-error" role="status">{failureLabel}</p>
      : mimeType.startsWith("video/")
        ? <video className="artwork-page-media-original" src={url} aria-label={title} controls playsInline preload="metadata" onError={() => setFailed(true)} />
        : <img {...artworkImageProtection} className="artwork-page-media-original" src={url} alt={title} decoding="async" onError={() => setFailed(true)} />}
  </div>;
}
