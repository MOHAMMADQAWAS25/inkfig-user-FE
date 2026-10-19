import { artworkImageProtection } from "../works/artworkImageProtection";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

export function SubmissionThumbnail({ url }: { url: string }) {
  const [loaded, setLoaded] = useState<{ url: string; gaps: boolean } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  return <span className="exhibition-record-thumbnail" aria-hidden="true">
    {failed !== url && loaded?.url === url && loaded.gaps && <img {...artworkImageProtection} className="record-thumbnail-blur" src={url} alt="" draggable={false}/>}
    {failed === url ? <ImageOff size={24}/> : <img {...artworkImageProtection} className="record-thumbnail-original" src={url} alt="" loading="lazy" decoding="async" onLoad={event => {
      const image = event.currentTarget;
      setLoaded({ url, gaps: image.naturalWidth > 0 && image.naturalHeight > 0 && Math.abs(image.naturalWidth - image.naturalHeight) > 1 });
    }} onError={() => setFailed(url)}/>}
  </span>;
}

export function SubmissionArtist({ name, avatar, language, userId }: { name: string; avatar?: string | null; language: string; userId?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const identity = <>
    {avatar && failed !== avatar ? <img src={avatar} alt="" loading="lazy" onError={() => setFailed(avatar)}/> : <span className="submission-artist-initial" aria-hidden="true">{name.trim().charAt(0).toLocaleUpperCase(language) || "I"}</span>}
    <span className="submission-artist-name">{name}</span>
  </>;
  if (!userId) return <span className="exhibition-record-artist">{identity}</span>;
  return <span className="submission-artist-profile">
    <Link className="exhibition-record-artist" to={`/${language}/profile/${userId}`}>{identity}</Link>
    <span className="submission-profile-preview" aria-hidden="true">
      {avatar && failed !== avatar ? <img src={avatar} alt="" loading="lazy" onError={() => setFailed(avatar)}/> : <span className="submission-artist-initial">{name.trim().charAt(0).toLocaleUpperCase(language) || "I"}</span>}
      <strong>{name}</strong>
    </span>
  </span>;
}
