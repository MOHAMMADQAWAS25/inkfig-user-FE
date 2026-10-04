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

function ProfileArtworkGrid({ empty, id, onSelect, title, works }: { empty:string; id:string; onSelect:(work:Work)=>void; title:string; works:Work[] }) {
  return <section className="profile-collection" aria-labelledby={id}>
    <div className="profile-section-title"><h2 id={id}>{title}</h2><span>{works.length}</span></div>
    {works.length===0?<div className="profile-empty"><Image size={30}/><p>{empty}</p></div>:<div className="profile-artwork-grid">{works.map(work=><button className="profile-artwork" type="button" key={work.work_id} onClick={()=>onSelect(work)}><img src={work.image_url} alt={work.title} loading="lazy"/><span><strong>{work.title}</strong><small><Heart size={14} fill={work.liked_by_me?"currentColor":"none"}/>{work.like_count}</small></span></button>)}</div>}
  </section>;
}

export function ProfilePage() {
  const {session,signOut}=useAuth();
  const {language,t}=useI18n();
  const [posts,setPosts]=useState<Work[]>([]);
  const [likes,setLikes]=useState<Work[]>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  const selected=[...posts,...likes].find(work=>work.work_id===selectedId)??null;

  useEffect(()=>{if(!session)return;setLoading(true);setFailed(false);Promise.all([getMyWorks(session.accessToken),getLikedWorks(session.accessToken)]).then(([own,liked])=>{setPosts(own);setLikes(liked);}).catch(()=>setFailed(true)).finally(()=>setLoading(false));},[session]);
  if(!session)return <Navigate replace to={`/${language}/login`}/>;
  const accessToken=session.accessToken;

  async function toggleLike(work:Work){const next=!work.liked_by_me;const update=(item:Work)=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item;setPosts(current=>current.map(update));setLikes(current=>next?current.map(update):current.filter(item=>item.work_id!==work.work_id));try{await setWorkLike(accessToken,work.work_id,next);}catch{setPosts(current=>current.map(item=>item.work_id===work.work_id?work:item));if(!next)setLikes(current=>[work,...current.filter(item=>item.work_id!==work.work_id)]);}}

  return <main className="profile-page">
    <header className="profile-header"><Link to={`/${language}`}><img src={inkfigLogo} alt={t("app.name")}/></Link><div><ThemeToggle/><Link className="gallery-login-link" to={`/${language}/upload`}><Upload size={16}/>{t("works.upload")}</Link><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></div></header>
    <section className="profile-intro"><div className="profile-avatar" aria-hidden="true">{session.fullName.trim().charAt(0).toUpperCase()}</div><div><p>{t("profile.label")}</p><h1>{session.fullName}</h1><span>{session.email}</span></div></section>
    {loading?<p className="profile-state">{t("profile.loading")}</p>:failed?<p className="profile-state error-message">{t("profile.loadFailed")}</p>:<div className="profile-sections"><ProfileArtworkGrid id="profile-posts" title={t("profile.posts")} empty={t("profile.noPosts")} works={posts} onSelect={work=>setSelectedId(work.work_id)}/><ProfileArtworkGrid id="profile-likes" title={t("profile.likes")} empty={t("profile.noLikes")} works={likes} onSelect={work=>setSelectedId(work.work_id)}/></div>}
    {selected&&<ArtworkDetailModal language={language} work={selected} canLike onClose={()=>setSelectedId(null)} onToggleLike={toggleLike} t={t}/>}
  </main>;
}
