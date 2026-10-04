import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { getWorkTypes, isValidWorkUrl, uploadWork, validateWorkFile } from "./worksApi";
import type { WorkType } from "./worksApi";

export function UploadWorkPage() {
 const {session}=useAuth(); const {language,t}=useI18n(); const navigate=useNavigate();
 const [types,setTypes]=useState<WorkType[]>([]); const [file,setFile]=useState<File|null>(null); const [typeId,setTypeId]=useState(""); const [title,setTitle]=useState(""); const [description,setDescription]=useState(""); const [externalUrl,setExternalUrl]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 useEffect(()=>{getWorkTypes().then(setTypes).catch(()=>setError(t("works.loadFailed")));},[t]);
 if(!session) return <Navigate replace to={`/${language}/login`} />;
 function fileErrorMessage(selectedFile:File){const issue=validateWorkFile(selectedFile);if(issue==="empty")return t("works.emptyFile");if(issue==="too-large")return t("works.fileTooLarge");if(issue==="unsupported")return t("works.unsupportedFile");return null;}
 function handleFileChange(event:ChangeEvent<HTMLInputElement>){const selected=event.target.files?.[0]??null;if(!selected){setFile(null);return;}const message=fileErrorMessage(selected);if(message){setFile(null);setError(message);event.target.value="";return;}setFile(selected);setError("");}
 async function submit(event:FormEvent){event.preventDefault();if(!isValidWorkUrl(externalUrl)){setError(t("works.invalidLink"));return;}if(!file){setError(t("works.selectFile"));return;}const message=fileErrorMessage(file);if(message){setError(message);return;}setBusy(true);setError("");try{await uploadWork(session!.accessToken,{typeId,title,description,externalUrl,file});navigate(`/${language}`);}catch{setError(t("works.uploadFailed"));}finally{setBusy(false)}}
 return <main className="upload-page"><section className="upload-card"><Link to={`/${language}`}>{t("works.backHome")}</Link><h1>{t("works.uploadTitle")}</h1><p>{t("works.uploadDescription")}</p>{types.length===0?<div className="form-message error-message">{t("works.noTypes")}</div>:<form className="form-stack" onSubmit={submit}><label><span>{t("works.title")}</span><input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label><label><span>{t("works.type")}</span><select required value={typeId} onChange={e=>setTypeId(e.target.value)}><option value="">{t("works.chooseType")}</option>{types.map(type=><option key={type.type_id} value={type.type_id}>{language==="ar"?type.name_ar:type.name_en}</option>)}</select></label><label><span>{t("works.description")}</span><textarea maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}/></label><label><span>{t("works.link")}</span><input maxLength={2083} placeholder="https://example.com" type="url" value={externalUrl} onChange={e=>setExternalUrl(e.target.value)}/><small>{t("works.linkOptional")}</small></label><label><span>{t("works.image")}</span><input required accept="image/jpeg,image/png,image/webp,image/gif" type="file" onChange={handleFileChange}/></label>{error&&<p className="form-message error-message">{error}</p>}<button className="primary-button" disabled={busy} type="submit">{busy?t("works.uploading"):t("works.publish")}</button></form>}</section></main>;
}
