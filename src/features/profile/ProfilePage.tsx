import { Bookmark, Heart, Image, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import type { TranslationKey } from "../../i18n/resources";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "../auth/AuthContext";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { getLikedWorks, getMyWorks, getSavedWorks, setWorkLike, setWorkSave } from "../works/worksApi";
import type { Work } from "../works/worksApi";
import { hasPermission } from "../../lib/permissions";
import { AppSidebar } from "../navigation/AppSidebar";

function ProfileArtworkGrid({ canLike, canSave, empty, onSelect, onToggleLike, onToggleSave, t, works }: { canLike:boolean; canSave:boolean; empty:string; onSelect:(work:Work)=>void; onToggleLike:(work:Work)=>void; onToggleSave:(work:Work)=>void; t:(key:TranslationKey)=>string; works:Work[] }) {
  return <div className="profile-collection">
    {works.length===0?<div className="profile-empty"><Image size={30}/><p>{empty}</p></div>:<div className="profile-artwork-grid">{works.map(work=><article className="artwork-card" key={work.work_id}><div className="artwork-pin-media"><button className="artwork-image-button" type="button" aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={()=>onSelect(work)}><img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy"/></button><button className={`artwork-pin-like ${work.liked_by_me?"liked":""}`} disabled={!canLike} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>onToggleLike(work)}><Heart size={18} fill={work.liked_by_me?"currentColor":"none"}/><span>{work.like_count}</span></button>{canSave&&<button className={`artwork-pin-save ${work.saved_by_me?"saved":""}`} aria-label={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} title={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} type="button" onClick={()=>onToggleSave(work)}><Bookmark aria-hidden="true" size={21} fill={work.saved_by_me?"currentColor":"none"}/></button>}</div></article>)}</div>}
  </div>;
}

export function ProfilePage() {
  const {session,signOut}=useAuth();
  const {language,t}=useI18n();
  const [searchParams,setSearchParams]=useSearchParams();
  const [posts,setPosts]=useState<Work[]>([]);
  const [likes,setLikes]=useState<Work[]>([]);
  const [saved,setSaved]=useState<Work[]>([]);
  const requestedSection=searchParams.get("section");
  const [activeSection,setActiveSection]=useState<"posts"|"likes"|"saved">(requestedSection==="likes"||requestedSection==="saved"?requestedSection:"posts");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  const selected=[...posts,...likes,...saved].find(work=>work.work_id===selectedId)??null;

  useEffect(()=>{if(!session)return;setLoading(true);setFailed(false);Promise.all([getMyWorks(),getLikedWorks(),getSavedWorks()]).then(([own,liked,savedWorks])=>{setPosts(own);setLikes(liked);setSaved(savedWorks);}).catch(()=>setFailed(true)).finally(()=>setLoading(false));},[session]);
  useEffect(()=>{const section=searchParams.get("section");if(section==="posts"||section==="likes"||section==="saved")setActiveSection(section);},[searchParams]);
  if(!session)return <Navigate replace to={`/${language}/login`}/>;
  if(!hasPermission(session.permissions,"profile.read_own"))return <Navigate replace to={`/${language}`}/>;

  async function toggleLike(work:Work){const next=!work.liked_by_me;const update=(item:Work)=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item;setPosts(current=>current.map(update));setLikes(current=>next?current.map(update):current.filter(item=>item.work_id!==work.work_id));setSaved(current=>current.map(update));try{await setWorkLike(work.work_id,next);}catch{setPosts(current=>current.map(item=>item.work_id===work.work_id?work:item));setSaved(current=>current.map(item=>item.work_id===work.work_id?work:item));if(!next)setLikes(current=>[work,...current.filter(item=>item.work_id!==work.work_id)]);}}
  async function toggleSave(work:Work){const next=!work.saved_by_me;try{await setWorkSave(work.work_id,next);const updated={...work,saved_by_me:next};setPosts(current=>current.map(item=>item.work_id===work.work_id?updated:item));setLikes(current=>current.map(item=>item.work_id===work.work_id?updated:item));setSaved(current=>next?(current.some(item=>item.work_id===work.work_id)?current.map(item=>item.work_id===work.work_id?updated:item):[updated,...current]):current.filter(item=>item.work_id!==work.work_id));}catch{return;}}
  const activeWorks=activeSection==="posts"?posts:activeSection==="likes"?likes:saved;
  const activeEmpty=activeSection==="posts"?t("profile.noPosts"):activeSection==="likes"?t("profile.noLikes"):t("profile.noSaved");

  function selectSection(section:"posts"|"likes"|"saved"){setActiveSection(section);setSearchParams(section==="posts"?{}:{section},{replace:true});}
  return <main className="profile-page app-page-with-sidebar"><AppSidebar/>
    <header className="profile-header"><Link to={`/${language}`}><img src={inkfigLogo} alt={t("app.name")}/></Link><div><ThemeToggle/><Link className="gallery-login-link" to={`/${language}/upload`}><Upload size={16}/>{t("works.upload")}</Link><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></div></header>
    <section className="profile-intro"><div className="profile-avatar" aria-hidden="true">{session.fullName.trim().charAt(0).toUpperCase()}</div><div><p>{t("profile.label")}</p><h1>{session.fullName}</h1><span>{session.email}</span></div></section>
    <nav className="profile-tabs" role="tablist" aria-label={t("profile.navigation")}>
      <button id="profile-posts-tab" role="tab" type="button" aria-selected={activeSection==="posts"} aria-controls="profile-posts-panel" className={activeSection==="posts"?"active":""} onClick={()=>selectSection("posts")}>{t("profile.posts")}<span>{posts.length}</span></button>
      <button id="profile-likes-tab" role="tab" type="button" aria-selected={activeSection==="likes"} aria-controls="profile-likes-panel" className={activeSection==="likes"?"active":""} onClick={()=>selectSection("likes")}>{t("profile.likes")}<span>{likes.length}</span></button>
      <button id="profile-saved-tab" role="tab" type="button" aria-selected={activeSection==="saved"} aria-controls="profile-saved-panel" className={activeSection==="saved"?"active":""} onClick={()=>selectSection("saved")}><Bookmark aria-hidden="true" size={16}/>{t("profile.saved")}<span>{saved.length}</span></button>
    </nav>
    {loading?<p className="profile-state">{t("profile.loading")}</p>:failed?<p className="profile-state error-message">{t("profile.loadFailed")}</p>:<div className="profile-sections"><div id={`profile-${activeSection}-panel`} role="tabpanel" aria-labelledby={`profile-${activeSection}-tab`}><ProfileArtworkGrid canLike={hasPermission(session.permissions,"works.like")} canSave={hasPermission(session.permissions,"works.save")} empty={activeEmpty} works={activeWorks} onSelect={work=>setSelectedId(work.work_id)} onToggleLike={toggleLike} onToggleSave={toggleSave} t={t}/></div></div>}
    {selected&&<ArtworkDetailModal language={language} work={selected} canLike={hasPermission(session.permissions,"works.like")} canSave={hasPermission(session.permissions,"works.save")} onClose={()=>setSelectedId(null)} onToggleLike={toggleLike} onToggleSave={toggleSave} t={t}/>}
  </main>;
}
