import { Link } from "react-router-dom";
import { Pencil, Upload, Images, Trash2, Trophy, MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useDismissOnly } from "../layout/useDismissOnly";
import "./exhibitionToolbarMenu.css";
import { useI18n } from "../../i18n/I18nProvider";
import { ExhibitionBackButton } from "./ExhibitionBackButton";
import { ExhibitionNavbar } from "./ExhibitionNavbar";
import { useExhibitionCounts } from "./useExhibitionCounts";

export function ExhibitionToolbar({ id, manage, signedIn, available, busy, onEdit, onDelete, backToGallery = false }: {
  id: string; manage: boolean; signedIn: boolean; available: boolean;
  busy?: boolean; onEdit?: () => void; onDelete?: () => void; backToGallery?: boolean;
}) {
  const { language, t } = useI18n();
  const [open,setOpen]=useState(false);
  const menuId=useId();
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLDivElement>(null);
  useDismissOnly(open,target=>Boolean(root.current?.contains(target)),()=>setOpen(false));
  useEffect(()=>{setOpen(false);},[id]);
  useEffect(()=>{if(open)menu.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();},[open]);
  const counts=useExhibitionCounts()?.items.find(item=>item.exhibition_id===id);
  const pending=(counts?.submissions??0)+(counts?.withdrawals??0);
  return <ExhibitionNavbar label={t("exhibitions.actions")}>
    <ExhibitionBackButton to={`/${language}/exhibition${backToGallery ? `/${id}` : ""}`} label={backToGallery ? (language === "ar" ? "المعرض" : "Exhibition") : (language === "ar" ? "المعارض" : "Exhibitions")} showLabel/>
    <Link className="exhibition-leaderboard-link" to={`/${language}/exhibition/${id}/leaderboard`}><Trophy size={17} aria-hidden="true"/>{language === "ar" ? "لوحة الترتيب" : "Leaderboard"}</Link>
    {manage && <Link to={`/${language}/exhibition/${id}/review`}>{t("exhibitions.reviewQueue")}{pending>0&&<span className="exhibition-count">{pending>99?"99+":pending}</span>}</Link>}
    <Link to={signedIn ? `/${language}/exhibition/${id}/submissions` : `/${language}/login`}><Images size={17} aria-hidden="true"/>{t("exhibitions.mySubmissions")}</Link>
    {signedIn ? (available ? <Link className="primary-button" to={`/${language}/upload?exhibition=${id}`}><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</Link> : <button disabled><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</button>) : <Link to={`/${language}/login`}><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</Link>}
    {!onDelete && manage && onEdit && <button className="primary-button" disabled={busy} onClick={onEdit}><Pencil size={17} aria-hidden="true"/>{t("exhibitions.edit")}</button>}
    {onDelete && <div ref={root} className="exhibition-toolbar-options" onKeyDown={event=>{
      if(event.key==='Escape' && open){event.preventDefault();event.stopPropagation();setOpen(false);trigger.current?.focus();}
    }}>
      <button ref={trigger} type="button" className="exhibition-options-trigger" aria-label={language==='ar'?'خيارات المعرض':'Exhibition options'} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} disabled={busy} onClick={()=>setOpen(value=>!value)} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);}}}><MoreHorizontal size={22} aria-hidden="true"/></button>
      {open && <div ref={menu} id={menuId} role="menu" aria-label={language==='ar'?'خيارات المعرض':'Exhibition options'} className="exhibition-options-menu" onBlur={event=>{if(!root.current?.contains(event.relatedTarget))setOpen(false);}} onKeyDown={event=>{
        if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
        event.preventDefault();const items=Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]);
        const index=items.indexOf(document.activeElement as HTMLButtonElement);
        const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
        items[next]?.focus();
      }}>
        {manage && onEdit && <button type="button" role="menuitem" disabled={busy} onClick={()=>{setOpen(false);trigger.current?.focus();onEdit();}}><Pencil size={17} aria-hidden="true"/>{t('exhibitions.edit')}</button>}
        <button type="button" role="menuitem" className="exhibition-options-delete" disabled={busy} onClick={()=>{setOpen(false);trigger.current?.focus();onDelete();}}><Trash2 size={17} aria-hidden="true"/>{t('exhibitions.delete')}</button>
      </div>}
    </div>}
  </ExhibitionNavbar>;
}
