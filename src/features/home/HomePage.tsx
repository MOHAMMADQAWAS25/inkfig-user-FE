import { ArrowUpRight, Bookmark, Heart, Image, Search, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const { session } = useAuth();
  const { language, t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [works,setWorks]=useState<Work[]>([]); const [loading,setLoading]=useState(true); const [feedError,setFeedError]=useState(false);
  const [selectedWorkId,setSelectedWorkId]=useState<string|null>(null);
  const selectedWork=works.find(work=>work.work_id===selectedWorkId)??null;
  const normalizedSearch=submittedSearch.trim();
  useEffect(()=>{
    let active=true;
    setLoading(true);setFeedError(false);
    const typeCode=activeCategory === "all" ? undefined : activeCategory;
    const request=normalizedSearch.length>=2?searchWorks(normalizedSearch,typeCode):getWorks(typeCode);
    request.then(items=>{if(active)setWorks(items)}).catch(()=>{if(active)setFeedError(true)}).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[activeCategory,normalizedSearch,session]);
  function submitSearch(event:FormEvent<HTMLFormElement>){event.preventDefault();setSubmittedSearch(searchQuery.trim());}
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
      </header>

      <section className="gallery-hero" id="about">
        <div className="gallery-hero-copy">
          <p className="gallery-kicker"><Sparkles size={16} /> {t("home.kicker")}</p>
          <h1 className="gallery-hero-title" aria-label={t("home.title")}>
            <span>{t("home.titleInk")}</span>
            <span className="gallery-hero-title-outline">{t("home.titleYour")}</span>
            <span className="gallery-hero-title-accent">{t("home.titleWorld")}</span>
          </h1>
          <p>{t("home.description")}</p>
          <a className="gallery-explore" href="#discover">{t("home.explore")} <ArrowUpRight size={18} /></a>
        </div>
        <div className="gallery-hero-mark" aria-hidden="true"><span>{t("home.curated")}</span><Image size={34} /></div>
      </section>

      <section className="gallery-feed" id="discover" aria-labelledby="gallery-feed-title">
        <div className="gallery-section-heading">
          <div><p>{t("home.collectionLabel")}</p><h2 id="gallery-feed-title">{t("home.collectionTitle")}</h2></div>
          <span>{t("home.viewerNote")}</span>
        </div>
        <div className="gallery-filters" role="group" aria-label={t("home.filters")}>
          <button className={activeCategory === "all" ? "active" : ""} type="button" aria-pressed={activeCategory === "all"} onClick={() => setActiveCategory("all")}>{t("home.filter.all")}</button>
          {workCategories.map((category) => (
            <button className={activeCategory === category.code ? "active" : ""} type="button" aria-pressed={activeCategory === category.code} key={category.code} onClick={() => setActiveCategory(category.code)}>{t(category.label)}</button>
          ))}
        </div>
        {loading?<p className="gallery-state" aria-live="polite">{normalizedSearch.length>=2?t("home.searching"):t("works.loading")}</p>:feedError?<p className="gallery-state">{normalizedSearch.length>=2?t("home.searchUnavailable"):t("works.loadFailed")}</p>:works.length===0?<p className="gallery-state">{normalizedSearch.length>=2?t("home.noSearchResults"):t("works.empty")}</p>:<div className="artwork-grid">
          {works.map((work) => (
            <article className="artwork-card" key={work.work_id}>
              <div className="artwork-pin-media"><button className="artwork-image-button" type="button" aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={()=>setSelectedWorkId(work.work_id)}><img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy" /></button><span className={`artwork-type-tag artwork-card-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language === "ar" ? work.type_name_ar : work.type_name_en}</span><Link className="artwork-artist-link" to={session?`/${language}/profile/${work.owner_user_id}`:`/${language}/login`}><UserRound size={15}/>{work.artist_name}</Link><button className={`artwork-pin-like ${work.liked_by_me?"liked":""}`} disabled={!session} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>toggleLike(work)}><Heart size={18} fill={work.liked_by_me?"currentColor":"none"}/><span>{work.like_count}</span></button>{session&&hasPermission(session.permissions,"works.save")&&<button className={`artwork-pin-save ${work.saved_by_me?"saved":""}`} aria-label={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} title={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} type="button" onClick={()=>toggleSave(work)}><Bookmark aria-hidden="true" size={21} fill={work.saved_by_me?"currentColor":"none"}/></button>}</div>
            </article>
          ))}
        </div>}
      </section>

      {selectedWork&&<ArtworkDetailModal language={language} work={selectedWork} canLike={Boolean(session&&hasPermission(session.permissions,"works.like"))} canSave={Boolean(session&&hasPermission(session.permissions,"works.save"))} onClose={()=>setSelectedWorkId(null)} onToggleLike={toggleLike} onToggleSave={toggleSave} t={t}/>}

      <footer className="gallery-footer"><img src={inkfigLogo} alt={t("app.name")} /><p>{t("home.footer")}</p></footer>
    </main>
  );
}
