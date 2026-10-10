import { Bookmark, Heart, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedWork } from "../works/worksApi";
import { workTypeTone } from "../works/workTypePresentation";
import { useI18n } from "../../i18n/I18nProvider";
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { LazyImage } from "./LazyImage";

export function PostCard({ work, width, priority, onOpen, onLike, onSave }: {
  work: FeedWork; width: number; priority: boolean;
  onOpen: (work: FeedWork) => void; onLike: (work: FeedWork) => void; onSave: (work: FeedWork) => void;
}) {
  const { session } = useAuth();
  const { language, t } = useI18n();
  return <div className="artwork-pin-media">
    <button className="artwork-image-button" type="button" data-work-id={work.work_id}
      aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={() => onOpen(work)}>
      <LazyImage work={work} width={width} priority={priority} failureLabel={t("feed.imageFailed")} />
    </button>
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
  </div>;
}
