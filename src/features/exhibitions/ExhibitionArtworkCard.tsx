import { memo, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { artworkImageProtection } from "../works/artworkImageProtection";
import type { Submission } from "./exhibitionApi";
import { ExhibitionRatingControls } from "./ExhibitionRatingControls";

export const ExhibitionArtworkCard = memo(function ExhibitionArtworkCard({ item, exhibitionId, votingOpen = false, onOpen, details, showRating = true, className = "" }: { item: Submission; exhibitionId: string; votingOpen?: boolean; onOpen: (workId: string, origin?: DOMRect) => void; details?: ReactNode; showRating?: boolean; className?: string }) {
  const { language, t } = useI18n();
  const card = useRef<HTMLElement>(null);
  const open = () => onOpen(item.work_id, card.current?.getBoundingClientRect());
  return <article className={`exhibition-artwork-card${className ? ` ${className}` : ""}`} ref={card} onClick={event => {
    if (event.target instanceof Element && !event.target.closest("button,a,input,label,form,.exhibition-rating-controls")) open();
  }}>
    <button type="button" className="exhibition-artwork-media" onClick={open} aria-haspopup="dialog" aria-label={`${t("works.viewDetails")}: ${item.title}`}><img {...artworkImageProtection} className="exhibition-artwork-blur" src={item.image_url} alt="" aria-hidden="true" draggable={false} loading="lazy" decoding="async"/><img {...artworkImageProtection} className="exhibition-artwork-original" src={item.image_url} alt="" loading="lazy" decoding="async"/></button>
    <div className="exhibition-artwork-details">
      {(item.type_name_en || item.type_name_ar) && <span className="exhibition-artwork-type">{language === "ar" ? item.type_name_ar : item.type_name_en}</span>}
      <h3><button type="button" className="exhibition-artwork-title" aria-haspopup="dialog" onClick={open}>{item.title}</button></h3>
      <Link className="exhibition-artwork-artist" to={`/${language}/profile/${item.user_id}`}><ProfileAvatar name={item.artist_name} url={item.artist_avatar_url} language={language}/><span>{item.artist_name}</span></Link>
      {details}
      {showRating && <ExhibitionRatingControls key={`${exhibitionId}:${item.work_id}`} exhibitionId={exhibitionId} workId={item.work_id} rating={item.rating} votingOpen={votingOpen} showPersonalScore={false}/>}
    </div>
  </article>;
});
