import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { ExhibitionCountdown } from "./ExhibitionCountdown";
import type { Exhibition } from "./exhibitionApi";

export function ExhibitionCard({
  exhibition,
  past,
}: {
  exhibition: Exhibition;
  past: boolean;
}) {
  const { language, t } = useI18n();
  return (
    <Link
      className={`exhibition-card exhibition-overview-card${past ? " is-past" : ""}`}
      to={`/${language}/exhibition/${exhibition.exhibition_id}`}
    >
      <div className="exhibition-card-media">
        {exhibition.banner_url ? (
          <img src={exhibition.banner_url} alt="" loading="lazy" />
        ) : (
          <div className="exhibition-banner-fallback">
            <Trophy size={44} aria-hidden="true" />
          </div>
        )}
        <span
          className={`exhibition-status ${!past && exhibition.participation_open ? "open" : ""}`}
        >
          {t(
            past
              ? "exhibitions.pastBadge"
              : exhibition.participation_open
                ? "exhibitions.open"
                : "exhibitions.closed",
          )}
        </span>
      </div>
      <div className="exhibition-card-content">
        <h3>{exhibition.name}</h3>
        <p className="exhibition-card-description">{exhibition.description}</p>
        <small className="exhibition-card-date">
          <CalendarDays size={16} aria-hidden="true" />
          <time dateTime={exhibition.event_at}>
            {new Intl.DateTimeFormat(language, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(exhibition.event_at))}
          </time>
        </small>
        {!past && <ExhibitionCountdown eventAt={exhibition.event_at} />}
        <span className="exhibition-card-link">
          {t("exhibitions.view")}
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
