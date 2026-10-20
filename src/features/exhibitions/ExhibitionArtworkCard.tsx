import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { relativeTime } from "../../lib/relativeTime";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { artworkImageProtection } from "../works/artworkImageProtection";
import type { Submission } from "./exhibitionApi";

export const ExhibitionArtworkCard = memo(function ExhibitionArtworkCard({ item, exhibitionId }: { item: Submission; exhibitionId: string }) {
  const { language, t } = useI18n();
  return <Link className="exhibition-artwork-card" to={`/${language}/artwork/${item.work_id}`}
    state={{ returnTo: `/${language}/exhibition/${exhibitionId}` }} aria-label={`${t("works.viewDetails")}: ${item.title}`}>
    <div className="exhibition-artwork-media"><img {...artworkImageProtection} src={item.image_url} alt="" loading="lazy" decoding="async"/></div>
    <div className="exhibition-artwork-details">
      {(item.type_name_en || item.type_name_ar) && <span className="exhibition-artwork-type">{language === "ar" ? item.type_name_ar : item.type_name_en}</span>}
      <h3>{item.title}</h3>
      <div className="exhibition-artwork-artist"><ProfileAvatar name={item.artist_name} url={item.artist_avatar_url} language={language}/><span>{item.artist_name}</span></div>
      <p>{item.description || t("works.noDescription")}</p>
      <time dateTime={item.created_at} title={new Date(item.created_at).toLocaleString(language)}><CalendarDays size={15} aria-hidden="true"/>{relativeTime(item.created_at, language)}</time>
      <span className="exhibition-artwork-open">{t("works.viewDetails")}<ArrowUpRight size={18} aria-hidden="true"/></span>
    </div>
  </Link>;
});
