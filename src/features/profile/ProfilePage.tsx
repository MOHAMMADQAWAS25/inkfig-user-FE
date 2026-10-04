import { Heart, Image, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "../auth/AuthContext";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { getLikedWorks, getMyWorks, setWorkLike } from "../works/worksApi";
import type { Work } from "../works/worksApi";

function ProfileArtworkGrid({ empty, onSelect, works }: { empty:string; onSelect:(work:Work)=>void; works:Work[] }) {
  return <div className="profile-collection">
    {works.length===0?<div className="profile-empty"><Image size={30}/><p>{empty}</p></div>:<div className="profile-artwork-grid">{works.map(work=><button className="profile-artwork" type="button" key={work.work_id} onClick={()=>onSelect(work)}><img src={work.image_url} alt={work.title} loading="lazy"/><span><strong>{work.title}</strong><small><Heart size={14} fill={work.liked_by_me?"currentColor":"none"}/>{work.like_count}</small></span></button>)}</div>}
  </div>;
}

export function ProfilePage() {
  const {session,signOut}=useAuth();
  const {language,t}=useI18n();
  const [posts,setPosts]=useState<Work[]>([]);
  const [likes,setLikes]=useState<Work[]>([]);
  const [activeSection,setActiveSection]=useState<"posts"|"likes">("posts");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  const selected=[...posts,...likes].find(work=>work.work_id===selectedId)??null;

  useEffect(()=>{if(!session)return;setLoading(true);setFailed(false);Promise.all([getMyWorks(),getLikedWorks()]).then(([own,liked])=>{setPosts(own);setLikes(liked);}).catch(()=>setFailed(true)).finally(()=>setLoading(false));},[session]);
  if(!session)return <Navigate replace to={`/${language}/login`}/>;

  async function toggleLike(work:Work){const next=!work.liked_by_me;const update=(item:Work)=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item;setPosts(current=>current.map(update));setLikes(current=>next?current.map(update):current.filter(item=>item.work_id!==work.work_id));try{await setWorkLike(work.work_id,next);}catch{setPosts(current=>current.map(item=>item.work_id===work.work_id?work:item));if(!next)setLikes(current=>[work,...current.filter(item=>item.work_id!==work.work_id)]);}}

  return <main className="profile-page">
    <header className="profile-header"><Link to={`/${language}`}><img src={inkfigLogo} alt={t("app.name")}/></Link><div><ThemeToggle/><Link className="gallery-login-link" to={`/${language}/upload`}><Upload size={16}/>{t("works.upload")}</Link><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></div></header>
    <section className="profile-intro"><div className="profile-avatar" aria-hidden="true">{session.fullName.trim().charAt(0).toUpperCase()}</div><div><p>{t("profile.label")}</p><h1>{session.fullName}</h1><span>{session.email}</span></div></section>
    <nav className="profile-tabs" role="tablist" aria-label={t("profile.navigation")}>
      <button id="profile-posts-tab" role="tab" type="button" aria-selected={activeSection==="posts"} aria-controls="profile-posts-panel" className={activeSection==="posts"?"active":""} onClick={()=>setActiveSection("posts")}>{t("profile.posts")}<span>{posts.length}</span></button>
      <button id="profile-likes-tab" role="tab" type="button" aria-selected={activeSection==="likes"} aria-controls="profile-likes-panel" className={activeSection==="likes"?"active":""} onClick={()=>setActiveSection("likes")}>{t("profile.likes")}<span>{likes.length}</span></button>
    </nav>
    {loading?<p className="profile-state">{t("profile.loading")}</p>:failed?<p className="profile-state error-message">{t("profile.loadFailed")}</p>:<div className="profile-sections">{activeSection==="posts"?<div id="profile-posts-panel" role="tabpanel" aria-labelledby="profile-posts-tab"><ProfileArtworkGrid empty={t("profile.noPosts")} works={posts} onSelect={work=>setSelectedId(work.work_id)}/></div>:<div id="profile-likes-panel" role="tabpanel" aria-labelledby="profile-likes-tab"><ProfileArtworkGrid empty={t("profile.noLikes")} works={likes} onSelect={work=>setSelectedId(work.work_id)}/></div>}</div>}
    {selected&&<ArtworkDetailModal language={language} work={selected} canLike onClose={()=>setSelectedId(null)} onToggleLike={toggleLike} t={t}/>}
  </main>;
}
