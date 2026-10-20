import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { ExhibitionCountdown } from "./ExhibitionCountdown";
import type { Exhibition } from "./exhibitionApi";
import { exhibitionEnd } from "./exhibitionPeriod";

export function ExhibitionCard({
  exhibition,
  past,
  detail = false,
  current = false,
  children,
}: {
  exhibition: Exhibition;
  past: boolean;
  detail?: boolean;
  current?: boolean;
  children?: ReactNode;
}) {
  const { language, t } = useI18n();
  const Heading = detail ? "h1" : "h3";
  const content = (
    <>
      <div className="exhibition-card-media">
        {exhibition.banner_url ? (
          <>
            <img className="exhibition-banner-blur" src={exhibition.banner_url} alt="" aria-hidden="true" loading="lazy" />
            <img className="exhibition-banner-original" src={exhibition.banner_url} alt="" loading="lazy" />
          </>
        ) : (
          <div className="exhibition-banner-fallback">
            <Trophy size={44} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="exhibition-card-content">
        <span
          className={`exhibition-status ${!past && exhibition.participation_open ? "open" : ""}`}
        >
          {t(
            current ? "exhibitions.currentBadge" : past
              ? "exhibitions.pastBadge"
              : exhibition.participation_open
                ? "exhibitions.open"
                : "exhibitions.closed",
          )}
        </span>
        <Heading>{exhibition.name}</Heading>
        <p className="exhibition-card-description">{exhibition.description}</p>
        {!detail && <small className="exhibition-card-date">
          <CalendarDays size={16} aria-hidden="true" />
          <time dateTime={exhibition.event_at}>
            {new Intl.DateTimeFormat(language, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(exhibition.event_at))}
          </time>
        </small>}
        {current && <small className="exhibition-card-date"><CalendarDays size={16} aria-hidden="true"/><span>{t("exhibitions.ends")}: <time dateTime={exhibitionEnd(exhibition)}>{new Intl.DateTimeFormat(language,{dateStyle:"medium",timeStyle:"short"}).format(new Date(exhibitionEnd(exhibition)))}</time></span></small>}
        {(!past || detail) && !current && <ExhibitionCountdown eventAt={exhibition.event_at} />}
        {children}
        {!detail && <span className="exhibition-card-link">
          {t("exhibitions.view")}
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>}
      </div>
    </>
  );
  const className = `exhibition-card exhibition-overview-card${past ? " is-past" : ""}${detail ? " exhibition-detail-card" : ""}`;
  return detail ? <section className={className} aria-label={exhibition.name}>{content}</section> : (
    <Link className={className} to={`/${language}/exhibition/${exhibition.exhibition_id}`}>{content}</Link>
  );
}
