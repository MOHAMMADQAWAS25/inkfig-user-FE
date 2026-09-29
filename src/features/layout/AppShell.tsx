import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, signOut } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const dashboardPath = `/${language}/dashboard`;

  return (
    <main className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <img className="brand-logo" src={inkfigLogo} alt={t("app.name")} />
          <div><strong>{t("app.name")}</strong><small>{t("app.tagline")}</small></div>
          <button aria-label="Close" className="icon-button close-menu" type="button" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="nav-list" aria-label={t("nav.primary")}>
          <NavLink to={dashboardPath} onClick={() => setMenuOpen(false)}><LayoutDashboard size={18} />{t("nav.dashboard")}</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>{session?.fullName || session?.email}</span>
          <button type="button" onClick={signOut}><LogOut size={17} />{t("nav.logout")}</button>
        </div>
      </aside>
      {menuOpen && <button aria-label="Close menu" className="sidebar-backdrop" type="button" onClick={() => setMenuOpen(false)} />}
      <section className="main-area">
        <header className="topbar">
          <button aria-label={t("nav.menu")} className="icon-button menu-button" type="button" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <strong>{t("dashboard.title")}</strong>
          <ThemeToggle />
          <button className="language-button" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
            {language === "ar" ? "English" : "العربية"}
          </button>
        </header>
        <section className="page-content"><Outlet /></section>
      </section>
    </main>
  );
}
