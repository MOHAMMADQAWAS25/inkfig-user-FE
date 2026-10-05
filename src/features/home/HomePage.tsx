import { ArrowUpRight, Bookmark, Heart, Image, LogOut, Plus, Search, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { getWorks, setWorkLike, setWorkSave } from "../works/worksApi";
import type { Work } from "../works/worksApi";
import { ArtworkDetailModal } from "./ArtworkDetailModal";
import { hasPermission } from "../../lib/permissions";

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

const workTypeTones: Record<string,string> = {
  "digital art":"violet", "hand art":"terracotta", video:"crimson", audio:"teal",
  animation:"amber", games:"blue", "interactive art":"emerald", interactive:"emerald",
  "virtual and augmented reality":"magenta", "vr/ar":"magenta",
};
const fallbackTones = ["violet","terracotta","crimson","teal","amber","blue","emerald","magenta"] as const;
function workTypeTone(work:Work):string {
  const name=work.type_name_en.trim().toLowerCase();
  if(workTypeTones[name])return workTypeTones[name];
  const hash=[...work.type_id].reduce((value,character)=>(value*31+character.charCodeAt(0))>>>0,0);
  return fallbackTones[hash%fallbackTones.length];
}

export function HomePage() {
  const { session, signOut } = useAuth();
  const { language, t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [works,setWorks]=useState<Work[]>([]); const [loading,setLoading]=useState(true); const [feedError,setFeedError]=useState(false);
  const [selectedWorkId,setSelectedWorkId]=useState<string|null>(null);
  const profileMenuRef=useRef<HTMLDetailsElement>(null);
  const selectedWork=works.find(work=>work.work_id===selectedWorkId)??null;
  const normalizedSearch=searchQuery.trim().toLocaleLowerCase(language);
  const visibleWorks=normalizedSearch ? works.filter(work=>[work.title,work.artist_name,work.description,language==="ar"?work.type_name_ar:work.type_name_en].some(value=>value?.toLocaleLowerCase(language).includes(normalizedSearch))) : works;
  useEffect(()=>{setLoading(true);setFeedError(false);getWorks(activeCategory === "all" ? undefined : activeCategory).then(setWorks).catch(()=>setFeedError(true)).finally(()=>setLoading(false));},[activeCategory,session]);
  useEffect(()=>{function closeProfileMenu(event:PointerEvent){const menu=profileMenuRef.current;if(menu?.open&&event.target instanceof Node&&!menu.contains(event.target))menu.removeAttribute("open");}document.addEventListener("pointerdown",closeProfileMenu);return()=>document.removeEventListener("pointerdown",closeProfileMenu);},[]);
  async function toggleLike(work:Work){if(!session || !hasPermission(session.permissions,"works.like"))return; const next=!work.liked_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item)); try{await setWorkLike(work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}
  async function toggleSave(work:Work){if(!session || !hasPermission(session.permissions,"works.save"))return; const next=!work.saved_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,saved_by_me:next}:item)); try{await setWorkSave(work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}

  return (
    <main className="gallery-home">
      <header className="gallery-header">
        <Link className="gallery-brand" to={`/${language}`} aria-label={t("app.name")}>
          <img src={inkfigLogo} alt="" />
        </Link>
        <label className="gallery-search">
          <Search aria-hidden="true" size={19} />
          <span className="sr-only">{t("home.searchPlaceholder")}</span>
          <input type="search" value={searchQuery} placeholder={t("home.searchPlaceholder")} onChange={(event)=>setSearchQuery(event.target.value)} />
        </label>
        <div className="gallery-header-actions">
          <LanguageToggle />
          <ThemeToggle />
          {session ? <><Link className="gallery-create-button" to={`/${language}/upload`} aria-label={t("works.upload")} title={t("works.upload")}><Plus aria-hidden="true" size={23} /></Link><details className="gallery-profile-menu" ref={profileMenuRef}><summary aria-label={t("home.profileMenu")} title={t("home.profileMenu")}><span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span></summary><div className="gallery-profile-popover"><div className="gallery-profile-identity"><span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span><div><strong>{session.fullName}</strong><small>{session.email}</small></div></div><Link to={`/${language}/profile`}><UserRound aria-hidden="true" size={18} />{t("home.viewProfile")}</Link><Link to={`/${language}/upload`}><Plus aria-hidden="true" size={18} />{t("works.upload")}</Link><div className="gallery-profile-preferences"><span>{t("home.preferences")}</span><div><LanguageToggle /><ThemeToggle /></div></div><button type="button" onClick={signOut}><LogOut aria-hidden="true" size={18} />{t("nav.logout")}</button></div></details></> : <><Link className="gallery-login-link" to={`/${language}/login`}>{t("auth.signIn")}</Link><Link className="gallery-primary-link" to={`/${language}/signup`}>{t("auth.signUp")}</Link></>}
        </div>
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
        {loading?<p className="gallery-state">{t("works.loading")}</p>:feedError?<p className="gallery-state">{t("works.loadFailed")}</p>:works.length===0?<p className="gallery-state">{t("works.empty")}</p>:visibleWorks.length===0?<p className="gallery-state">{t("home.noSearchResults")}</p>:<div className="artwork-grid">
          {visibleWorks.map((work) => (
            <article className="artwork-card" key={work.work_id}>
              <div className="artwork-pin-media"><button className="artwork-image-button" type="button" aria-label={`${t("works.viewDetails")}: ${work.title}`} onClick={()=>setSelectedWorkId(work.work_id)}><img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy" /></button><span className={`artwork-type-tag artwork-type-tag--${workTypeTone(work)}`}>{language==="ar"?work.type_name_ar:work.type_name_en}</span><span className="artwork-pin-uploader"><UserRound aria-hidden="true" size={16}/><span>{work.artist_name}</span></span><button className={`artwork-pin-like ${work.liked_by_me?"liked":""}`} disabled={!session} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>toggleLike(work)}><Heart size={18} fill={work.liked_by_me?"currentColor":"none"}/><span>{work.like_count}</span></button>{session&&hasPermission(session.permissions,"works.save")&&<button className={`artwork-pin-save ${work.saved_by_me?"saved":""}`} aria-label={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} title={t(work.saved_by_me?"home.unsaveWork":"home.saveWork")} type="button" onClick={()=>toggleSave(work)}><Bookmark aria-hidden="true" size={21} fill={work.saved_by_me?"currentColor":"none"}/></button>}</div>
            </article>
          ))}
        </div>}
      </section>

      {selectedWork&&<ArtworkDetailModal language={language} work={selectedWork} canLike={Boolean(session)} onClose={()=>setSelectedWorkId(null)} onToggleLike={toggleLike} t={t}/>}

      <footer className="gallery-footer"><img src={inkfigLogo} alt={t("app.name")} /><p>{t("home.footer")}</p></footer>
    </main>
  );
}
