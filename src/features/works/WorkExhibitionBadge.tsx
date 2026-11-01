import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import type { WorkExhibition } from "./worksApi";

export function WorkExhibitionBadge({ exhibitions, detail = false }: { exhibitions?: readonly WorkExhibition[]; detail?: boolean }) {
  const { language, t } = useI18n();
  const entries = Array.from(new Map((exhibitions ?? []).map(item => [item.exhibition_id, item])).values());
  if (!entries.length) return null;
  const label = t("works.exhibitionBadge");
  if (detail) return <div className="work-exhibition-details" aria-label={t("exhibitions.title")}>
    {entries.map(item => <Link className="work-exhibition-badge" key={item.exhibition_id} to={`/${language}/exhibition/${item.exhibition_id}`} title={item.name}>
      <Trophy size={15} aria-hidden="true"/><bdi>{label} · {item.year}</bdi><span className="work-exhibition-name">{item.name}</span>
    </Link>)}
  </div>;
  const first = entries[0];
  return <span className="work-exhibition-badge work-exhibition-overlay" title={entries.map(item => `${item.name} · ${item.year}`).join("\n")}>
    <Trophy size={15} aria-hidden="true"/><bdi>{label} · {first.year}{entries.length > 1 ? ` +${entries.length - 1}` : ""}</bdi>
  </span>;
}
