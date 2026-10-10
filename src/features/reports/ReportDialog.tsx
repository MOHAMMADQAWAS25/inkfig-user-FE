import { Flag, X } from "lucide-react";
import { useState } from "react";
import type { TranslationKey } from "../../i18n/resources";
import { createReport, type ReportReason } from "./reportsApi";

const userReasons:ReportReason[]=["impersonation","harassment","spam","hate_speech","other"];
const workReasons:ReportReason[]=["harassment","hate_speech","violence","spam","copyright","impersonation","other"];
export function ReportDialog({targetType,targetUserId,targetWorkId,onClose,t}:{targetType:"work"|"user";targetUserId:string;targetWorkId?:string;onClose:()=>void;t:(key:TranslationKey)=>string}){
 const [reason,setReason]=useState<ReportReason>(targetType==="user"?"impersonation":"harassment");const [details,setDetails]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [sent,setSent]=useState(false);
 const reasons=targetType==="user"?userReasons:workReasons;
 const detailsRequired=reason==="other";
 function reasonLabel(item:ReportReason){if(targetType==="user"&&item==="impersonation")return t("reports.userReason.impersonation");if(targetType==="user"&&item==="spam")return t("reports.userReason.spam");return t(`reports.reason.${item}` as TranslationKey);}
 async function submit(event:React.FormEvent){event.preventDefault();if(busy)return;const normalizedDetails=details.trim().replace(/\s+/gu," ");if((detailsRequired&&!normalizedDetails)||(normalizedDetails&&Array.from(normalizedDetails).length<10)){setError(t("reports.detailsInvalid"));return;}setBusy(true);setError("");try{await createReport({targetType,targetUserId,targetWorkId,reasonCode:reason,details:normalizedDetails});setSent(true);}catch(error){setError(error instanceof Error&&error.message.includes("already")?t("reports.duplicate"):t("reports.failed"));}finally{setBusy(false)}}
 return <div className="report-dialog-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&!busy&&onClose()}>
  <form className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" onSubmit={submit}>
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
 </div>;
}
