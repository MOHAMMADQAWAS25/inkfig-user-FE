import { Bookmark, Heart, Image, Upload, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import type { TranslationKey } from "../../i18n/resources";
import { hasPermission } from "../../lib/permissions";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "../auth/AuthContext";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { AppSidebar } from "../navigation/AppSidebar";
import {
  getLikedWorks, getSavedWorks, getUserWorks, setWorkLike, setWorkSave, type Work,
} from "../works/worksApi";
import { workTypeTone } from "../works/workTypePresentation";
import {
  getProfileConnections, getPublicProfile, setProfileFollow,
  type ProfileAccount, type PublicProfile,
} from "./profileApi";

type Section = "posts" | "likes" | "saved";

function ArtworkGrid({ canLike, canSave, empty, language, onLike, onSave, onSelect, t, works }: {
  canLike:boolean; canSave:boolean; empty:string; language:string;
  onLike:(work:Work)=>void; onSave:(work:Work)=>void; onSelect:(work:Work)=>void;
  t:(key:TranslationKey)=>string; works:Work[];
}) {
  if (!works.length) return <div className="profile-empty"><Image size={30}/><p>{empty}</p></div>;
  return <div className="profile-artwork-grid">{works.map(work=>
    <article className="artwork-card" key={work.work_id}><div className="artwork-pin-media">
      <button className="artwork-image-button" type="button" aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={()=>onSelect(work)}><img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy"/></button>
      <span className={`artwork-type-tag artwork-card-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language === "ar" ? work.type_name_ar : work.type_name_en}</span>
      <Link className="artwork-artist-link" to={`/${language}/profile/${work.owner_user_id}`}><UserRound size={15}/>{work.artist_name}</Link>
      <button className={`artwork-pin-like ${work.liked_by_me?"liked":""}`} disabled={!canLike} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>onLike(work)}><Heart size={18} fill={work.liked_by_me?"currentColor":"none"}/><span>{work.like_count}</span></button>
      {canSave&&<button className={`artwork-pin-save ${work.saved_by_me?"saved":""}`} aria-label={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} type="button" onClick={()=>onSave(work)}><Bookmark size={21} fill={work.saved_by_me?"currentColor":"none"}/></button>}
    </div></article>)}</div>;
}

export function ProfilePage() {
  const {session,signOut}=useAuth();
  const {language,t}=useI18n();
  const {userId}=useParams();
  const [searchParams,setSearchParams]=useSearchParams();
  const profileUserId=userId??session?.userId??"";
  const ownProfile=Boolean(session&&profileUserId===session.userId);
  const [profile,setProfile]=useState<PublicProfile|null>(null);
  const [posts,setPosts]=useState<Work[]>([]);
  const [likes,setLikes]=useState<Work[]>([]);
  const [saved,setSaved]=useState<Work[]>([]);
  const requested=searchParams.get("section");
  const [section,setSection]=useState<Section>(requested==="likes"||requested==="saved"?requested:"posts");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [connectionKind,setConnectionKind]=useState<"followers"|"following"|null>(null);
  const [accounts,setAccounts]=useState<ProfileAccount[]>([]);
  const [connectionsLoading,setConnectionsLoading]=useState(false);
  const [followBusy,setFollowBusy]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  const selected=[...posts,...likes,...saved].find(work=>work.work_id===selectedId)??null;

  useEffect(()=>{
    if(!session||!profileUserId)return;
    setLoading(true);setFailed(false);
    const requests:Promise<unknown>[]=[getPublicProfile(profileUserId),getUserWorks(profileUserId)];
    if(ownProfile)requests.push(getLikedWorks(),getSavedWorks());
    Promise.all(requests).then(([details,works,liked=[],savedWorks=[]])=>{
      setProfile(details as PublicProfile);setPosts(works as Work[]);
      setLikes(liked as Work[]);setSaved(savedWorks as Work[]);
    }).catch(()=>setFailed(true)).finally(()=>setLoading(false));
  },[ownProfile,profileUserId,session]);
  useEffect(()=>{const value=searchParams.get("section");if(ownProfile&&(value==="posts"||value==="likes"||value==="saved"))setSection(value);if(!ownProfile)setSection("posts");},[ownProfile,searchParams]);
  if(!session)return <Navigate replace to={`/${language}/login`}/>;
  if(!hasPermission(session.permissions,"profile.read_own"))return <Navigate replace to={`/${language}`}/>;

  async function toggleProfileFollow(){
    if(!profile||profile.is_self||followBusy)return;
    const previous=profile;const next=!profile.is_following;setFollowBusy(profile.user_id);
    setProfile({...profile,is_following:next,follower_count:profile.follower_count+(next?1:-1)});
    try{await setProfileFollow(profile.user_id,next);}catch{setProfile(previous);}finally{setFollowBusy(null);}
  }
  async function toggleAccountFollow(account:ProfileAccount){
    if(account.user_id===session?.userId||followBusy)return;
    const next=!account.is_following;setFollowBusy(account.user_id);
    setAccounts(current=>current.map(item=>item.user_id===account.user_id?{...item,is_following:next}:item));
    try{await setProfileFollow(account.user_id,next);}catch{setAccounts(current=>current.map(item=>item.user_id===account.user_id?account:item));}finally{setFollowBusy(null);}
  }
  async function openConnections(kind:"followers"|"following"){
    setConnectionKind(kind);setConnectionsLoading(true);
    try{setAccounts(await getProfileConnections(profileUserId,kind));}catch{setAccounts([]);}finally{setConnectionsLoading(false);}
  }
  async function toggleLike(work:Work){
    const next=!work.liked_by_me;const update=(item:Work)=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item;
    setPosts(current=>current.map(update));setLikes(current=>next?current.map(update):current.filter(item=>item.work_id!==work.work_id));setSaved(current=>current.map(update));
    try{await setWorkLike(work.work_id,next);}catch{setPosts(current=>current.map(item=>item.work_id===work.work_id?work:item));setSaved(current=>current.map(item=>item.work_id===work.work_id?work:item));if(!next)setLikes(current=>[work,...current.filter(item=>item.work_id!==work.work_id)]);}
  }
  async function toggleSave(work:Work){
    const next=!work.saved_by_me;
    try{await setWorkSave(work.work_id,next);const updated={...work,saved_by_me:next};setPosts(current=>current.map(item=>item.work_id===work.work_id?updated:item));setLikes(current=>current.map(item=>item.work_id===work.work_id?updated:item));setSaved(current=>next?(current.some(item=>item.work_id===work.work_id)?current.map(item=>item.work_id===work.work_id?updated:item):[updated,...current]):current.filter(item=>item.work_id!==work.work_id));}catch{return;}
  }
  function selectSection(next:Section){setSection(next);setSearchParams(next==="posts"?{}:{section:next},{replace:true});}
  const activeWorks=section==="posts"?posts:section==="likes"?likes:saved;
  const empty=section==="posts"?t("profile.noPosts"):section==="likes"?t("profile.noLikes"):t("profile.noSaved");

  return <main className="profile-page app-page-with-sidebar"><AppSidebar/>
    <header className="profile-header"><Link to={`/${language}`}><img src={inkfigLogo} alt={t("app.name")}/></Link><div><ThemeToggle/><Link className="gallery-login-link" to={`/${language}/upload`}><Upload size={16}/>{t("works.upload")}</Link><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></div></header>
    {loading?<p className="profile-state">{t("profile.loading")}</p>:failed||!profile?<p className="profile-state error-message">{t("profile.loadFailed")}</p>:<>
      <section className="profile-intro"><div className="profile-avatar" aria-hidden="true">{profile.full_name.trim().charAt(0).toUpperCase()}</div><div className="profile-identity"><p>{t(ownProfile?"profile.label":"profile.communityProfile")}</p><h1>{profile.full_name}</h1><div className="profile-social-stats">
        <button type="button" onClick={()=>openConnections("followers")}><strong>{profile.follower_count}</strong><span>{t("profile.followers")}</span></button>
        <button type="button" onClick={()=>openConnections("following")}><strong>{profile.following_count}</strong><span>{t("profile.following")}</span></button>
        <div><strong>{profile.like_count}</strong><span>{t("profile.totalLikes")}</span></div>
      </div></div>{!ownProfile&&<button className={`profile-follow-button ${profile.is_following?"following":""}`} disabled={followBusy===profile.user_id} type="button" onClick={toggleProfileFollow}>{t(profile.is_following?"profile.unfollow":"profile.follow")}</button>}</section>
      {ownProfile&&<nav className="profile-tabs" role="tablist" aria-label={t("profile.navigation")}>
        <button role="tab" type="button" aria-selected={section==="posts"} className={section==="posts"?"active":""} onClick={()=>selectSection("posts")}>{t("profile.posts")}<span>{posts.length}</span></button>
        <button role="tab" type="button" aria-selected={section==="saved"} className={section==="saved"?"active":""} onClick={()=>selectSection("saved")}><Bookmark size={16}/>{t("profile.saved")}<span>{saved.length}</span></button>
        <button role="tab" type="button" aria-selected={section==="likes"} className={section==="likes"?"active":""} onClick={()=>selectSection("likes")}>{t("profile.likes")}<span>{likes.length}</span></button>
      </nav>}
      <div className="profile-sections"><ArtworkGrid canLike={hasPermission(session.permissions,"works.like")} canSave={hasPermission(session.permissions,"works.save")} empty={empty} language={language} works={activeWorks} onSelect={work=>setSelectedId(work.work_id)} onLike={toggleLike} onSave={toggleSave} t={t}/></div>
    </>}
    {connectionKind&&<div className="profile-connections-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&setConnectionKind(null)}><section className="profile-connections-dialog" role="dialog" aria-modal="true" aria-labelledby="connections-title"><header><h2 id="connections-title">{t(connectionKind==="followers"?"profile.followers":"profile.following")}</h2><button type="button" aria-label={t("profile.closeConnections")} onClick={()=>setConnectionKind(null)}><X size={20}/></button></header>{connectionsLoading?<p>{t("profile.loadingConnections")}</p>:!accounts.length?<p>{t("profile.noConnections")}</p>:<div className="profile-account-list">{accounts.map(account=><div className="profile-account-row" key={account.user_id}><Link to={`/${language}/profile/${account.user_id}`} onClick={()=>setConnectionKind(null)}><span>{account.full_name.charAt(0).toUpperCase()}</span><strong>{account.full_name}</strong></Link>{account.user_id!==session.userId&&<button type="button" disabled={followBusy===account.user_id} className={account.is_following?"following":""} onClick={()=>toggleAccountFollow(account)}>{t(account.is_following?"profile.unfollow":"profile.follow")}</button>}</div>)}</div>}</section></div>}
    {selected&&<ArtworkDetailModal language={language} work={selected} canLike={hasPermission(session.permissions,"works.like")} canSave={hasPermission(session.permissions,"works.save")} onClose={()=>setSelectedId(null)} onToggleLike={toggleLike} onToggleSave={toggleSave} t={t}/>}
  </main>;
}
