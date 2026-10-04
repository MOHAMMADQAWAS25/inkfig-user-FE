import { ArrowUpRight, ExternalLink, Heart, Image, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { getWorks, setWorkLike } from "../works/worksApi";
import type { Work } from "../works/worksApi";

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
  const { language, setLanguage, t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [works,setWorks]=useState<Work[]>([]); const [loading,setLoading]=useState(true); const [feedError,setFeedError]=useState(false);
  useEffect(()=>{setLoading(true);setFeedError(false);getWorks(session?.accessToken,activeCategory === "all" ? undefined : activeCategory).then(setWorks).catch(()=>setFeedError(true)).finally(()=>setLoading(false));},[activeCategory,session?.accessToken]);
  async function toggleLike(work:Work){if(!session)return; const next=!work.liked_by_me; setWorks(current=>current.map(item=>item.work_id===work.work_id?{...item,liked_by_me:next,like_count:item.like_count+(next?1:-1)}:item)); try{await setWorkLike(session.accessToken,work.work_id,next);}catch{setWorks(current=>current.map(item=>item.work_id===work.work_id?work:item));}}

  return (
    <main className="gallery-home">
      <header className="gallery-header">
        <Link className="gallery-brand" to={`/${language}`} aria-label={t("app.name")}>
          <img src={inkfigLogo} alt="" />
        </Link>
        <nav className="gallery-nav" aria-label={t("home.primaryNavigation")}>
          <a href="#discover">{t("home.discover")}</a>
          <a href="#about">{t("home.about")}</a>
        </nav>
        <div className="gallery-header-actions">
          <button className="gallery-language" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>{language === "ar" ? "English" : "العربية"}</button>
          <ThemeToggle />
          {session ? <><Link className="gallery-login-link" to={`/${language}/upload`}>{t("works.upload")}</Link><span className="gallery-user-name">{session.fullName}</span><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></> : <><Link className="gallery-login-link" to={`/${language}/login`}>{t("auth.signIn")}</Link><Link className="gallery-primary-link" to={`/${language}/signup`}>{t("auth.signUp")}</Link></>}
        </div>
      </header>

      <section className="gallery-hero" id="about">
        <div className="gallery-hero-copy">
          <p className="gallery-kicker"><Sparkles size={16} /> {t("home.kicker")}</p>
          <h1>{t("home.title")}</h1>
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
        {loading?<p className="gallery-state">{t("works.loading")}</p>:feedError?<p className="gallery-state">{t("works.loadFailed")}</p>:works.length===0?<p className="gallery-state">{t("works.empty")}</p>:<div className="artwork-grid">
          {works.map((work) => (
            <article className="artwork-card" key={work.work_id}>
              <img className="artwork-image" src={work.image_url} alt={work.title} loading="lazy" />
              <div className="artwork-details">
                <div><p>{language==="ar"?work.type_name_ar:work.type_name_en}</p><h3>{work.title}</h3><span>{t("home.by")} {work.artist_name}</span>{work.external_url&&<a className="artwork-external-link" href={work.external_url} target="_blank" rel="noopener noreferrer">{t("works.openLink")} <ExternalLink size={14}/></a>}</div>
                <button className={`artwork-likes ${work.liked_by_me?"liked":""}`} disabled={!session} aria-label={`${work.like_count} ${t("home.likes")}`} type="button" onClick={()=>toggleLike(work)}><Heart size={17} fill={work.liked_by_me?"currentColor":"none"}/> <span>{work.like_count}</span></button>
              </div>
            </article>
          ))}
        </div>}
      </section>

      <footer className="gallery-footer"><img src={inkfigLogo} alt={t("app.name")} /><p>{t("home.footer")}</p></footer>
    </main>
  );
}
