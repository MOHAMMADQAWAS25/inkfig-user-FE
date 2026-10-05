import { Bell, Bookmark, House, LogOut, Plus, Settings, Trophy, UserRound } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { useAuth } from "../auth/AuthContext";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ThemeToggle } from "../../theme/ThemeToggle";

export function AppSidebar() {
  const { language, t } = useI18n();
  const {session,signOut}=useAuth();
  const profileMenuRef=useRef<HTMLDetailsElement>(null);
  const location = useLocation();
  const savedActive = location.pathname === `/${language}/profile` && new URLSearchParams(location.search).get("section") === "saved";
  const items = [
    { to: `/${language}`, label: t("nav.home"), icon: House, end: true },
    { to: `/${language}/exhibition`, label: t("nav.exhibition"), icon: Trophy },
    { to: `/${language}/upload`, label: t("nav.upload"), icon: Plus },
    { to: `/${language}/notifications`, label: t("nav.notifications"), icon: Bell },
  ];
  useEffect(()=>{function closeProfileMenu(event:PointerEvent){const menu=profileMenuRef.current;if(menu?.open&&event.target instanceof Node&&!menu.contains(event.target))menu.removeAttribute("open");}document.addEventListener("pointerdown",closeProfileMenu);return()=>document.removeEventListener("pointerdown",closeProfileMenu);},[]);

  return <aside className="app-sidebar" aria-label={t("nav.primary")}>
    <Link className="app-sidebar-logo" to={`/${language}`} aria-label={t("app.name")}><img src={inkfigLogo} alt="" /></Link>
    <nav className="app-sidebar-nav">
      {items.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} aria-label={label} title={label}><Icon aria-hidden="true" size={24}/></NavLink>)}
      <Link className={savedActive?"active":""} to={`/${language}/profile?section=saved`} aria-label={t("nav.saved")} title={t("nav.saved")}><Bookmark aria-hidden="true" size={24}/></Link>
    </nav>
    <div className="app-sidebar-account">{session&&<details className="gallery-profile-menu app-sidebar-profile" ref={profileMenuRef}><summary aria-label={t("home.profileMenu")} title={t("home.profileMenu")}><span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span></summary><div className="gallery-profile-popover"><div className="gallery-profile-identity"><span>{session.fullName.trim().charAt(0).toLocaleUpperCase(language)}</span><div><strong>{session.fullName}</strong><small>{session.email}</small></div></div><Link to={`/${language}/profile`}><UserRound aria-hidden="true" size={18}/>{t("home.viewProfile")}</Link><div className="gallery-profile-preferences"><span>{t("home.preferences")}</span><div><LanguageToggle/><ThemeToggle/></div></div><button type="button" onClick={signOut}><LogOut aria-hidden="true" size={18}/>{t("nav.logout")}</button></div></details>}<NavLink className="app-sidebar-settings" to={`/${language}/settings`} aria-label={t("nav.settings")} title={t("nav.settings")}><Settings aria-hidden="true" size={24}/></NavLink></div>
  </aside>;
}
