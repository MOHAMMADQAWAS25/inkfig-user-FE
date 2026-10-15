import { LogOut, Search, UserRound, X } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { useScrollHeader } from "./useScrollHeader";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { deleteWorkAsModerator, getWork, setWorkLike, setWorkSave } from "../works/worksApi";
import type { Work } from "../works/worksApi";
import { useInfiniteFeed } from "../feed/useInfiniteFeed";
import { Feed } from "../feed/Feed";
import { PostCard } from "../feed/PostCard";
import { ArtworkDetailModal } from "./ArtworkDetailModal";
import { hasPermission } from "../../lib/permissions";
import { AppSidebar } from "../navigation/AppSidebar";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { getPublicProfile, searchProfiles } from "../profile/profileApi";
import type { ProfileSearchResult } from "../profile/profileApi";
import { useSearchHistory, visibleSearchHistory, type SearchEntry } from "./useSearchHistory";
import { SmoothDetails } from "../layout/SmoothDetails";
import { AnimatedPresence } from "../layout/AnimatedPresence";
import { RecentSearches } from "./RecentSearches";

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
  const headerHidden = useScrollHeader();
  const { session, signOut } = useAuth();
  const { language, t } = useI18n();
  const location = useLocation();

  const [searchParams,setSearchParams]=useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [submittedSearch, setSubmittedSearch] = useState(searchParams.get("q") ?? "");
  const initialAccount = searchParams.get("artist") ? {user_id:searchParams.get("artist")!,full_name:searchParams.get("artistName") ?? "",avatar_url:null} as ProfileSearchResult : null;
  const [selectedAccount,setSelectedAccount]=useState<ProfileSearchResult|null>(initialAccount);
  const [submittedAccount,setSubmittedAccount]=useState<ProfileSearchResult|null>(initialAccount);
  const [accountSuggestions,setAccountSuggestions]=useState<ProfileSearchResult[]>([]);
  const [accountSearchLoading,setAccountSearchLoading]=useState(false);
  const [activeSuggestion,setActiveSuggestion]=useState(0);
  const [mentionQuery,setMentionQuery]=useState<string|null>(null);
  const [detailError,setDetailError]=useState(false);
  const [detailLoading,setDetailLoading]=useState(false);
  const [detailAttempt,setDetailAttempt]=useState(0);
  const [selectedWorkId,setSelectedWorkId]=useState<string|null>(null);
  const [deepLinkedWork,setDeepLinkedWork]=useState<Work|null>(null);
  const profileMenuRef=useRef<HTMLDetailsElement>(null);
  const searchRef=useRef<HTMLFormElement>(null);
  const history=useSearchHistory(session?.userId);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [historyIndex,setHistoryIndex]=useState(-1);
  const historyItems=visibleSearchHistory(history.items,searchQuery);
  const showHistory=historyOpen&&mentionQuery===null&&!history.loading&&historyItems.length>0;
  function openHistory(){setHistoryOpen(true);setHistoryIndex(-1);void history.refresh();}
  useEffect(()=>{setHistoryIndex(-1);},[searchQuery]);
  useEffect(()=>{setHistoryOpen(false);},[session?.userId]);
  const interactionRequests=useRef(new Set<string>());
  const [profileAvatar,setProfileAvatar]=useState<string|null>(null);
  const normalizedSearch=submittedSearch.trim();
  function artworkQuery(value:string, account:ProfileSearchResult|null){return account?value.replace(`@${account.full_name}`," ").replace(/\s+/g," ").trim():value.trim();}
  const normalizedArtworkSearch=artworkQuery(normalizedSearch,submittedAccount);
  const displayedSearch=selectedAccount?searchQuery.replace(`@${selectedAccount.full_name}`,"").replace(/^\s+/,""):searchQuery;
  useEffect(()=>{
    if(!selectedAccount||selectedAccount.avatar_url)return;
    let active=true;const userId=selectedAccount.user_id;
    getPublicProfile(userId).then(profile=>{if(active)setSelectedAccount(current=>current?.user_id===userId?{...current,avatar_url:current.avatar_url??profile.avatar_url}:current);}).catch(()=>undefined);
    return()=>{active=false;};
  },[selectedAccount?.user_id,selectedAccount?.avatar_url]);
  function clearSearch(){setSearchQuery("");setSelectedAccount(null);setMentionQuery(null);setAccountSuggestions([]);setHistoryOpen(false);document.getElementById("gallery-search-input")?.focus();}
  function removeSelectedUser(){setSearchQuery(displayedSearch);setSelectedAccount(null);setMentionQuery(null);setAccountSuggestions([]);setHistoryOpen(false);document.getElementById("gallery-search-input")?.focus();}
  const feed = useInfiniteFeed({
    category: activeCategory === "all" ? undefined : activeCategory,
    search: normalizedArtworkSearch.length >= 2 ? normalizedArtworkSearch : undefined,
    ownerId: submittedAccount?.user_id,
    viewer: session ? `${session.userId}:${session.role}:${session.permissions.join(",")}` : "guest",
  });
  const { items: works, setItems: setWorks } = feed;
  const loadedWork = works.find(work => work.work_id === selectedWorkId);
  const selectedWork = deepLinkedWork?.work_id === selectedWorkId ? {
    ...deepLinkedWork,
    ...(loadedWork ? { like_count: loadedWork.like_count, liked_by_me: loadedWork.liked_by_me, saved_by_me: loadedWork.saved_by_me } : {}),
  } : null;
  useEffect(() => {
    const query=searchParams.get("q")??"";
    const account=searchParams.get("artist")?{user_id:searchParams.get("artist")!,full_name:searchParams.get("artistName")??"",avatar_url:null}:null;
    setActiveCategory(searchParams.get("category")??"all");
    setSubmittedSearch(query);setSearchQuery(query);
    setSubmittedAccount(account);
    setSelectedAccount(current=>account&&current?.user_id===account.user_id?{...account,avatar_url:current.avatar_url}:account);
    setMentionQuery(null);setAccountSuggestions([]);
    if(location.state?.resetHome)window.scrollTo({top:0,behavior:"smooth"});
  }, [searchParams, location.key]);
  function selectCategory(category:string){
    const next=new URLSearchParams(searchParams);
    if(category==="all")next.delete("category");else next.set("category",category);
    setSearchParams(next);
  }
  useEffect(()=>{if(mentionQuery===null||mentionQuery.length<1){setAccountSuggestions([]);setAccountSearchLoading(false);return;}let active=true;setAccountSearchLoading(true);const timer=window.setTimeout(()=>{searchProfiles(mentionQuery).then(items=>{if(active){setAccountSuggestions(items);setActiveSuggestion(0)}}).catch(()=>{if(active)setAccountSuggestions([])}).finally(()=>{if(active)setAccountSearchLoading(false)});},250);return()=>{active=false;window.clearTimeout(timer)};},[mentionQuery]);
  useEffect(()=>{function closeSuggestions(event:PointerEvent){if(event.target instanceof Node&&!searchRef.current?.contains(event.target)){setMentionQuery(null);setHistoryOpen(false);}}document.addEventListener("pointerdown",closeSuggestions);return()=>document.removeEventListener("pointerdown",closeSuggestions);},[]);
  useEffect(()=>{function closeProfileMenu(event:PointerEvent){const menu=profileMenuRef.current;if(menu?.open&&event.target instanceof Node&&!menu.contains(event.target))menu.removeAttribute("open");}document.addEventListener("pointerdown",closeProfileMenu);return()=>document.removeEventListener("pointerdown",closeProfileMenu);},[]);
  useEffect(()=>{let active=true;if(!session){setProfileAvatar(null);return;}getPublicProfile(session.userId).then(profile=>{if(active)setProfileAvatar(profile.avatar_url)}).catch(()=>{if(active)setProfileAvatar(null)});return()=>{active=false};},[session]);
  const detailWorkId = searchParams.get("work");
  useEffect(() => {
    setSelectedWorkId(detailWorkId);
    setDeepLinkedWork(null); setDetailError(false);
    if (!detailWorkId) { setDetailLoading(false); return; }
    const controller = new AbortController();
    setDetailLoading(true);
    getWork(detailWorkId, controller.signal).then(work => { if (!controller.signal.aborted) setDeepLinkedWork(work); })
      .catch(() => { if (!controller.signal.aborted) setDetailError(true); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [detailWorkId, detailAttempt, session?.userId]);
  function openWork(work: Work) {
    const next = new URLSearchParams(searchParams); next.set("work", work.work_id);
    setSearchParams(next);
  }
  function closeWork() {
    const id = selectedWorkId;
    setSelectedWorkId(null); setDeepLinkedWork(null);
    const next = new URLSearchParams(searchParams); next.delete("work"); setSearchParams(next, {replace:true});
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`button[data-work-id="${CSS.escape(id ?? "")}"]`)?.focus({preventScroll:true});
    });
  }
  function submitSearch(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(mentionQuery!==null&&accountSuggestions.length){selectAccount(accountSuggestions[activeSuggestion]??accountSuggestions[0]);return;}
    executeSearch(searchQuery,selectedAccount);
  }
  function executeSearch(value:string,account:ProfileSearchResult|null){
    const query=value.trim();const next=new URLSearchParams(searchParams);
    history.record(query,account);setHistoryOpen(false);setHistoryIndex(-1);setSearchQuery(query);
    if(query)next.set("q",query);else next.delete("q");
    if(account){next.set("artist",account.user_id);next.set("artistName",account.full_name);}
    else{next.delete("artist");next.delete("artistName");}
    next.delete("work");setSearchParams(next);setMentionQuery(null);
  }
  async function selectRecent(entry:SearchEntry){
    const query=entry.query;
    if(entry.artist_user_id&&entry.artist_name){
      const account={user_id:entry.artist_user_id,full_name:entry.artist_name,avatar_url:selectedAccount?.user_id===entry.artist_user_id?selectedAccount.avatar_url:null};
      setSelectedAccount(account);executeSearch(query,account);return;
    }
    let account=selectedAccount&&query.includes(`@${selectedAccount.full_name}`)?selectedAccount:null;
    if(!account&&query.includes("@")){
      const name=query.slice(query.lastIndexOf("@")+1).trim();
      try{account=(await searchProfiles(name)).find(item=>item.full_name.toLowerCase()===name.toLowerCase())??null;}catch{/* Text search remains available. */}
    }
    setSelectedAccount(account);executeSearch(query,account);
  }
  function updateSearch(event:ChangeEvent<HTMLInputElement>){const typed=event.target.value;if(selectedAccount){setSearchQuery(`@${selectedAccount.full_name}${typed?` ${typed}`:""}`);setMentionQuery(null);setAccountSuggestions([]);return;}setSearchQuery(typed);const at=typed.lastIndexOf("@");if(at<0){setMentionQuery(null);setAccountSuggestions([]);return;}setMentionQuery(typed.slice(at+1).trimStart());}
  function selectAccount(account:ProfileSearchResult){const at=searchQuery.lastIndexOf("@");const next=at>=0?`${searchQuery.slice(0,at)}@${account.full_name}`:`${searchQuery} @${account.full_name}`;setSearchQuery(next);setSelectedAccount(account);setMentionQuery(null);setAccountSuggestions([]);}
  function handleSearchKeyDown(event:KeyboardEvent<HTMLInputElement>){if(event.key==="Escape"){event.preventDefault();setHistoryOpen(false);setMentionQuery(null);return;}if(showHistory&&historyItems.length){if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();setHistoryIndex(index=>index<0?(event.key==="ArrowDown"?0:historyItems.length-1):(index+(event.key==="ArrowDown"?1:-1)+historyItems.length)%historyItems.length);return;}if(event.key==="Enter"&&historyIndex>=0){event.preventDefault();selectRecent(historyItems[historyIndex]);return;}}if(mentionQuery===null||accountSuggestions.length===0)return;if(event.key==="ArrowDown"){event.preventDefault();setActiveSuggestion(index=>(index+1)%accountSuggestions.length);}else if(event.key==="ArrowUp"){event.preventDefault();setActiveSuggestion(index=>(index-1+accountSuggestions.length)%accountSuggestions.length);}else if(event.key==="Escape"){event.preventDefault();setMentionQuery(null);}else if(event.key==="Enter"){event.preventDefault();selectAccount(accountSuggestions[activeSuggestion]??accountSuggestions[0]);}}
  async function toggleLike(work:Work){
    const key=`like:${work.work_id}`;
    if(!session || !hasPermission(session.permissions,"works.like") || interactionRequests.current.has(key))return;
    interactionRequests.current.add(key);
    const next=!work.liked_by_me;
    const patch={liked_by_me:next,like_count:work.like_count+(next?1:-1)};
    setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,...patch}:item));
    setDeepLinkedWork(current=>current?.work_id===work.work_id?{...current,...patch}:current);
    try{await setWorkLike(work.work_id,next);}catch{
      const previous={liked_by_me:work.liked_by_me,like_count:work.like_count};
      setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,...previous}:item));
      setDeepLinkedWork(current=>current?.work_id===work.work_id?{...current,...previous}:current);
    }finally{interactionRequests.current.delete(key);}
  }
  async function toggleSave(work:Work){
    const key=`save:${work.work_id}`;
    if(!session || !hasPermission(session.permissions,"works.save") || interactionRequests.current.has(key))return;
    interactionRequests.current.add(key);
    const next=!work.saved_by_me;
    setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,saved_by_me:next}:item));
    setDeepLinkedWork(current=>current?.work_id===work.work_id?{...current,saved_by_me:next}:current);
    try{await setWorkSave(work.work_id,next);}catch{
      setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,saved_by_me:work.saved_by_me}:item));
      setDeepLinkedWork(current=>current?.work_id===work.work_id?{...current,saved_by_me:work.saved_by_me}:current);
    }finally{interactionRequests.current.delete(key);}
  }
  async function moderateDelete(work:Work,reason:string){await deleteWorkAsModerator(work.work_id,reason);setWorks(current=>current.filter(item=>item.work_id!==work.work_id));closeWork();}

  return (
    <main className="gallery-home">
      <AppSidebar />
      <header className={`gallery-header${headerHidden ? " mobile-header-hidden" : ""}`}>
        <span className="mobile-header-menu" id="mobile-menu-slot" />
        <span className="mobile-header-notifications" id="mobile-notifications-slot" />
        <form className="gallery-search" role="search" onSubmit={submitSearch} ref={searchRef} onClick={event=>{if(!(event.target instanceof Element)||event.target.closest('input, button, a, [role="listbox"], .recent-searches'))return;const input=event.currentTarget.querySelector<HTMLInputElement>("#gallery-search-input");if(document.activeElement===input)openHistory();else input?.focus();}}>
          <Search aria-hidden="true" size={19} />
          <label className="sr-only" htmlFor="gallery-search-input">{t("home.searchPlaceholder")}</label>
          {selectedAccount&&<span className="search-user-badge"><Link className="search-user-profile" to={`/${language}/profile/${encodeURIComponent(selectedAccount.user_id)}`} aria-label={selectedAccount.full_name}>{selectedAccount.avatar_url?<img src={selectedAccount.avatar_url} alt=""/>:<span className="search-user-initial" aria-hidden="true">{selectedAccount.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span>}<strong>{selectedAccount.full_name}</strong></Link><button className="search-user-remove" type="button" aria-label={t("home.removeSelectedUser")} title={t("home.removeSelectedUser")} onClick={removeSelectedUser}><X size={14} aria-hidden="true"/></button></span>}
          <input id="gallery-search-input" type="search" role="combobox" aria-autocomplete="list" aria-expanded={mentionQuery!==null||showHistory} aria-controls={showHistory?"recent-searches":"account-search-suggestions"} aria-activedescendant={showHistory&&historyIndex>=0?`recent-search-${historyIndex}`:undefined} value={displayedSearch} placeholder={t("home.searchPlaceholder")} onFocus={openHistory} onClick={()=>{if(!historyOpen)openHistory();}} onBlur={event=>{if(!event.currentTarget.form?.contains(event.relatedTarget as Node|null))setHistoryOpen(false);}} onChange={updateSearch} onKeyDown={handleSearchKeyDown} />
          {(selectedAccount||searchQuery)&&<button className="search-clear-selection" type="button" aria-label={t("home.clearSearch")} title={t("home.clearSearch")} onClick={clearSearch}><X size={19} aria-hidden="true"/></button>}
          <AnimatedPresence open={showHistory}><RecentSearches items={historyItems} loading={history.loading} error={history.error} activeIndex={historyIndex} onSelect={selectRecent} onRemove={history.remove} onClear={history.clear} t={t}/></AnimatedPresence>
          <AnimatedPresence open={mentionQuery!==null}>{mentionQuery!==null&&<div className="account-search-suggestions" id="account-search-suggestions" role="listbox">{mentionQuery.length===0?<p>{t("home.accountSearchHint")}</p>:accountSearchLoading?<p>{t("home.searchingAccounts")}</p>:accountSuggestions.length===0?<p>{t("home.noAccountsFound")}</p>:accountSuggestions.map((account,index)=><button className={index===activeSuggestion?"active":""} type="button" role="option" aria-selected={index===activeSuggestion} key={account.user_id} onPointerDown={event=>event.preventDefault()} onClick={()=>selectAccount(account)}><span>{account.avatar_url?<img src={account.avatar_url} alt=""/>:account.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span><strong>{account.full_name}</strong></button>)}</div>}</AnimatedPresence>
        </form>
        <div className="gallery-header-actions">{session?<SmoothDetails className="gallery-profile-menu" ref={profileMenuRef}><summary aria-label={t("home.profileMenu")} title={t("home.profileMenu")}>{profileAvatar?<img src={profileAvatar} alt=""/>:<span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span>}</summary><div className="gallery-profile-popover"><Link className="gallery-profile-identity" to={`/${language}/profile`}>{profileAvatar?<img src={profileAvatar} alt=""/>:<span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span>}<div><strong>{session.fullName}</strong><small>{session.email}</small></div></Link><div className="gallery-profile-preferences"><span>{t("home.preferences")}</span><div><LanguageToggle/><ThemeToggle/></div></div><button type="button" onClick={signOut}><LogOut aria-hidden="true" size={18}/>{t("nav.logout")}</button></div></SmoothDetails>:<Link className="gallery-guest-avatar" to={`/${language}/login`} aria-label={t("auth.signIn")} title={t("auth.signIn")}><UserRound aria-hidden="true" size={20}/></Link>}</div>
      </header>

      <section className="gallery-feed" aria-label={t("home.collectionTitle")}>
        <div className="gallery-filters" role="group" aria-label={t("home.filters")}>
          <button className={activeCategory === "all" ? "active" : ""} type="button" aria-pressed={activeCategory === "all"} onClick={() => selectCategory("all")}>{t("home.filter.all")}</button>
          {workCategories.map((category) => (
            <button className={activeCategory === category.code ? "active" : ""} type="button" aria-pressed={activeCategory === category.code} key={category.code} onClick={() => selectCategory(category.code)}>{t(category.label)}</button>
          ))}
        </div>
        <Feed key={feed.cacheKey} cacheKey={feed.cacheKey} items={works} loading={feed.loading} loadingMore={feed.loadingMore}
          error={feed.error} hasNextPage={feed.hasNextPage} loadMore={feed.loadMore} retry={feed.retry}
          emptyMessage={normalizedArtworkSearch.length>=2||submittedAccount?t("home.noSearchResults"):t("works.empty")}
          renderItem={(work,width,priority)=><PostCard work={work} width={width} priority={priority} onOpen={openWork} onLike={toggleLike} onSave={toggleSave}/>} />

      </section>

      {detailWorkId&&!selectedWork&&<div className="artwork-modal-backdrop"><section className="moderation-dialog" role="dialog" aria-modal="true" aria-label={t("works.viewDetails")}><p role="status">{t(detailLoading?"works.loading":"works.loadFailed")}</p>{detailError&&<button type="button" onClick={()=>setDetailAttempt(current=>current+1)}>{t("feed.retry")}</button>}<button type="button" onClick={closeWork}>{t("works.closeDetails")}</button></section></div>}
      {selectedWork&&<ArtworkDetailModal language={language} work={selectedWork} canLike={Boolean(session&&hasPermission(session.permissions,"works.like"))} canSave={Boolean(session&&hasPermission(session.permissions,"works.save"))} canReport={Boolean(session&&session.userId!==selectedWork.owner_user_id&&hasPermission(session.permissions,"reports.create"))} canModerateDelete={Boolean(session&&hasPermission(session.permissions,"works.delete_any"))} onClose={closeWork} onToggleLike={toggleLike} onToggleSave={toggleSave} onModerateDelete={moderateDelete} t={t}/>}


    </main>
  );
}
