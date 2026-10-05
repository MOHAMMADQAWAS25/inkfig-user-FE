import { Bookmark, Heart, Image, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "../auth/AuthContext";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { getLikedWorks, getMyWorks, getSavedWorks, setWorkLike } from "../works/worksApi";
import type { Work } from "../works/worksApi";
import { hasPermission } from "../../lib/permissions";

const profileTypeTones:Record<string,string>={"digital art":"violet","hand art":"terracotta",video:"crimson",audio:"teal",animation:"amber",games:"blue","interactive art":"emerald",interactive:"emerald","virtual and augmented reality":"magenta","vr/ar":"magenta"};
const profileFallbackTones=["violet","terracotta","crimson","teal","amber","blue","emerald","magenta"] as const;
function profileWorkTypeTone(work:Work):string{const name=work.type_name_en.trim().toLowerCase();if(profileTypeTones[name])return profileTypeTones[name];const hash=[...work.type_id].reduce((value,character)=>(value*31+character.charCodeAt(0))>>>0,0);return profileFallbackTones[hash%profileFallbackTones.length];}

function ProfileArtworkGrid({ empty, language, onSelect, savedCollection=false, works }: { empty:string; language:"ar"|"en"; onSelect:(work:Work)=>void; savedCollection?:boolean; works:Work[] }) {
  return <div className="profile-collection">
    {works.length===0?<div className="profile-empty"><Image size={30}/><p>{empty}</p></div>:<div className="profile-artwork-grid">{works.map(work=><button className="profile-artwork" type="button" key={work.work_id} onClick={()=>onSelect(work)}><img src={work.image_url} alt={work.title} loading="lazy"/><span className={`artwork-type-tag artwork-type-tag--${profileWorkTypeTone(work)}`}>{language==="ar"?work.type_name_ar:work.type_name_en}</span><span className="profile-artwork-details"><strong>{work.title}</strong><small className={savedCollection?"saved":""}>{savedCollection?<Bookmark size={14} fill="currentColor"/>:<><Heart size={14} fill={work.liked_by_me?"currentColor":"none"}/>{work.like_count}</>}</small></span></button>)}</div>}
  </div>;
}

export function ProfilePage() {
  const {session,signOut}=useAuth();
  const {language,t}=useI18n();
  const [posts,setPosts]=useState<Work[]>([]);
  const [likes,setLikes]=useState<Work[]>([]);
  const [saved,setSaved]=useState<Work[]>([]);
  const [activeSection,setActiveSection]=useState<"posts"|"likes"|"saved">("posts");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  const selected=[...posts,...likes,...saved].find(work=>work.work_id===selectedId)??null;

  useEffect(()=>{if(!session)return;setLoading(true);setFailed(false);Promise.all([getMyWorks(),getLikedWorks(),getSavedWorks()]).then(([own,liked,savedWorks])=>{setPosts(own);setLikes(liked);setSaved(savedWorks);}).catch(()=>setFailed(true)).finally(()=>setLoading(false));},[session]);
  if(!session)return <Navigate replace to={`/${language}/login`}/>;
  if(!hasPermission(session.permissions,"profile.read_own"))return <Navigate replace to={`/${language}`}/>;

  async function toggleLike(work:Work){const next=!work.liked_by_me;const update=(item:Work)=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item;setPosts(current=>current.map(update));setLikes(current=>next?current.map(update):current.filter(item=>item.work_id!==work.work_id));setSaved(current=>current.map(update));try{await setWorkLike(work.work_id,next);}catch{setPosts(current=>current.map(item=>item.work_id===work.work_id?work:item));setSaved(current=>current.map(item=>item.work_id===work.work_id?work:item));if(!next)setLikes(current=>[work,...current.filter(item=>item.work_id!==work.work_id)]);}}
  const activeWorks=activeSection==="posts"?posts:activeSection==="likes"?likes:saved;
  const activeEmpty=activeSection==="posts"?t("profile.noPosts"):activeSection==="likes"?t("profile.noLikes"):t("profile.noSaved");

  return <main className="profile-page">
    <header className="profile-header"><Link to={`/${language}`}><img src={inkfigLogo} alt={t("app.name")}/></Link><div><ThemeToggle/><Link className="gallery-login-link" to={`/${language}/upload`}><Upload size={16}/>{t("works.upload")}</Link><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></div></header>
    <section className="profile-intro"><div className="profile-avatar" aria-hidden="true">{session.fullName.trim().charAt(0).toUpperCase()}</div><div><p>{t("profile.label")}</p><h1>{session.fullName}</h1><span>{session.email}</span></div></section>
    <nav className="profile-tabs" role="tablist" aria-label={t("profile.navigation")}>
      <button id="profile-posts-tab" role="tab" type="button" aria-selected={activeSection==="posts"} aria-controls="profile-posts-panel" className={activeSection==="posts"?"active":""} onClick={()=>setActiveSection("posts")}>{t("profile.posts")}<span>{posts.length}</span></button>
      <button id="profile-likes-tab" role="tab" type="button" aria-selected={activeSection==="likes"} aria-controls="profile-likes-panel" className={activeSection==="likes"?"active":""} onClick={()=>setActiveSection("likes")}>{t("profile.likes")}<span>{likes.length}</span></button>
      <button id="profile-saved-tab" role="tab" type="button" aria-selected={activeSection==="saved"} aria-controls="profile-saved-panel" className={activeSection==="saved"?"active":""} onClick={()=>setActiveSection("saved")}><Bookmark aria-hidden="true" size={16}/>{t("profile.saved")}<span>{saved.length}</span></button>
    </nav>
    {loading?<p className="profile-state">{t("profile.loading")}</p>:failed?<p className="profile-state error-message">{t("profile.loadFailed")}</p>:<div className="profile-sections"><div id={`profile-${activeSection}-panel`} role="tabpanel" aria-labelledby={`profile-${activeSection}-tab`}><ProfileArtworkGrid empty={activeEmpty} language={language} savedCollection={activeSection==="saved"} works={activeWorks} onSelect={work=>setSelectedId(work.work_id)}/></div></div>}
    {selected&&<ArtworkDetailModal language={language} work={selected} canLike onClose={()=>setSelectedId(null)} onToggleLike={toggleLike} t={t}/>}
  </main>;
}
