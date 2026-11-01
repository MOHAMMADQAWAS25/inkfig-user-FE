import { memo } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { relativeTime } from "../../lib/relativeTime";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { artworkImageProtection } from "../works/artworkImageProtection";
import type { Submission } from "./exhibitionApi";
import { ExhibitionRatingControls } from "./ExhibitionRatingControls";

export const ExhibitionArtworkCard = memo(function ExhibitionArtworkCard({ item, exhibitionId, votingOpen = false, onOpen }: { item: Submission; exhibitionId: string; votingOpen?: boolean; onOpen: (workId: string) => void }) {
  const { language, t } = useI18n();
  const open = () => onOpen(item.work_id);
  return <article className="exhibition-artwork-card" onClick={event => {
    if (event.target instanceof Element && !event.target.closest("button,a,input,label,form,.exhibition-rating-controls")) open();
  }}>
    <button type="button" className="exhibition-artwork-media" onClick={open} aria-haspopup="dialog" aria-label={`${t("works.viewDetails")}: ${item.title}`}><img {...artworkImageProtection} src={item.image_url} alt="" loading="lazy" decoding="async"/></button>
    <div className="exhibition-artwork-details">
      {(item.type_name_en || item.type_name_ar) && <span className="exhibition-artwork-type">{language === "ar" ? item.type_name_ar : item.type_name_en}</span>}
      <h3><button type="button" className="exhibition-artwork-title" aria-haspopup="dialog" onClick={open}>{item.title}</button></h3>
      <div className="exhibition-artwork-artist"><ProfileAvatar name={item.artist_name} url={item.artist_avatar_url} language={language}/><span>{item.artist_name}</span></div>
      <p>{item.description || t("works.noDescription")}</p>
      <time dateTime={item.created_at} title={new Date(item.created_at).toLocaleString(language)}><CalendarDays size={15} aria-hidden="true"/>{relativeTime(item.created_at, language)}</time>
      <button type="button" className="exhibition-artwork-open" aria-haspopup="dialog" onClick={open}>{t("works.viewDetails")}<ArrowUpRight size={18} aria-hidden="true"/></button>
      <ExhibitionRatingControls key={`${exhibitionId}:${item.work_id}`} exhibitionId={exhibitionId} workId={item.work_id} rating={item.rating} votingOpen={votingOpen}/>
    </div>
  </article>;
});
