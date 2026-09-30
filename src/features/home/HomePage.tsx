import { ArrowUpRight, Heart, Image, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";

const works = [
  { id: 1, artist: "Lina Nasser", title: "Between the Hills", type: "Digital art", likes: 128, visual: "artwork-sunset" },
  { id: 2, artist: "Yousef Amro", title: "Old City Rhythm", type: "Photography", likes: 94, visual: "artwork-city" },
  { id: 3, artist: "Mira Qawasmi", title: "Roots", type: "Illustration", likes: 176, visual: "artwork-fig" },
  { id: 4, artist: "Khaled Rajabi", title: "Blue Silence", type: "Painting", likes: 82, visual: "artwork-blue" },
  { id: 5, artist: "Rana Jabari", title: "Threads of Home", type: "Mixed media", likes: 143, visual: "artwork-textile" },
  { id: 6, artist: "Omar Tamimi", title: "Morning Study", type: "Sketch", likes: 67, visual: "artwork-sketch" },
];

export function HomePage() {
  const { session, signOut } = useAuth();
  const { language, setLanguage, t } = useI18n();

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
          {session ? <><span className="gallery-user-name">{session.fullName}</span><button className="gallery-primary-link" type="button" onClick={signOut}>{t("nav.logout")}</button></> : <><Link className="gallery-login-link" to={`/${language}/login`}>{t("auth.signIn")}</Link><Link className="gallery-primary-link" to={`/${language}/signup`}>{t("auth.signUp")}</Link></>}
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
        <div className="gallery-filters" aria-label={t("home.filters")}>
          {["all", "digital", "photography", "painting", "illustration"].map((filter, index) => <button className={index === 0 ? "active" : ""} key={filter} type="button">{t(`home.filter.${filter}` as Parameters<typeof t>[0])}</button>)}
        </div>
        <div className="artwork-grid">
          {works.map((work) => (
            <article className="artwork-card" key={work.id}>
              <div className={`artwork-visual ${work.visual}`} role="img" aria-label={work.title}><span>{String(work.id).padStart(2, "0")}</span></div>
              <div className="artwork-details">
                <div><p>{work.type}</p><h3>{work.title}</h3><span>{t("home.by")} {work.artist}</span></div>
                <div className="artwork-likes" aria-label={`${work.likes} ${t("home.likes")}`}><Heart size={17} /> <span>{work.likes}</span></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="gallery-footer"><img src={inkfigLogo} alt={t("app.name")} /><p>{t("home.footer")}</p></footer>
    </main>
  );
}
