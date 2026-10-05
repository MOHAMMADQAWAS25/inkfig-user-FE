import { Bell, Bookmark, House, Plus, Settings, Trophy } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";

export function AppSidebar() {
  const { language, t } = useI18n();
  const location = useLocation();
  const savedActive = location.pathname === `/${language}/profile` && new URLSearchParams(location.search).get("section") === "saved";
  const items = [
    { to: `/${language}`, label: t("nav.home"), icon: House, end: true },
    { to: `/${language}/exhibition`, label: t("nav.exhibition"), icon: Trophy },
    { to: `/${language}/upload`, label: t("nav.upload"), icon: Plus },
    { to: `/${language}/notifications`, label: t("nav.notifications"), icon: Bell },
  ];

  return <aside className="app-sidebar" aria-label={t("nav.primary")}>
    <Link className="app-sidebar-logo" to={`/${language}`} aria-label={t("app.name")}><img src={inkfigLogo} alt="" /></Link>
    <nav className="app-sidebar-nav">
      {items.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} aria-label={label} title={label}><Icon aria-hidden="true" size={22}/></NavLink>)}
      <Link className={savedActive?"active":""} to={`/${language}/profile?section=saved`} aria-label={t("nav.saved")} title={t("nav.saved")}><Bookmark aria-hidden="true" size={22}/></Link>
    </nav>
    <NavLink className="app-sidebar-settings" to={`/${language}/settings`} aria-label={t("nav.settings")} title={t("nav.settings")}><Settings aria-hidden="true" size={22}/></NavLink>
  </aside>;
}
