import { Bookmark, Heart, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedWork } from "../works/worksApi";
import { workTypeTone } from "../works/workTypePresentation";
import { useI18n } from "../../i18n/I18nProvider";
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { LazyImage } from "./LazyImage";
import { CardMedia } from "./CardMedia";
import { memo, useState } from "react";
import { artworkPath } from "../works/artworkNavigation";

export const PostCard = memo(function PostCard({ work, width, priority, onOpen, onLike, onSave }: {
  work: FeedWork; width: number; priority: boolean;
  onOpen: (work: FeedWork) => void; onLike: (work: FeedWork) => void; onSave: (work: FeedWork) => void;
}) {
  const { session } = useAuth();
  const { language, t } = useI18n();
  const [failedAvatar,setFailedAvatar]=useState<string|null>(null);
  const profileHref=session ? `/${language}/profile/${work.owner_user_id}` : `/${language}/login`;
  return <div className="feed-post-card"><CardMedia>
    <Link className="artwork-image-button" to={artworkPath(language, work.work_id)} data-work-id={work.work_id}
      aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpen(work); } }}>
      <LazyImage work={work} width={width} priority={priority} failureLabel={t("feed.imageFailed")} />
    </Link>
    <span className={`artwork-type-tag artwork-card-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language === "ar" ? work.type_name_ar : work.type_name_en}</span>
    <Link className="artwork-artist-link" to={session ? `/${language}/profile/${work.owner_user_id}` : `/${language}/login`}><UserRound size={15} />{work.artist_name}</Link>
    <button className={`artwork-pin-like ${work.liked_by_me ? "liked" : ""}`} disabled={!session || !hasPermission(session.permissions, "works.like")}
      aria-label={`${work.like_count} ${t("home.likes")}`} aria-pressed={work.liked_by_me} type="button" onClick={() => onLike(work)}>
      <Heart size={18} fill={work.liked_by_me ? "currentColor" : "none"} /><span>{work.like_count}</span>
    </button>
    {session && hasPermission(session.permissions, "works.save") && <button className={`artwork-pin-save ${work.saved_by_me ? "saved" : ""}`}
      aria-label={t(work.saved_by_me ? "home.unsaveWork" : "home.saveWork")} aria-pressed={work.saved_by_me} type="button" onClick={() => onSave(work)}>
      <Bookmark aria-hidden="true" size={21} fill={work.saved_by_me ? "currentColor" : "none"} />
    </button>}
  </CardMedia><Link className="feed-creator" to={profileHref} aria-label={work.artist_name}>
    {work.artist_avatar_url&&failedAvatar!==work.artist_avatar_url?<img src={work.artist_avatar_url} alt="" width={28} height={28} loading="lazy" decoding="async" onError={()=>setFailedAvatar(work.artist_avatar_url??null)}/>:<span className="feed-creator-initial" aria-hidden="true">{work.artist_name.trim().charAt(0).toLocaleUpperCase(language)||"I"}</span>}
    <span className="feed-creator-name">{work.artist_name}</span>
  </Link></div>;
});
