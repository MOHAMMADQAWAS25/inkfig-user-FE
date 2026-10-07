import { Bookmark, Heart, LogOut, Search, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

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
  const [works,setWorks]=useState<Work[]>([]); const [loading,setLoading]=useState(true); const [feedError,setFeedError]=useState(false);
  const [nextCursor,setNextCursor]=useState<string|number|null>(null); const [loadingMore,setLoadingMore]=useState(false);
  const [selectedWorkId,setSelectedWorkId]=useState<string|null>(null);
  const profileMenuRef=useRef<HTMLDetailsElement>(null);
  const selectedWork=works.find(work=>work.work_id===selectedWorkId)??null;
  const normalizedSearch=submittedSearch.trim();
  useEffect(()=>{
    let active=true;
    setLoading(true);setFeedError(false);
    const typeCode=activeCategory === "all" ? undefined : activeCategory;
    const request=normalizedSearch.length>=2?searchWorks(normalizedSearch,typeCode):getWorks(typeCode);
    request.then(page=>{if(active){setWorks(page.items);setNextCursor(page.next_cursor)}}).catch(()=>{if(active)setFeedError(true)}).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[activeCategory,normalizedSearch,session]);
  useEffect(()=>{function closeProfileMenu(event:PointerEvent){const menu=profileMenuRef.current;if(menu?.open&&event.target instanceof Node&&!menu.contains(event.target))menu.removeAttribute("open");}document.addEventListener("pointerdown",closeProfileMenu);return()=>document.removeEventListener("pointerdown",closeProfileMenu);},[]);
  function submitSearch(event:FormEvent<HTMLFormElement>){event.preventDefault();setSubmittedSearch(searchQuery.trim());}
  async function loadMore(){if(nextCursor===null||loadingMore)return;setLoadingMore(true);setFeedError(false);const typeCode=activeCategory==="all"?undefined:activeCategory;try{const page=normalizedSearch.length>=2?await searchWorks(normalizedSearch,typeCode,Number(nextCursor)):await getWorks(typeCode,String(nextCursor));setWorks(current=>{const known=new Set(current.map(work=>work.work_id));return [...current,...page.items.filter(work=>!known.has(work.work_id))];});setNextCursor(page.next_cursor);}catch{setFeedError(true);}finally{setLoadingMore(false)}}
  async function toggleLike(work:Work){if(!session || !hasPermission(session.permissions,"works.like"))return; const next=!work.liked_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item)); try{await setWorkLike(work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}
  async function toggleSave(work:Work){if(!session || !hasPermission(session.permissions,"works.save"))return; const next=!work.saved_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,saved_by_me:next}:item)); try{await setWorkSave(work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}

  return (
    <main className="gallery-home">
      <AppSidebar />
      <header className="gallery-header">
        <form className="gallery-search" role="search" onSubmit={submitSearch}>
          <Search aria-hidden="true" size={19} />
          <label className="sr-only" htmlFor="gallery-search-input">{t("home.searchPlaceholder")}</label>
          <input id="gallery-search-input" type="search" value={searchQuery} placeholder={t("home.searchPlaceholder")} onChange={(event)=>setSearchQuery(event.target.value)} />
        </form>
        <div className="gallery-header-actions">{session?<details className="gallery-profile-menu" ref={profileMenuRef}><summary aria-label={t("home.profileMenu")} title={t("home.profileMenu")}><span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span></summary><div className="gallery-profile-popover"><div className="gallery-profile-identity"><span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span><div><strong>{session.fullName}</strong><small>{session.email}</small></div></div><Link to={`/${language}/profile`}><UserRound aria-hidden="true" size={18}/>{t("home.viewProfile")}</Link><div className="gallery-profile-preferences"><span>{t("home.preferences")}</span><div><LanguageToggle/><ThemeToggle/></div></div><button type="button" onClick={signOut}><LogOut aria-hidden="true" size={18}/>{t("nav.logout")}</button></div></details>:<Link className="gallery-guest-avatar" to={`/${language}/login`} aria-label={t("auth.signIn")} title={t("auth.signIn")}><UserRound aria-hidden="true" size={20}/></Link>}</div>
      </header>

      <section className="gallery-feed" aria-label={t("home.collectionTitle")}>
        <div className="gallery-filters" role="group" aria-label={t("home.filters")}>
          <button className={activeCategory === "all" ? "active" : ""} type="button" aria-pressed={activeCategory === "all"} onClick={() => setActiveCategory("all")}>{t("home.filter.all")}</button>
          {workCategories.map((category) => (
            <button className={activeCategory === category.code ? "active" : ""} type="button" aria-pressed={activeCategory === category.code} key={category.code} onClick={() => setActiveCategory(category.code)}>{t(category.label)}</button>
          ))}
        </div>
        {loading?<p className="gallery-state" aria-live="polite">{normalizedSearch.length>=2?t("home.searching"):t("works.loading")}</p>:feedError&&works.length===0?<p className="gallery-state">{normalizedSearch.length>=2?t("home.searchUnavailable"):t("works.loadFailed")}</p>:works.length===0?<p className="gallery-state">{normalizedSearch.length>=2?t("home.noSearchResults"):t("works.empty")}</p>:<><div className="artwork-grid">
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
