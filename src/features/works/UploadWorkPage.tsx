import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CloudUpload, FileText, ImagePlus, Link2, Plus, Trash2, Type, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { getWorkTypes, isValidWorkUrl, uploadWork, validateWorkFile } from "./worksApi";
import type { WorkType } from "./worksApi";
import { hasPermission } from "../../lib/permissions";
import { AppSidebar } from "../navigation/AppSidebar";
import { getEligibleExhibitions, submitWork } from "../exhibitions/exhibitionApi";
import { WorkTypePicker } from "./WorkTypePicker";

export function UploadWorkPage() {
 const {session}=useAuth(); const {language,t}=useI18n(); const navigate=useNavigate();
 const [searchParams]=useSearchParams();const exhibitionId=searchParams.get('exhibition');const [publishedId,setPublishedId]=useState<string|null>(null);
 const fileInputRef=useRef<HTMLInputElement>(null);
 const [previewFile,setPreviewFile]=useState<File|null>(null); const [previewUrl,setPreviewUrl]=useState("");
 const [dragging,setDragging]=useState(false);
 useEffect(()=>{if(!previewFile){setPreviewUrl("");return;}const url=URL.createObjectURL(previewFile);setPreviewUrl(url);return()=>URL.revokeObjectURL(url);},[previewFile]);
 const [types,setTypes]=useState<WorkType[]>([]); const [file,setFile]=useState<File|null>(null); const [typeId,setTypeId]=useState(""); const [title,setTitle]=useState(""); const [description,setDescription]=useState(""); const [links,setLinks]=useState([{label:"",url:""}]); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 useEffect(()=>{getWorkTypes().then(setTypes).catch(()=>setError(t("works.loadFailed")));},[t]);
 const [exhibitionName,setExhibitionName]=useState("");
 const [exhibitionReady,setExhibitionReady]=useState(false);
 useEffect(()=>{setPublishedId(null);setExhibitionName("");setExhibitionReady(false);if(!exhibitionId||!session)return;let active=true;getEligibleExhibitions(0,undefined,exhibitionId).then(page=>{if(!active)return;const item=page.items[0];setExhibitionReady(Boolean(item));if(item)setExhibitionName(item.name);else setError(t("exhibitions.notAvailable"));}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:t("exhibitions.failed"));});return()=>{active=false;};},[exhibitionId,session?.userId,language]);
 if(!session) return <Navigate replace to={`/${language}/login`} />;
 if(!hasPermission(session.permissions,"works.upload")) return <Navigate replace to={`/${language}`} />;
 function fileErrorMessage(selectedFile:File){const issue=validateWorkFile(selectedFile);if(issue==="empty")return t("works.emptyFile");if(issue==="too-large")return t("works.fileTooLarge");if(issue==="unsupported")return t("works.unsupportedFile");return null;}
 function handleFileChange(event:ChangeEvent<HTMLInputElement>){
   const selected=event.target.files?.[0]??null;
   if(selected&&!selectFile(selected))event.target.value="";
 }
 function selectFile(selected:File){
   if(busy)return false;setError("");
   if(selected.type.startsWith("video/")&&selected.size>0){setFile(null);setPreviewFile(selected);setError(t("works.videoPreviewOnly"));return true;}
   const message=fileErrorMessage(selected);
   if(message){setError(message);return false;}
   setFile(selected);setPreviewFile(selected);return true;
 }
 function updateLink(index:number,field:"label"|"url",value:string){setLinks(current=>current.map((link,i)=>i===index?{...link,[field]:value}:link));}
 async function submit(event:FormEvent){event.preventDefault();const used=links.filter(link=>link.url.trim()||link.label.trim());if(used.some(link=>!link.url.trim()||!isValidWorkUrl(link.url))||new Set(used.map(link=>link.url.trim())).size!==used.length){setError(t("works.invalidLink"));return;}if(!file){setError(t("works.selectFile"));return;}const message=fileErrorMessage(file);if(message){setError(message);return;}setBusy(true);setError("");try{if(exhibitionId){const eligible=await getEligibleExhibitions(0,undefined,exhibitionId);if(!eligible.items.length)throw new Error(t("exhibitions.notAvailable"));}const id=publishedId??await uploadWork({typeId,title,description,links:used,file});setPublishedId(id);if(exhibitionId){await submitWork(exhibitionId,id);navigate(`/${language}/exhibition/${exhibitionId}`);}else navigate(`/${language}`);}catch(cause){setError(cause instanceof Error?cause.message:t("works.uploadFailed"));}finally{setBusy(false)}}
 return <main className="upload-page app-page-with-sidebar"><AppSidebar/>
   <form className="upload-workspace form-stack" onSubmit={submit} aria-labelledby="upload-title">
     <section className="upload-card upload-details">
       <header className="upload-heading"><span className="upload-heading-icon"><ImagePlus size={34} aria-hidden="true"/></span><div><h1 id="upload-title">{t("works.uploadTitle")}</h1><p>{t("works.uploadDescription")}</p></div></header>
       <label className="upload-field"><span><Type size={18} aria-hidden="true"/>{t("works.title")} <span aria-hidden="true">*</span></span><input required maxLength={160} value={title} disabled={busy} onChange={event=>setTitle(event.target.value)}/><small className="upload-character-count" aria-hidden="true">{title.length}/160</small></label>
       {types.length ? <WorkTypePicker types={types} value={typeId} onChange={setTypeId} disabled={busy}/> : <p className="form-message error-message" role="status">{t("works.noTypes")}</p>}
       <label className="upload-field"><span><FileText size={18} aria-hidden="true"/>{t("works.description")}</span><textarea maxLength={2000} value={description} disabled={busy} onChange={event=>setDescription(event.target.value)}/><small className="upload-character-count" aria-hidden="true">{description.length}/2000</small></label>
       <fieldset className="work-links-field" disabled={busy}><legend><Link2 size={18} aria-hidden="true"/>{t("works.links")}</legend><small>{t("works.linksOptional")}</small>
         {links.map((link,index)=><div className="work-link-row" key={index}><input aria-label={t("works.linkLabel")} maxLength={120} placeholder={t("works.linkLabel")} value={link.label} onChange={event=>updateLink(index,"label",event.target.value)}/><input aria-label={t("works.linkUrl")} dir="ltr" maxLength={2083} placeholder="https://example.com" type="url" value={link.url} onChange={event=>updateLink(index,"url",event.target.value)}/>{links.length>1&&<button aria-label={t("works.removeLink")} className="icon-button" type="button" onClick={()=>setLinks(current=>current.filter((_,i)=>i!==index))}><Trash2 size={17} aria-hidden="true"/></button>}</div>)}
         {links.length<10&&<button className="text-button add-link-button" type="button" onClick={()=>setLinks(current=>[...current,{label:"",url:""}])}><Plus size={16} aria-hidden="true"/>{t("works.addLink")}</button>}
       </fieldset>
       {error&&<p className="form-message error-message" role="alert">{error}</p>}
       <footer className="upload-actions"><button className="upload-cancel" type="button" disabled={busy} onClick={()=>navigate(exhibitionId?`/${language}/exhibition/${exhibitionId}`:`/${language}`)}><X size={17} aria-hidden="true"/>{t("works.cancelUpload")}</button><button className="primary-button" disabled={busy||!file||!typeId||Boolean(exhibitionId&&!exhibitionReady)} type="submit"><CloudUpload size={18} aria-hidden="true"/>{busy?t("works.uploading"):t(exhibitionId?"exhibitions.submit":"works.publish")}</button></footer>
     </section>
     <aside className="upload-media-panel">
       <div className="work-file-field" data-dragging={dragging} onDragOver={event=>{event.preventDefault();if(!busy)setDragging(true);}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDragging(false);}} onDrop={event=>{event.preventDefault();setDragging(false);const selected=event.dataTransfer.files[0];if(selected)selectFile(selected);}}>
         <label htmlFor="artwork-file"><ImagePlus size={18} aria-hidden="true"/>{t("works.image")}</label>
         <button className="work-file-preview" type="button" disabled={busy} aria-describedby="upload-file-hint" aria-label={previewFile?`${t("works.changeFile")}: ${previewFile.name}`:t("works.chooseFile")} onClick={()=>fileInputRef.current?.click()}>
           {previewUrl?(previewFile?.type.startsWith("video/")?<video src={previewUrl} muted playsInline preload="metadata" aria-label={previewFile.name}/>:<img src={previewUrl} alt={previewFile?.name??""}/>):<span><CloudUpload size={54} aria-hidden="true"/><strong>{t("works.dropFile")}</strong><small>{t("works.browseFile")}</small></span>}
           {previewFile&&<span className="work-file-change">{t("works.changeFile")}</span>}
         </button>
         <input ref={fileInputRef} className="sr-only" tabIndex={-1} id="artwork-file" disabled={busy} accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" type="file" onChange={handleFileChange}/>
         <small id="upload-file-hint">{t("works.fileFormats")}</small>
         {previewFile&&<small className="work-file-name">{previewFile.name} · {(previewFile.size/1024/1024).toFixed(1)} MB</small>}
       </div>
       {exhibitionId&&<div className="exhibition-upload-context"><strong>{exhibitionName||t("exhibitions.loading")}</strong><p>{t("exhibitions.limitHint")}</p><p>{t("exhibitions.pendingHint")}</p></div>}
     </aside>
   </form>
 </main>;
}
