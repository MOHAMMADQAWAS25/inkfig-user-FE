import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import type { WorkExhibition } from "./worksApi";
import { RatingSummary } from "../exhibitions/RatingSummary";

export function WorkExhibitionBadge({ exhibitions, hasExhibition, detail = false }: { exhibitions?: readonly WorkExhibition[]; hasExhibition?: boolean; detail?: boolean }) {
  const { language, t } = useI18n();
  const entries = Array.from(new Map((exhibitions ?? []).map(item => [item.exhibition_id, item])).values());
  if (detail ? !entries.length : !(hasExhibition ?? Boolean(entries.length))) return null;
  const label = t("works.exhibitionBadge");
  if (detail) return <div className="work-exhibition-details" aria-label={t("exhibitions.title")}>
    {entries.map(item => <div className="work-exhibition-entry" key={item.exhibition_id}>
      <Link className="work-exhibition-badge" to={`/${language}/exhibition/${item.exhibition_id}`} aria-label={`${label} ${item.year}`}>
        <Trophy size={18} aria-hidden="true"/><span>{label}</span><span className="work-exhibition-year">{item.year}</span>
      </Link>
      {!new RegExp(`^(exhibition|معرض)\\s*[·-]?\\s*${item.year}$`, "iu").test(item.name.trim()) && <span className="work-exhibition-name" dir="auto">{item.name}</span>}
      <RatingSummary rating={item.rating}/>
      {item.rating && <small className="exhibition-rating-readonly">{t("ratings.galleryOnly")}</small>}
    </div>)}
  </div>;
  return <span className="work-exhibition-overlay" role="img" aria-label={label} title={label}>
    <Trophy size={21} aria-hidden="true"/>
  </span>;
}
