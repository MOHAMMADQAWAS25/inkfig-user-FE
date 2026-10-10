import { Bookmark, CalendarDays, ExternalLink, Flag, Heart, Link2, ShieldAlert, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type { Language, TranslationKey } from "../../i18n/resources";
import type { Work } from "../works/worksApi";
import { workTypeTone } from "../works/workTypePresentation";
import { ReportDialog } from "../reports/ReportDialog";

type ArtworkDetailModalProps = {
  language: Language;
  work: Work;
  canLike: boolean;
  canSave: boolean;
  canModerateDelete?: boolean;
  canReport?: boolean;
  onClose: () => void;
  onToggleLike: (work: Work) => void;
  onToggleSave: (work: Work) => void;
  onModerateDelete?: (work: Work, reason: string) => Promise<void>;
  t: (key: TranslationKey) => string;
};

export function ArtworkDetailModal({ language, work, canLike, canSave, canModerateDelete=false, canReport=false, onClose, onToggleLike, onToggleSave, onModerateDelete, t }: ArtworkDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [moderating,setModerating]=useState(false);const [reason,setReason]=useState("");const [deleting,setDeleting]=useState(false);const [deleteError,setDeleteError]=useState(false);
  const [reporting,setReporting]=useState(false);
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

  async function submitModeration(event:React.FormEvent){event.preventDefault();if(!onModerateDelete||reason.trim().length<10||deleting)return;setDeleting(true);setDeleteError(false);try{await onModerateDelete(work,reason.trim());}catch{setDeleteError(true);setDeleting(false);}}

  return (
    <div className="artwork-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="artwork-modal" role="dialog" aria-modal="true" aria-labelledby="artwork-modal-title">
        <button ref={closeButtonRef} className="artwork-modal-close" type="button" aria-label={t("works.closeDetails")} onClick={onClose}>
          <X size={22} />
        </button>
        <div className="artwork-modal-media"><img src={work.image_url} alt={work.title} /></div>
        <div className="artwork-modal-content">
          <span className={`artwork-type-tag artwork-modal-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language === "ar" ? work.type_name_ar : work.type_name_en}</span>
          <h2 id="artwork-modal-title">{work.title}</h2>
          <div className="artwork-modal-meta">
            <Link className="artwork-modal-artist" to={`/${language}/profile/${work.owner_user_id}`} onClick={onClose}><UserRound size={16} />{t("home.by")} {work.artist_name}</Link>
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
          <div className="artwork-modal-actions"><button className={`artwork-modal-like ${work.liked_by_me ? "liked" : ""}`} disabled={!canLike} type="button" onClick={() => onToggleLike(work)}><Heart size={20} fill={work.liked_by_me ? "currentColor" : "none"} /><span>{work.like_count} {t("home.likes")}</span></button>{canSave&&<button className={`artwork-modal-save ${work.saved_by_me?"saved":""}`} type="button" onClick={()=>onToggleSave(work)}><Bookmark size={20} fill={work.saved_by_me?"currentColor":"none"}/><span>{t(work.saved_by_me?"home.unsaveWork":"home.saveWork")}</span></button>}{canReport&&<button className="artwork-modal-report" type="button" onClick={()=>setReporting(true)}><Flag size={19}/><span>{t("reports.reportWork")}</span></button>}{canModerateDelete&&<button className="artwork-modal-moderate" type="button" onClick={()=>setModerating(true)}><Trash2 size={19}/><span>{t("works.moderateDelete")}</span></button>}</div>
        </div>
      </section>
      {moderating&&<div className="moderation-dialog-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&!deleting&&setModerating(false)}><form className="moderation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="moderation-title" onSubmit={submitModeration}><button className="moderation-dialog-close" type="button" disabled={deleting} aria-label={t("works.cancelModeration")} onClick={()=>setModerating(false)}><X size={19}/></button><span><ShieldAlert size={25}/></span><h2 id="moderation-title">{t("works.moderateDeleteTitle")}</h2><p>{t("works.moderateDeleteDescription")}</p><label>{t("works.deletionReason")}<textarea required minLength={10} maxLength={1000} value={reason} placeholder={t("works.deletionReasonPlaceholder")} onChange={event=>setReason(event.target.value)}/><small>{t("works.deletionReasonHint")}</small></label>{deleteError&&<p className="error-message" role="alert">{t("works.moderateDeleteFailed")}</p>}<div><button type="button" disabled={deleting} onClick={()=>setModerating(false)}>{t("works.cancelModeration")}</button><button className="danger-button" type="submit" disabled={deleting||reason.trim().length<10}>{t(deleting?"works.deletingModerated":"works.confirmModerateDelete")}</button></div></form></div>}
      {reporting&&<ReportDialog targetType="work" targetUserId={work.owner_user_id} targetWorkId={work.work_id} onClose={()=>setReporting(false)} t={t}/>}
    </div>
  );
}
