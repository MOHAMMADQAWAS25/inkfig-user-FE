import { useEffect, useState } from "react";

export function ArtworkMedia({ url, title, mimeType, readOnly, failureLabel }: { url: string; title: string; mimeType: string; readOnly: boolean; failureLabel: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const video = mimeType.startsWith("video/");
  return <div className="artwork-modal-media">
    {!failed && !video && <img className="artwork-media-backdrop" src={url} alt="" aria-hidden="true" draggable={false} decoding="async" />}
    {failed ? <p className="artwork-media-unavailable" role="status">{failureLabel}</p> : video
      ? <video className="artwork-media-original" src={url} controls={!readOnly} playsInline preload="metadata" onError={() => setFailed(true)}/>
      : <img className="artwork-media-original" src={url} alt={title} draggable={false} decoding="async" onError={() => setFailed(true)}/>}
  </div>;
}
