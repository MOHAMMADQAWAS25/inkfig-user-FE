import { CalendarDays, ExternalLink, Heart, Link2, UserRound, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { Language, TranslationKey } from "../../i18n/resources";
import type { Work } from "../works/worksApi";

type ArtworkDetailModalProps = {
  language: Language;
  work: Work;
  canLike: boolean;
  onClose: () => void;
  onToggleLike: (work: Work) => void;
  t: (key: TranslationKey) => string;
};

export function ArtworkDetailModal({ language, work, canLike, onClose, onToggleLike, t }: ArtworkDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const uploadedAt = new Intl.DateTimeFormat(language === "ar" ? "ar-PS" : "en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(work.created_at));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="artwork-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="artwork-modal" role="dialog" aria-modal="true" aria-labelledby="artwork-modal-title">
        <button ref={closeButtonRef} className="artwork-modal-close" type="button" aria-label={t("works.closeDetails")} onClick={onClose}>
          <X size={22} />
        </button>
        <div className="artwork-modal-media"><img src={work.image_url} alt={work.title} /></div>
        <div className="artwork-modal-content">
          <p className="artwork-modal-type">{language === "ar" ? work.type_name_ar : work.type_name_en}</p>
          <h2 id="artwork-modal-title">{work.title}</h2>
          <div className="artwork-modal-meta">
            <span><UserRound size={16} />{t("home.by")} {work.artist_name}</span>
            <span><CalendarDays size={16} />{uploadedAt}</span>
          </div>
          <div className="artwork-modal-description">
            <h3>{t("works.description")}</h3>
            <p>{work.description || t("works.noDescription")}</p>
          </div>
          {work.links.length > 0 && <div className="artwork-modal-links">
            <h3><Link2 size={17} />{t("works.links")}</h3>
            <div>{work.links.map((link, index) => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer">{link.label || `${t("works.openLink")} ${index + 1}`}<ExternalLink size={15} /></a>)}</div>
          </div>}
          <button className={`artwork-modal-like ${work.liked_by_me ? "liked" : ""}`} disabled={!canLike} type="button" onClick={() => onToggleLike(work)}>
            <Heart size={20} fill={work.liked_by_me ? "currentColor" : "none"} /><span>{work.like_count} {t("home.likes")}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
