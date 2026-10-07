import { Bookmark, Heart, LogOut, Search, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { getWorks, searchWorks, setWorkLike, setWorkSave } from "../works/worksApi";
import type { Work } from "../works/worksApi";
import { workTypeTone } from "../works/workTypePresentation";
import { ArtworkDetailModal } from "./ArtworkDetailModal";
import { hasPermission } from "../../lib/permissions";
import { AppSidebar } from "../navigation/AppSidebar";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { getPublicProfile, searchProfiles } from "../profile/profileApi";
import type { ProfileSearchResult } from "../profile/profileApi";

const workCategories = [
  { code: "digital-art", label: "home.filter.digitalArt" },
  { code: "hand-art", label: "home.filter.handArt" },
  { code: "video", label: "home.filter.video" },
  { code: "audio", label: "home.filter.audio" },
  { code: "animation", label: "home.filter.animation" },
  { code: "games", label: "home.filter.games" },
  { code: "interactive", label: "home.filter.interactive" },
  { code: "vr-ar", label: "home.filter.vrAr" },
] as const;

export function HomePage() {
  const { session, signOut } = useAuth();
  const { language, t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedAccount,setSelectedAccount]=useState<ProfileSearchResult|null>(null);
  const [submittedAccount,setSubmittedAccount]=useState<ProfileSearchResult|null>(null);
  const [accountSuggestions,setAccountSuggestions]=useState<ProfileSearchResult[]>([]);
  const [accountSearchLoading,setAccountSearchLoading]=useState(false);
  const [activeSuggestion,setActiveSuggestion]=useState(0);
  const [mentionQuery,setMentionQuery]=useState<string|null>(null);
  const [works,setWorks]=useState<Work[]>([]); const [loading,setLoading]=useState(true); const [feedError,setFeedError]=useState(false);
  const [nextCursor,setNextCursor]=useState<string|number|null>(null); const [loadingMore,setLoadingMore]=useState(false);
  const [selectedWorkId,setSelectedWorkId]=useState<string|null>(null);
  const profileMenuRef=useRef<HTMLDetailsElement>(null);
  const searchRef=useRef<HTMLFormElement>(null);
  const [profileAvatar,setProfileAvatar]=useState<string|null>(null);
  const selectedWork=works.find(work=>work.work_id===selectedWorkId)??null;
  const normalizedSearch=submittedSearch.trim();
  function artworkQuery(value:string, account:ProfileSearchResult|null){return account?value.replace(`@${account.full_name}`," ").replace(/\s+/g," ").trim():value.trim();}
  const normalizedArtworkSearch=artworkQuery(normalizedSearch,submittedAccount);
  useEffect(()=>{
    let active=true;
    setLoading(true);setFeedError(false);
    const typeCode=activeCategory === "all" ? undefined : activeCategory;
    const request=normalizedArtworkSearch.length>=2?searchWorks(normalizedArtworkSearch,typeCode,undefined,submittedAccount?.user_id):getWorks(typeCode,undefined,submittedAccount?.user_id);
    request.then(page=>{if(active){setWorks(page.items);setNextCursor(page.next_cursor)}}).catch(()=>{if(active)setFeedError(true)}).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[activeCategory,normalizedArtworkSearch,submittedAccount,session]);
  useEffect(()=>{if(mentionQuery===null||mentionQuery.length<1){setAccountSuggestions([]);setAccountSearchLoading(false);return;}let active=true;setAccountSearchLoading(true);const timer=window.setTimeout(()=>{searchProfiles(mentionQuery).then(items=>{if(active){setAccountSuggestions(items);setActiveSuggestion(0)}}).catch(()=>{if(active)setAccountSuggestions([])}).finally(()=>{if(active)setAccountSearchLoading(false)});},250);return()=>{active=false;window.clearTimeout(timer)};},[mentionQuery]);
  useEffect(()=>{function closeSuggestions(event:PointerEvent){if(event.target instanceof Node&&!searchRef.current?.contains(event.target))setMentionQuery(null);}document.addEventListener("pointerdown",closeSuggestions);return()=>document.removeEventListener("pointerdown",closeSuggestions);},[]);
  useEffect(()=>{function closeProfileMenu(event:PointerEvent){const menu=profileMenuRef.current;if(menu?.open&&event.target instanceof Node&&!menu.contains(event.target))menu.removeAttribute("open");}document.addEventListener("pointerdown",closeProfileMenu);return()=>document.removeEventListener("pointerdown",closeProfileMenu);},[]);
  useEffect(()=>{let active=true;if(!session){setProfileAvatar(null);return;}getPublicProfile(session.userId).then(profile=>{if(active)setProfileAvatar(profile.avatar_url)}).catch(()=>{if(active)setProfileAvatar(null)});return()=>{active=false};},[session]);
  function submitSearch(event:FormEvent<HTMLFormElement>){event.preventDefault();if(mentionQuery!==null&&accountSuggestions.length){selectAccount(accountSuggestions[activeSuggestion]??accountSuggestions[0]);return;}setSubmittedSearch(searchQuery.trim());setSubmittedAccount(selectedAccount);setMentionQuery(null);}
  function updateSearch(event:ChangeEvent<HTMLInputElement>){const value=event.target.value;setSearchQuery(value);let account=selectedAccount;if(account&&!value.includes(`@${account.full_name}`)){account=null;setSelectedAccount(null);}const at=value.lastIndexOf("@");if(at<0||account&&value.includes(`@${account.full_name}`)){setMentionQuery(null);setAccountSuggestions([]);return;}setMentionQuery(value.slice(at+1).trimStart());}
  function selectAccount(account:ProfileSearchResult){const at=searchQuery.lastIndexOf("@");const next=at>=0?`${searchQuery.slice(0,at)}@${account.full_name}`:`${searchQuery} @${account.full_name}`;setSearchQuery(next);setSelectedAccount(account);setMentionQuery(null);setAccountSuggestions([]);}
  function handleSearchKeyDown(event:KeyboardEvent<HTMLInputElement>){if(mentionQuery===null||accountSuggestions.length===0)return;if(event.key==="ArrowDown"){event.preventDefault();setActiveSuggestion(index=>(index+1)%accountSuggestions.length);}else if(event.key==="ArrowUp"){event.preventDefault();setActiveSuggestion(index=>(index-1+accountSuggestions.length)%accountSuggestions.length);}else if(event.key==="Escape"){event.preventDefault();setMentionQuery(null);}else if(event.key==="Enter"){event.preventDefault();selectAccount(accountSuggestions[activeSuggestion]??accountSuggestions[0]);}}
  async function loadMore(){if(nextCursor===null||loadingMore)return;setLoadingMore(true);setFeedError(false);const typeCode=activeCategory==="all"?undefined:activeCategory;try{const page=normalizedArtworkSearch.length>=2?await searchWorks(normalizedArtworkSearch,typeCode,Number(nextCursor),submittedAccount?.user_id):await getWorks(typeCode,String(nextCursor),submittedAccount?.user_id);setWorks(current=>{const known=new Set(current.map(work=>work.work_id));return [...current,...page.items.filter(work=>!known.has(work.work_id))];});setNextCursor(page.next_cursor);}catch{setFeedError(true);}finally{setLoadingMore(false)}}
  async function toggleLike(work:Work){if(!session || !hasPermission(session.permissions,"works.like"))return; const next=!work.liked_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item)); try{await setWorkLike(work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}
  async function toggleSave(work:Work){if(!session || !hasPermission(session.permissions,"works.save"))return; const next=!work.saved_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,saved_by_me:next}:item)); try{await setWorkSave(work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}

  return (
    <main className="gallery-home">
      <AppSidebar />
      <header className="gallery-header">
        <form className="gallery-search" role="search" onSubmit={submitSearch} ref={searchRef}>
          <Search aria-hidden="true" size={19} />
          <label className="sr-only" htmlFor="gallery-search-input">{t("home.searchPlaceholder")}</label>
          <input id="gallery-search-input" type="search" role="combobox" aria-autocomplete="list" aria-expanded={mentionQuery!==null} aria-controls="account-search-suggestions" value={searchQuery} placeholder={t("home.searchPlaceholder")} onChange={updateSearch} onKeyDown={handleSearchKeyDown} />
          {mentionQuery!==null&&<div className="account-search-suggestions" id="account-search-suggestions" role="listbox">{mentionQuery.length===0?<p>{t("home.accountSearchHint")}</p>:accountSearchLoading?<p>{t("home.searchingAccounts")}</p>:accountSuggestions.length===0?<p>{t("home.noAccountsFound")}</p>:accountSuggestions.map((account,index)=><button className={index===activeSuggestion?"active":""} type="button" role="option" aria-selected={index===activeSuggestion} key={account.user_id} onPointerDown={event=>event.preventDefault()} onClick={()=>selectAccount(account)}><span>{account.avatar_url?<img src={account.avatar_url} alt=""/>:account.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span><strong>{account.full_name}</strong></button>)}</div>}
        </form>
        <div className="gallery-header-actions">{session?<details className="gallery-profile-menu" ref={profileMenuRef}><summary aria-label={t("home.profileMenu")} title={t("home.profileMenu")}>{profileAvatar?<img src={profileAvatar} alt=""/>:<span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span>}</summary><div className="gallery-profile-popover"><Link className="gallery-profile-identity" to={`/${language}/profile`}>{profileAvatar?<img src={profileAvatar} alt=""/>:<span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span>}<div><strong>{session.fullName}</strong><small>{session.email}</small></div></Link><div className="gallery-profile-preferences"><span>{t("home.preferences")}</span><div><LanguageToggle/><ThemeToggle/></div></div><button type="button" onClick={signOut}><LogOut aria-hidden="true" size={18}/>{t("nav.logout")}</button></div></details>:<Link className="gallery-guest-avatar" to={`/${language}/login`} aria-label={t("auth.signIn")} title={t("auth.signIn")}><UserRound aria-hidden="true" size={20}/></Link>}</div>
      </header>

      <section className="gallery-feed" aria-label={t("home.collectionTitle")}>
        <div className="gallery-filters" role="group" aria-label={t("home.filters")}>
          <button className={activeCategory === "all" ? "active" : ""} type="button" aria-pressed={activeCategory === "all"} onClick={() => setActiveCategory("all")}>{t("home.filter.all")}</button>
          {workCategories.map((category) => (
            <button className={activeCategory === category.code ? "active" : ""} type="button" aria-pressed={activeCategory === category.code} key={category.code} onClick={() => setActiveCategory(category.code)}>{t(category.label)}</button>
          ))}
        </div>
        {loading?<p className="gallery-state" aria-live="polite">{normalizedArtworkSearch.length>=2?t("home.searching"):t("works.loading")}</p>:feedError&&works.length===0?<p className="gallery-state">{normalizedArtworkSearch.length>=2?t("home.searchUnavailable"):t("works.loadFailed")}</p>:works.length===0?<p className="gallery-state">{normalizedArtworkSearch.length>=2||submittedAccount?t("home.noSearchResults"):t("works.empty")}</p>:<><div className="artwork-grid">
          {works.map((work) => (
            <article className="artwork-card" key={work.work_id}>
              <div className="artwork-pin-media"><button className="artwork-image-button" type="button" aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={()=>setSelectedWorkId(work.work_id)}><img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy" /></button><span className={`artwork-type-tag artwork-card-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language === "ar" ? work.type_name_ar : work.type_name_en}</span><Link className="artwork-artist-link" to={session?`/${language}/profile/${work.owner_user_id}`:`/${language}/login`}><UserRound size={15}/>{work.artist_name}</Link><button className={`artwork-pin-like ${work.liked_by_me?"liked":""}`} disabled={!session} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>toggleLike(work)}><Heart size={18} fill={work.liked_by_me?"currentColor":"none"}/><span>{work.like_count}</span></button>{session&&hasPermission(session.permissions,"works.save")&&<button className={`artwork-pin-save ${work.saved_by_me?"saved":""}`} aria-label={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} title={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} type="button" onClick={()=>toggleSave(work)}><Bookmark aria-hidden="true" size={21} fill={work.saved_by_me?"currentColor":"none"}/></button>}</div>
            </article>
          ))}
        </div>{nextCursor!==null&&<button className="pagination-load-more" type="button" disabled={loadingMore} onClick={loadMore}>{t(loadingMore?"works.loadingMore":"works.loadMore")}</button>}{feedError&&<p className="pagination-error" role="alert">{t("works.loadFailed")}</p>}</>}
      </section>

      {selectedWork&&<ArtworkDetailModal language={language} work={selectedWork} canLike={Boolean(session&&hasPermission(session.permissions,"works.like"))} canSave={Boolean(session&&hasPermission(session.permissions,"works.save"))} onClose={()=>setSelectedWorkId(null)} onToggleLike={toggleLike} onToggleSave={toggleSave} t={t}/>}

      <footer className="gallery-footer"><img src={inkfigLogo} alt={t("app.name")} /><p>{t("home.footer")}</p></footer>
    </main>
  );
}
