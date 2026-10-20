import { artworkImageProtection } from "../works/artworkImageProtection";
import { CheckCircle2, Flag, RefreshCw, ShieldBan, Trash2, UserRound, FileImage, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";

import { useI18n } from "../../i18n/I18nProvider";
import type { TranslationKey } from "../../i18n/resources";
import { hasPermission } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { AppSidebar } from "../navigation/AppSidebar";
import { useReportsLive } from "../reports/useReportsLive";
import { ReportDetailsDialog } from "../reports/ReportDetailsDialog";
import { getReports, reviewReport, setReporterRestriction, type ReportItem, type ReportStatus } from "../reports/reportsApi";
import { deleteWorkAsModerator, getWork, type Work } from "../works/worksApi";
import { getPublicProfile, type PublicProfile } from "../profile/profileApi";
import { setManagedUserStatus } from "./administrationApi";

type Filter="all"|ReportStatus;
function ReportThumbnail({item}:{item:ReportItem}){
 const [url,setUrl]=useState<string|null>(null);
 useEffect(()=>{let active=true;const request=item.target_work_id?getWork(item.target_work_id).then(work=>work.image_url):getPublicProfile(item.target_user_id).then(profile=>profile.avatar_url);request.then(value=>{if(active)setUrl(value);}).catch(()=>undefined);return()=>{active=false;};},[item.target_work_id,item.target_user_id]);
 return url?<img {...(item.target_type === "work" ? artworkImageProtection : {})} src={url} alt="" loading="lazy" onError={()=>setUrl(null)}/>:item.target_type==="work"?<FileImage size={26}/>:<UserRound size={26}/>;
}
export function AdminReportsPage(){
 const {session}=useAuth();const {language,t}=useI18n();
 const [items,setItems]=useState<ReportItem[]>([]);const [filter,setFilter]=useState<Filter>("pending");const [cursor,setCursor]=useState<number|null>(null);const [loading,setLoading]=useState(true);const [loadingMore,setLoadingMore]=useState(false);const [busy,setBusy]=useState<string|null>(null);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const canManage=Boolean(session&&hasPermission(session.permissions,"reports.manage"));
 const [type,setType]=useState<"all"|"work"|"user">("all");const [reason,setReason]=useState("all");const [oldest,setOldest]=useState(false);
 const [selectedId,setSelectedId]=useState<string|null>(null);const [preview,setPreview]=useState<Work|PublicProfile|null>(null);const [previewLoading,setPreviewLoading]=useState(false);
 // Status recheck only removes a just-reviewed row immediately; query filtering/order is server-side.
 const visible=items.filter(item=>filter==="all"||item.status===filter);
 const [total,setTotal]=useState(0);const [typeCounts,setTypeCounts]=useState({all:0,work:0,user:0});
 const selected=visible.find(item=>item.report_id===selectedId)??null;
 useEffect(()=>{setPreview(null);if(!selected){setPreviewLoading(false);return;}let active=true;setPreviewLoading(true);const request=selected.target_work_id?getWork(selected.target_work_id):getPublicProfile(selected.target_user_id);request.then(value=>{if(active)setPreview(value);}).catch(()=>undefined).finally(()=>{if(active)setPreviewLoading(false);});return()=>{active=false;};},[selected?.report_id]);
 const generation=useRef(0);
 async function load(append=false,live=false){
  const next=append?cursor:undefined;if(append&&next===null)return;
  const request=++generation.current;
  setLoadingMore(append);if(!live)setLoading(!append);setError("");
  try{
   const pages=live?Math.max(1,Math.ceil(items.length/25)):1;
   const fetched:ReportItem[]=[];let offset=next??0;let nextCursor:number|null=null;
   for(let index=0;index<pages;index++){
    const page=await getReports(filter==="all"?undefined:filter,offset,{targetType:type==="all"?undefined:type,reasonCode:reason==="all"?undefined:reason,sort:oldest?"oldest":"newest"});
    if(request!==generation.current)return;
    fetched.push(...page.items);nextCursor=page.next_cursor;
    if(nextCursor!==null&&nextCursor<=offset)nextCursor=null;
    setTotal(page.total??0);if(page.type_counts)setTypeCounts(page.type_counts);
    if(nextCursor===null)break;offset=nextCursor;
   }
   setItems(current=>Array.from(new Map([...(append?current:[]),...fetched].map(item=>[item.report_id,item])).values()));setCursor(nextCursor);
  }catch{if(request===generation.current)setError(t("reports.loadFailed"));}
  finally{if(request===generation.current){setLoading(false);setLoadingMore(false);}}
 }
 useEffect(()=>{setSelectedId(null);setItems([]);setCursor(null);setTotal(0);setTypeCounts({all:0,work:0,user:0});if(canManage)void load();return()=>{generation.current++;};},[canManage,filter,type,reason,oldest,session?.userId]);
 useReportsLive(()=>void load(false,true),canManage);
 if(!session)return <Navigate replace to={`/${language}/login`}/>;if(!canManage)return <Navigate replace to={`/${language}`}/>;
 async function update(item:ReportItem,status:Exclude<ReportStatus,"pending">){setBusy(item.report_id);setError("");setNotice("");try{await reviewReport(item.report_id,status);setItems(current=>current.map(entry=>entry.report_id===item.report_id?{...entry,status}:entry));setNotice(t("reports.updated"));}catch{setError(t("reports.actionFailed"));}finally{setBusy(null)}}
 async function removeWork(item:ReportItem){if(!item.target_work_id||!window.confirm(t("reports.confirmDeleteWork")))return;setBusy(item.report_id);setError("");try{await deleteWorkAsModerator(item.target_work_id,`${t(`reports.reason.${item.reason_code}` as TranslationKey)}${item.details?`: ${item.details}`:""}`);await reviewReport(item.report_id,"actioned");setItems(current=>current.map(entry=>entry.report_id===item.report_id?{...entry,status:"actioned"}:entry));setNotice(t("reports.workDeleted"));}catch{setError(t("reports.actionFailed"));}finally{setBusy(null)}}
 async function suspendUser(item:ReportItem){if(!window.confirm(t("reports.confirmSuspendUser").replace("{name}",item.target_user_name)))return;setBusy(item.report_id);setError("");try{await setManagedUserStatus(item.target_user_id,false);await reviewReport(item.report_id,"actioned");setItems(current=>current.map(entry=>entry.report_id===item.report_id?{...entry,status:"actioned"}:entry));setNotice(t("reports.userSuspended"));}catch{setError(t("reports.actionFailed"));}finally{setBusy(null)}}
 async function restrictReporter(item:ReportItem){
  const blocked=!item.reporter_reporting_blocked;
  if(!window.confirm(t(blocked?"reports.confirmBlockReporter":"reports.confirmUnblockReporter").replace("{name}",item.reporter_name)))return;
  setBusy(item.report_id);setError("");setNotice("");
  try{await setReporterRestriction(item.reporter_user_id,blocked);setItems(current=>current.map(report=>report.reporter_user_id===item.reporter_user_id?{...report,reporter_reporting_blocked:blocked}:report));setNotice(t("reports.restrictionUpdated"));}
  catch{setError(t("reports.actionFailed"));}finally{setBusy(null);}
 }
 const date=(value:string)=>new Intl.DateTimeFormat(language,{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
 const workPreview=preview&&"work_id" in preview?preview:null;
 const profilePreview=preview&&"avatar_url" in preview?preview:null;
 return <main className="admin-page reports-admin-page app-page-with-sidebar"><AppSidebar/><section className="admin-shell">
 <header className="admin-hero"><div><span><Flag size={17}/>{t("reports.adminArea")}</span><h1>{t("reports.adminTitle")}</h1><p>{t("reports.adminDescription")}</p></div><button className="admin-refresh" type="button" disabled={loading} onClick={()=>void load()}><RefreshCw size={18} className={loading?"spin":""}/>{t("admin.refresh")}</button></header>
 <section className="moderation-dashboard" aria-label={t("reports.queue")}>
 <div className="moderation-toolbar"><div className="moderation-tabs" role="group" aria-label={t("reports.filterType")}>{(["all","work","user"] as const).map(value=><button key={value} type="button" className={type===value?"active":""} aria-pressed={type===value} onClick={()=>setType(value)}>{t(`reports.type.${value}`)}<span>{typeCounts[value]}</span></button>)}</div><div className="moderation-filters"><select aria-label={t("reports.reason")} value={reason} onChange={event=>setReason(event.target.value)}><option value="all">{t("reports.allReasons")}</option>{["harassment","hate_speech","sexual_content","violence","spam","copyright","impersonation","other"].map(value=><option key={value} value={value}>{t(`reports.reason.${value}` as TranslationKey)}</option>)}</select><select aria-label={t("reports.filterStatus")} value={filter} onChange={event=>setFilter(event.target.value as Filter)}><option value="all">{t("reports.status.all")}</option>{(["pending","reviewed","dismissed","actioned"] as ReportStatus[]).map(value=><option key={value} value={value}>{t(`reports.status.${value}` as TranslationKey)}</option>)}</select><select aria-label={t("reports.sort")} value={oldest?"oldest":"newest"} onChange={event=>setOldest(event.target.value==="oldest")}><option value="newest">{t("reports.newest")}</option><option value="oldest">{t("reports.oldest")}</option></select></div></div>
 {!selected&&notice&&<p className="admin-notice" role="status"><CheckCircle2 size={17}/>{notice}</p>}{!selected&&error&&<p className="admin-error" role="alert">{error}</p>}
 <div className="moderation-layout"><div className="moderation-table-panel">
 {loading?<p className="reports-state" role="status">{t("reports.loading")}</p>:error&&visible.length===0?null:visible.length===0?<div className="admin-empty"><Flag size={34}/><h3>{t("reports.empty")}</h3><p>{t("reports.emptyDescription")}</p></div>:<div className="moderation-table-scroll"><table className="moderation-table"><thead><tr><th>{t("reports.report")}</th><th>{t("reports.typeLabel")}</th><th>{t("reports.reason")}</th><th>{t("reports.reporter")}</th><th>{t("reports.date")}</th><th>{t("reports.statusLabel")}</th></tr></thead><tbody>{visible.map(item=><tr key={item.report_id} className={selectedId===item.report_id?"selected":""} onClick={event=>{event.currentTarget.querySelector<HTMLButtonElement>(".moderation-target")?.focus({preventScroll:true});setSelectedId(item.report_id);}}><td><button type="button" className="moderation-target" aria-haspopup="dialog" aria-pressed={selectedId===item.report_id} onClick={()=>setSelectedId(item.report_id)}><span className={`moderation-target-icon ${item.target_type}`}><ReportThumbnail item={item}/></span><span><strong>{item.target_type==="work"?item.target_work_title??t("reports.unavailable"):item.target_user_name}</strong><small>{item.target_type==="work"?item.target_user_name:t("reports.reportedUser")}</small></span></button></td><td><span className={`moderation-type ${item.target_type}`}>{item.target_type==="work"?<FileImage size={18}/>:<UserRound size={18}/>}<small>{t(`reports.typeLabel.${item.target_type}`)}</small></span></td><td><span className={`moderation-reason ${item.reason_code}`}>{t(`reports.reason.${item.reason_code}` as TranslationKey)}</span>{item.details&&<p className="moderation-excerpt">{item.details}</p>}</td><td><Link onClick={event=>event.stopPropagation()} className="moderation-reporter" to={`/${language}/profile/${item.reporter_user_id}`}><span>{item.reporter_name.charAt(0).toLocaleUpperCase(language)}</span>{item.reporter_name}</Link></td><td><time>{date(item.created_at)}</time></td><td><span className={`report-status ${item.status}`}>{t(`reports.status.${item.status}` as TranslationKey)}</span></td></tr>)}</tbody></table></div>}
 <footer className="moderation-table-footer"><small>{t("reports.loadedCount").replace("{count}",String(visible.length)).replace("{total}",String(total))}</small>{cursor!==null&&<button className="pagination-load-more" type="button" disabled={loadingMore||loading} onClick={()=>void load(true)}>{t(loadingMore?"reports.loading":"reports.loadMore")}</button>}</footer></div>
 {selected&&<ReportDetailsDialog title={t("reports.detailsTitle")} closeLabel={t("reports.closeDetails")} busy={!!busy} onClose={()=>setSelectedId(null)}>
 {notice&&<p className="admin-notice" role="status"><CheckCircle2 size={17}/>{notice}</p>}{error&&<p className="admin-error" role="alert">{error}</p>}
 {previewLoading?<p role="status">{t("reports.previewLoading")}</p>:workPreview?<img {...artworkImageProtection} className="moderation-preview" src={workPreview.image_url} alt={workPreview.title}/>:profilePreview?.avatar_url?<img className="moderation-profile-preview" src={profilePreview.avatar_url} alt={selected.target_user_name}/>:<div className="moderation-preview-placeholder">{selected.target_type==="work"?<FileImage size={44}/>:<UserRound size={44}/>}</div>}
 <h2>{selected.target_type==="work"?selected.target_work_title??t("reports.unavailable"):selected.target_user_name}</h2><Link className="moderation-owner" to={`/${language}/profile/${selected.target_user_id}`}>{selected.target_user_name}<ExternalLink size={14}/></Link>{workPreview&&<span className="moderation-category">{language==="ar"?workPreview.type_name_ar:workPreview.type_name_en}</span>}
 <section className="moderation-detail-box"><h3>{t("reports.detailsTitle")}</h3><dl><div><dt>{t("reports.reason")}</dt><dd><span className={`moderation-reason ${selected.reason_code}`}>{t(`reports.reason.${selected.reason_code}` as TranslationKey)}</span></dd></div><div><dt>{t("reports.reporter")}</dt><dd>{selected.reporter_name}</dd></div><div><dt>{t("reports.date")}</dt><dd>{date(selected.created_at)}</dd></div><div><dt>{t("reports.statusLabel")}</dt><dd><span className={`report-status ${selected.status}`}>{t(`reports.status.${selected.status}` as TranslationKey)}</span></dd></div></dl><h4>{t("reports.message")}</h4><p className="moderation-message">{selected.details??t("reports.noMessage")}</p>{selected.reviewer_notes&&<p>{selected.reviewer_notes}</p>}</section>
 <div className="moderation-view-links">{selected.target_work_id&&<Link to={`/${language}?work=${selected.target_work_id}`}><ExternalLink size={15}/>{t("reports.viewPost")}</Link>}<Link to={`/${language}/profile/${selected.target_user_id}`}><UserRound size={15}/>{t("reports.viewProfile")}</Link></div>
 {selected.reporter_can_be_restricted&&selected.reporter_user_id!==session.userId&&<section className="moderation-detail-box"><h3>{t("reports.reporter")}: {selected.reporter_name}</h3><div className="moderation-actions"><button type="button" className={selected.reporter_reporting_blocked?undefined:"danger"} disabled={!!busy} onClick={()=>void restrictReporter(selected)}><ShieldBan size={16}/>{t(selected.reporter_reporting_blocked?"reports.unblockReporter":"reports.blockReporter")}</button></div></section>}
 <section className="moderation-detail-box"><h3>{t("reports.actions")}</h3><div className="moderation-actions"><button type="button" disabled={!!busy} onClick={()=>void update(selected,"reviewed")}><CheckCircle2 size={16}/>{t("reports.markReviewed")}</button><button type="button" disabled={!!busy} onClick={()=>void update(selected,"dismissed")}><X size={16}/>{t("reports.dismiss")}</button>{selected.target_work_id&&hasPermission(session.permissions,"works.delete_any")&&<button type="button" className="danger" disabled={!!busy} onClick={()=>void removeWork(selected)}><Trash2 size={16}/>{t("reports.deleteWork")}</button>}{hasPermission(session.permissions,"users.status.manage")&&<button type="button" className="danger" disabled={!!busy} onClick={()=>void suspendUser(selected)}><ShieldBan size={16}/>{t("reports.suspendUser")}</button>}</div></section>
 </ReportDetailsDialog>}</div><p className="moderation-scope-note">{t("reports.loadedScope")}</p></section></section></main>;
}
