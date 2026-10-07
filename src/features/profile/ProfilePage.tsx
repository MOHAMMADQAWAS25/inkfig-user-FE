import { Bookmark, Camera, Heart, Image, LogOut, MoreHorizontal, Pencil, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { useI18n } from "../../i18n/I18nProvider";
import type { TranslationKey } from "../../i18n/resources";
import { hasPermission } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { ArtworkDetailModal } from "../home/ArtworkDetailModal";
import { AppSidebar } from "../navigation/AppSidebar";
import {
  deleteWork, deleteWorkAsModerator, getLikedWorks, getSavedWorks, getUserWorks, getWorkTypes, setWorkLike,
  setWorkSave, updateWork, type Work, type WorkLink, type WorkPage, type WorkType,
} from "../works/worksApi";
import { workTypeTone } from "../works/workTypePresentation";
import {
  getProfileConnections, getPublicProfile, setProfileFollow,
  type ProfileAccount, type PublicProfile,
} from "./profileApi";
import { isValidProfileAvatar, PROFILE_AVATAR_ACCEPT, uploadProfileAvatar } from "./profileAvatarUpload";

type Section = "posts" | "likes" | "saved";
type PageCursors = Record<Section,string|null>;

function ArtworkGrid({ canLike, canManage, canSave, empty, language, onDelete, onEdit, onLike, onSave, onSelect, t, works }: {
  canLike:boolean; canManage:boolean; canSave:boolean; empty:string; language:string;
  onDelete:(work:Work)=>void; onEdit:(work:Work)=>void;
  onLike:(work:Work)=>void; onSave:(work:Work)=>void; onSelect:(work:Work)=>void;
  t:(key:TranslationKey)=>string; works:Work[];
}) {
  if (!works.length) return <div className="profile-empty"><Image size={30}/><p>{empty}</p></div>;
  return <div className="profile-artwork-grid">{works.map(work=>
    <article className={`artwork-card ${canManage?"artwork-card-manageable":""}`} key={work.work_id}><div className="artwork-pin-media">
      <button className="artwork-image-button" type="button" aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={()=>onSelect(work)}><img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy"/></button>
      <span className={`artwork-type-tag artwork-card-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language === "ar" ? work.type_name_ar : work.type_name_en}</span>
      <Link className="artwork-artist-link" to={`/${language}/profile/${work.owner_user_id}`}><UserRound size={15}/>{work.artist_name}</Link>
      <button className={`artwork-pin-like ${work.liked_by_me?"liked":""}`} disabled={!canLike} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>onLike(work)}><Heart size={18} fill={work.liked_by_me?"currentColor":"none"}/><span>{work.like_count}</span></button>
      {canSave&&<button className={`artwork-pin-save ${work.saved_by_me?"saved":""}`} aria-label={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} type="button" onClick={()=>onSave(work)}><Bookmark size={21} fill={work.saved_by_me?"currentColor":"none"}/></button>}
    </div>{canManage&&<details className="artwork-owner-menu"><summary aria-label={t("works.managePost")} title={t("works.managePost")}><MoreHorizontal size={19}/></summary><div><button type="button" onClick={()=>onEdit(work)}><Pencil size={16}/>{t("works.editPost")}</button><button className="danger" type="button" onClick={()=>onDelete(work)}><Trash2 size={16}/>{t("works.deletePost")}</button></div></details>}</article>)}</div>;
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
  const [loadingMore,setLoadingMore]=useState(false);
  const [paginationFailed,setPaginationFailed]=useState(false);
  const [cursors,setCursors]=useState<PageCursors>({posts:null,likes:null,saved:null});
  const [failed,setFailed]=useState(false);
  const [avatarError,setAvatarError]=useState(false);
  const [workTypes,setWorkTypes]=useState<WorkType[]>([]);
  const [editing,setEditing]=useState<Work|null>(null);
  const [editTitle,setEditTitle]=useState("");
  const [editDescription,setEditDescription]=useState("");
  const [editTypeId,setEditTypeId]=useState("");
  const [editLinks,setEditLinks]=useState<WorkLink[]>([]);
  const [mutationBusy,setMutationBusy]=useState(false);
  const [mutationError,setMutationError]=useState(false);
  const avatarInputRef=useRef<HTMLInputElement>(null);
  const selected=[...posts,...likes,...saved].find(work=>work.work_id===selectedId)??null;

  useEffect(()=>{
    if(!session||!profileUserId)return;
    setLoading(true);setFailed(false);
    const requests:Promise<unknown>[]=[getPublicProfile(profileUserId),getUserWorks(profileUserId)];
    if(ownProfile)requests.push(getLikedWorks(),getSavedWorks());
    Promise.all(requests).then(([details,works,liked={items:[],next_cursor:null},savedWorks={items:[],next_cursor:null}])=>{
      const postsPage=works as WorkPage;const likesPage=liked as WorkPage;const savedPage=savedWorks as WorkPage;
      setProfile(details as PublicProfile);setPosts(postsPage.items);
      setLikes(likesPage.items);setSaved(savedPage.items);
      setCursors({posts:String(postsPage.next_cursor??"")||null,likes:String(likesPage.next_cursor??"")||null,saved:String(savedPage.next_cursor??"")||null});
    }).catch(()=>setFailed(true)).finally(()=>setLoading(false));
  },[ownProfile,profileUserId,session]);
  useEffect(()=>{const value=searchParams.get("section");if(ownProfile&&(value==="posts"||value==="likes"||value==="saved"))setSection(value);if(!ownProfile)setSection("posts");},[ownProfile,searchParams]);
  useEffect(()=>{setAvatarError(false);},[profileUserId]);
  useEffect(()=>{if(ownProfile)void getWorkTypes().then(setWorkTypes).catch(()=>setWorkTypes([]));},[ownProfile]);
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
  async function loadMore(){const cursor=cursors[section];if(!cursor||loadingMore)return;setLoadingMore(true);setPaginationFailed(false);try{const page=section==="posts"?await getUserWorks(profileUserId,cursor):section==="likes"?await getLikedWorks(cursor):await getSavedWorks(cursor);const append=(current:Work[])=>{const known=new Set(current.map(work=>work.work_id));return [...current,...page.items.filter(work=>!known.has(work.work_id))];};if(section==="posts")setPosts(append);else if(section==="likes")setLikes(append);else setSaved(append);setCursors(current=>({...current,[section]:String(page.next_cursor??"")||null}));}catch{setPaginationFailed(true);}finally{setLoadingMore(false)}}
  function selectSection(next:Section){setSection(next);setSearchParams(next==="posts"?{}:{section:next},{replace:true});}
  async function changeAvatar(file:File|undefined){if(!file||!isValidProfileAvatar(file)){setAvatarError(Boolean(file));return;}try{const avatar_url=await uploadProfileAvatar(file);setProfile(current=>current?{...current,avatar_url}:current);setAvatarError(false);}catch{setAvatarError(true);}finally{if(avatarInputRef.current)avatarInputRef.current.value="";}}
  function beginEdit(work:Work){setEditing(work);setEditTitle(work.title);setEditDescription(work.description);setEditTypeId(work.type_id);setEditLinks(work.links.length?work.links:[{url:"",label:null}]);setMutationError(false);}
  async function saveEdit(event:React.FormEvent){event.preventDefault();if(!editing||mutationBusy)return;setMutationBusy(true);setMutationError(false);try{await updateWork(editing.work_id,{typeId:editTypeId,title:editTitle,description:editDescription,links:editLinks});const type=workTypes.find(item=>item.type_id===editTypeId);const update=(work:Work):Work=>work.work_id===editing.work_id?{...work,title:editTitle.trim(),description:editDescription.trim(),type_id:editTypeId,type_name_en:type?.name_en??work.type_name_en,type_name_ar:type?.name_ar??work.type_name_ar,links:editLinks.filter(link=>link.url.trim()).map(link=>({url:link.url.trim(),label:link.label?.trim()||null}))}:work;setPosts(current=>current.map(update));setLikes(current=>current.map(update));setSaved(current=>current.map(update));setEditing(null);}catch{setMutationError(true);}finally{setMutationBusy(false);}}
  async function removeWork(work:Work){if(mutationBusy||!window.confirm(t("works.deleteConfirm")))return;setMutationBusy(true);setMutationError(false);try{await deleteWork(work.work_id);const remove=(items:Work[])=>items.filter(item=>item.work_id!==work.work_id);setPosts(remove);setLikes(remove);setSaved(remove);if(selectedId===work.work_id)setSelectedId(null);}catch{setMutationError(true);}finally{setMutationBusy(false);}}
  async function moderateDelete(work:Work,reason:string){await deleteWorkAsModerator(work.work_id,reason);const remove=(items:Work[])=>items.filter(item=>item.work_id!==work.work_id);setPosts(remove);setLikes(remove);setSaved(remove);setSelectedId(null);}
  const activeWorks=section==="posts"?posts:section==="likes"?likes:saved;
  const empty=section==="posts"?t("profile.noPosts"):section==="likes"?t("profile.noLikes"):t("profile.noSaved");

  return <main className="profile-page app-page-with-sidebar"><AppSidebar/>
    {loading?<p className="profile-state">{t("profile.loading")}</p>:failed||!profile?<p className="profile-state error-message">{t("profile.loadFailed")}</p>:<>
      <section className="profile-intro"><div className={`profile-avatar ${ownProfile?"editable":""}`}>{profile.avatar_url?<img src={profile.avatar_url} alt=""/>:<span aria-hidden="true">{profile.full_name.trim().charAt(0).toUpperCase()}</span>}{ownProfile&&<><button type="button" aria-label={t("profile.changePicture")} title={t("profile.changePicture")} onClick={()=>avatarInputRef.current?.click()}><Camera aria-hidden="true" size={24}/><span>{t("profile.changePicture")}</span></button><input ref={avatarInputRef} className="sr-only" type="file" accept={PROFILE_AVATAR_ACCEPT} onChange={event=>void changeAvatar(event.target.files?.[0])}/></>}</div><div className="profile-identity"><div className="profile-name-row"><h1>{profile.full_name}</h1></div>{avatarError&&<p className="profile-avatar-error" role="alert">{t("profile.pictureError")}</p>}<div className="profile-social-stats">
        <button type="button" onClick={()=>openConnections("followers")}><strong>{profile.follower_count}</strong><span>{t("profile.followers")}</span></button>
        <button type="button" onClick={()=>openConnections("following")}><strong>{profile.following_count}</strong><span>{t("profile.following")}</span></button>
        <div><strong>{profile.like_count}</strong><span>{t("profile.totalLikes")}</span></div>
      </div></div>{ownProfile?<button className="profile-logout" type="button" onClick={signOut}><LogOut aria-hidden="true" size={18}/>{t("nav.logout")}</button>:<button className={`profile-follow-button ${profile.is_following?"following":""}`} disabled={followBusy===profile.user_id} type="button" onClick={toggleProfileFollow}>{t(profile.is_following?"profile.unfollow":"profile.follow")}</button>}</section>
      {ownProfile&&<nav className="profile-tabs" role="tablist" aria-label={t("profile.navigation")}>
        <button role="tab" type="button" aria-selected={section==="posts"} className={section==="posts"?"active":""} onClick={()=>selectSection("posts")}>{t("profile.posts")}<span>{posts.length}</span></button>
        <button role="tab" type="button" aria-selected={section==="saved"} className={section==="saved"?"active":""} onClick={()=>selectSection("saved")}><Bookmark size={16}/>{t("profile.saved")}<span>{saved.length}</span></button>
        <button role="tab" type="button" aria-selected={section==="likes"} className={section==="likes"?"active":""} onClick={()=>selectSection("likes")}>{t("profile.likes")}<span>{likes.length}</span></button>
      </nav>}
      <div className="profile-sections"><ArtworkGrid canLike={hasPermission(session.permissions,"works.like")} canManage={ownProfile&&section==="posts"&&hasPermission(session.permissions,"works.upload")} canSave={hasPermission(session.permissions,"works.save")} empty={empty} language={language} works={activeWorks} onSelect={work=>setSelectedId(work.work_id)} onEdit={beginEdit} onDelete={work=>void removeWork(work)} onLike={toggleLike} onSave={toggleSave} t={t}/>{mutationError&&<p className="pagination-error" role="alert">{t("works.changeFailed")}</p>}{cursors[section]&&<button className="pagination-load-more" type="button" disabled={loadingMore} onClick={loadMore}>{t(loadingMore?"works.loadingMore":"works.loadMore")}</button>}{paginationFailed&&<p className="pagination-error" role="alert">{t("works.loadFailed")}</p>}</div>
    </>}
    {connectionKind&&<div className="profile-connections-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&setConnectionKind(null)}><section className="profile-connections-dialog" role="dialog" aria-modal="true" aria-labelledby="connections-title"><header><h2 id="connections-title">{t(connectionKind==="followers"?"profile.followers":"profile.following")}</h2><button type="button" aria-label={t("profile.closeConnections")} onClick={()=>setConnectionKind(null)}><X size={20}/></button></header>{connectionsLoading?<p>{t("profile.loadingConnections")}</p>:!accounts.length?<p>{t("profile.noConnections")}</p>:<div className="profile-account-list">{accounts.map(account=><div className="profile-account-row" key={account.user_id}><Link to={`/${language}/profile/${account.user_id}`} onClick={()=>setConnectionKind(null)}><span>{account.full_name.charAt(0).toUpperCase()}</span><strong>{account.full_name}</strong></Link>{account.user_id!==session.userId&&<button type="button" disabled={followBusy===account.user_id} className={account.is_following?"following":""} onClick={()=>toggleAccountFollow(account)}>{t(account.is_following?"profile.unfollow":"profile.follow")}</button>}</div>)}</div>}</section></div>}
    {selected&&<ArtworkDetailModal language={language} work={selected} canLike={hasPermission(session.permissions,"works.like")} canSave={hasPermission(session.permissions,"works.save")} canModerateDelete={hasPermission(session.permissions,"works.delete_any")} onClose={()=>setSelectedId(null)} onToggleLike={toggleLike} onToggleSave={toggleSave} onModerateDelete={moderateDelete} t={t}/>}
    {editing&&<div className="work-edit-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&!mutationBusy&&setEditing(null)}><form className="work-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="work-edit-title" onSubmit={saveEdit}><header><h2 id="work-edit-title">{t("works.editPost")}</h2><button type="button" aria-label={t("works.closeEdit")} disabled={mutationBusy} onClick={()=>setEditing(null)}><X size={20}/></button></header><img src={editing.image_url} alt={editing.title}/><p className="work-edit-image-note">{t("works.imageCannotChange")}</p><label>{t("works.title")}<input required maxLength={160} value={editTitle} onChange={event=>setEditTitle(event.target.value)}/></label><label>{t("works.type")}<select required value={editTypeId} onChange={event=>setEditTypeId(event.target.value)}>{workTypes.map(type=><option key={type.type_id} value={type.type_id}>{language==="ar"?type.name_ar:type.name_en}</option>)}</select></label><label>{t("works.description")}<textarea maxLength={2000} value={editDescription} onChange={event=>setEditDescription(event.target.value)}/></label><fieldset><legend>{t("works.links")}</legend>{editLinks.map((link,index)=><div className="work-edit-link" key={index}><input type="text" maxLength={120} placeholder={t("works.linkLabel")} value={link.label??""} onChange={event=>setEditLinks(items=>items.map((item,itemIndex)=>itemIndex===index?{...item,label:event.target.value}:item))}/><input type="url" placeholder={t("works.linkUrl")} value={link.url} onChange={event=>setEditLinks(items=>items.map((item,itemIndex)=>itemIndex===index?{...item,url:event.target.value}:item))}/><button type="button" aria-label={t("works.removeLink")} onClick={()=>setEditLinks(items=>items.filter((_,itemIndex)=>itemIndex!==index))}><X size={17}/></button></div>)}{editLinks.length<10&&<button className="work-edit-add-link" type="button" onClick={()=>setEditLinks(items=>[...items,{url:"",label:null}])}>{t("works.addLink")}</button>}</fieldset>{mutationError&&<p className="error-message" role="alert">{t("works.changeFailed")}</p>}<button className="work-edit-save" type="submit" disabled={mutationBusy||!editTitle.trim()}>{t(mutationBusy?"works.savingChanges":"works.saveChanges")}</button></form></div>}
  </main>;
}
