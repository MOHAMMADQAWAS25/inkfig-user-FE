import { Flag, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import type { TranslationKey } from "../../i18n/resources";
import { createReport, getReportingEligibility, type ReportReason } from "./reportsApi";

import { userReportReasons as userReasons, workReportReasons as workReasons } from "./reportReasons";
function ReportModal({ children, titleId, busy, onClose }: { children: ReactNode; titleId: string; busy: boolean; onClose: () => void }) {
 const dialog = useRef<HTMLDialogElement>(null);
 usePageScrollLock(true);
 useEffect(() => {
  const node = dialog.current, previous = document.activeElement as HTMLElement | null;
  node?.showModal();
  return () => { node?.close(); if(previous?.isConnected)previous.focus({preventScroll:true}); };
 },[]);
 useEffect(() => { dialog.current?.querySelector<HTMLElement>("button")?.focus(); },[titleId]);
 return createPortal(<dialog ref={dialog} className="report-modal" aria-labelledby={titleId} onCancel={event=>{event.preventDefault();if(!busy)onClose();}} onClick={event=>{
  if(event.target!==event.currentTarget||busy)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)onClose();
 }}>{children}</dialog>,document.body);
}
export function ReportDialog({targetType,targetUserId,targetWorkId,onClose,t}:{targetType:"work"|"user";targetUserId:string;targetWorkId?:string;onClose:()=>void;t:(key:TranslationKey)=>string}){
 const [reason,setReason]=useState<ReportReason>(targetType==="user"?"impersonation":"harassment");const [details,setDetails]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [sent,setSent]=useState(false);
 const [eligibility,setEligibility]=useState<"loading"|"allowed"|"blocked"|"error">("loading");
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();setEligibility("loading");getReportingEligibility(controller.signal).then(value=>{if(!controller.signal.aborted)setEligibility(value.allowed?"allowed":"blocked");}).catch(()=>{if(!controller.signal.aborted)setEligibility("error");});return()=>controller.abort();},[attempt]);
 const reasons=targetType==="user"?userReasons:workReasons;
 const detailsRequired=reason==="other";
 function reasonLabel(item:ReportReason){if(targetType==="user"&&item==="impersonation")return t("reports.userReason.impersonation");if(targetType==="user"&&item==="spam")return t("reports.userReason.spam");return t(`reports.reason.${item}` as TranslationKey);}
 async function submit(event:React.FormEvent){event.preventDefault();if(busy||eligibility!=="allowed")return;const normalizedDetails=details.trim().replace(/\s+/gu," ");if((detailsRequired&&!normalizedDetails)||(normalizedDetails&&Array.from(normalizedDetails).length<10)){setError(t("reports.detailsInvalid"));return;}setBusy(true);setError("");try{await createReport({targetType,targetUserId,targetWorkId,reasonCode:reason,details:normalizedDetails});setSent(true);}catch(error){if(error instanceof Error&&error.message.includes("reporting privileges")){setEligibility("blocked");}else{setError(error instanceof Error&&error.message.includes("already")?t("reports.duplicate"):t("reports.failed"));}}finally{setBusy(false)}}
 if(eligibility!=="allowed")return <ReportModal titleId="report-access-title" busy={busy} onClose={onClose}><section className="report-dialog"><h2 id="report-access-title">{t(eligibility==="blocked"?"reports.reportingBlocked":eligibility==="error"?"reports.failed":"reports.checkingAccess")}</h2>{eligibility==="error"&&<button type="button" onClick={()=>setAttempt(value=>value+1)}>{t("admin.refresh")}</button>}<button type="button" onClick={onClose}>{t("reports.cancel")}</button></section></ReportModal>;
 return <ReportModal titleId="report-dialog-title" busy={busy} onClose={onClose}>
  <form className="report-dialog" onSubmit={submit}>
   <button className="report-dialog-close" type="button" aria-label={t("reports.cancel")} disabled={busy} onClick={onClose}><X size={19}/></button>
   <span className="report-dialog-icon"><Flag size={24}/></span>
   <h2 id="report-dialog-title">{t(targetType==="work"?"reports.reportWork":"reports.reportUser")}</h2>
   {sent?<><p className="report-success" role="status">{t("reports.success")}</p><button className="primary-button" type="button" onClick={onClose}>{t("reports.done")}</button></>:<>
    <p>{t("reports.description")}</p>
    <fieldset disabled={busy}><legend>{t("reports.reason")}</legend>{reasons.map(item=><label key={item}>
     <input type="radio" name="report-reason" checked={reason===item} onChange={()=>{setReason(item);setError("");}}/><span>{reasonLabel(item)}</span>
    </label>)}</fieldset>
    <label>{t(detailsRequired?"reports.detailsRequired":"reports.details")}
     <textarea required={detailsRequired} minLength={10} maxLength={2000} disabled={busy} value={details}
      aria-describedby="report-details-hint" placeholder={t("reports.detailsPlaceholder")}
      onChange={event=>{setDetails(event.target.value);setError("");}}/>
     <small id="report-details-hint">{t("reports.detailsHint")}</small>
    </label>
    {error&&<p className="error-message" role="alert">{error}</p>}
    <div className="report-dialog-actions"><button type="button" disabled={busy} onClick={onClose}>{t("reports.cancel")}</button><button className="danger-button" type="submit" disabled={busy}>{t(busy?"reports.submitting":"reports.submit")}</button></div>
   </>}
  </form>
 </ReportModal>;
}
