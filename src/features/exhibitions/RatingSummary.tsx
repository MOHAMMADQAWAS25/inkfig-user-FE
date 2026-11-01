import { Star } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import type { RatingTotals } from "./exhibitionRatingTypes";

export function RatingSummary({ rating, overlay = false, year }: { rating?: RatingTotals | null; overlay?: boolean; year?: number }) {
  const { language, t } = useI18n();
  if (!rating) return null;
  const count = new Intl.NumberFormat(language).format(rating.vote_count);
  const score = rating.average === null ? "" : new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rating.average);
  return <span className={`exhibition-rating-summary${overlay ? " exhibition-rating-overlay" : ""}`} title={year ? `${t("works.exhibitionBadge")} ${year}` : undefined}>
    <Star size={16} aria-hidden="true"/>
    <span>{rating.vote_count === 0 || rating.average === null ? t("ratings.none") : t("ratings.result").replace("{score}", score).replace("{count}", count)}</span>
    {year !== undefined && <span className="sr-only">{t("works.exhibitionBadge")} {year}</span>}
  </span>;
}
