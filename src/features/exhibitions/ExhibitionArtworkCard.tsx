import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { relativeTime } from "../../lib/relativeTime";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { artworkImageProtection } from "../works/artworkImageProtection";
import type { Submission } from "./exhibitionApi";
import { ExhibitionRatingControls } from "./ExhibitionRatingControls";

export const ExhibitionArtworkCard = memo(function ExhibitionArtworkCard({ item, exhibitionId, votingOpen = false }: { item: Submission; exhibitionId: string; votingOpen?: boolean }) {
  const { language, t } = useI18n();
  const to = `/${language}/artwork/${item.work_id}`;
  const origin = { returnTo: `/${language}/exhibition/${exhibitionId}` };
  return <article className="exhibition-artwork-card">
    <Link className="exhibition-artwork-media" to={to} state={origin} aria-label={`${t("works.viewDetails")}: ${item.title}`}><img {...artworkImageProtection} src={item.image_url} alt="" loading="lazy" decoding="async"/></Link>
    <div className="exhibition-artwork-details">
      {(item.type_name_en || item.type_name_ar) && <span className="exhibition-artwork-type">{language === "ar" ? item.type_name_ar : item.type_name_en}</span>}
      <Link className="exhibition-artwork-title" to={to} state={origin}><h3>{item.title}</h3></Link>
      <div className="exhibition-artwork-artist"><ProfileAvatar name={item.artist_name} url={item.artist_avatar_url} language={language}/><span>{item.artist_name}</span></div>
      <p>{item.description || t("works.noDescription")}</p>
      <time dateTime={item.created_at} title={new Date(item.created_at).toLocaleString(language)}><CalendarDays size={15} aria-hidden="true"/>{relativeTime(item.created_at, language)}</time>
      <Link className="exhibition-artwork-open" to={to} state={origin}>{t("works.viewDetails")}<ArrowUpRight size={18} aria-hidden="true"/></Link>
      <ExhibitionRatingControls key={`${exhibitionId}:${item.work_id}`} exhibitionId={exhibitionId} workId={item.work_id} rating={item.rating} votingOpen={votingOpen}/>
    </div>
  </article>;
});
