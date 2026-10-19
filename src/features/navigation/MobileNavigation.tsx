import { Bell, Bookmark, Flag, House, LogOut, Menu, Plus, Settings, ShieldCheck, Trophy, UserRound, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { LanguageToggle } from "../../i18n/LanguageToggle";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { getPublicProfile } from "../profile/profileApi";
import { useDismissOnly } from "../layout/useDismissOnly";
import { usePageScrollLock } from "../layout/usePageScrollLock";
import inkfigLogo from "../../assets/inkfig-logo.svg";

interface Props {
  unreadCount: number;
  notificationsOpen: boolean;
  onNotifications: () => void;
  onAccounts: () => void;
  administration: boolean;
  reports: boolean;
  exhibitionCount?: number;
  reportCount?: number;
  onNavigateCapture?: (event: MouseEvent<HTMLElement>) => void;
}

export function MobileNavigation({ unreadCount, notificationsOpen, onNotifications, onAccounts, administration, reports, exhibitionCount = 0, reportCount = 0, onNavigateCapture }: Props) {
  const { language, t, setLanguage } = useI18n();
  const { session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<{ menu: HTMLElement; notifications: HTMLElement } | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [closing, setClosing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const dialog = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pending = useRef<(() => void) | undefined>(undefined);
  const menuLabel = language === "ar" ? "القائمة" : "Menu";
  const closeLabel = language === "ar" ? "إغلاق القائمة" : "Close menu";
  const profileLabel = language === "ar" ? "الملف الشخصي" : "Profile";

  useLayoutEffect(() => {
    if (location.pathname !== `/${language}` && location.pathname !== `/${language}/`) { setSlots(null); return; }
    const menu = document.getElementById("mobile-menu-slot");
    const notifications = document.getElementById("mobile-notifications-slot");
    setSlots(menu && notifications ? { menu, notifications } : null);
  }, [location.pathname, language]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    let active = true;
    setAvatar(null);
    if (session) void getPublicProfile(session.userId).then(profile => { if (active) setAvatar(profile.avatar_url); }).catch(() => undefined);
    return () => { active = false; };
  }, [session?.userId]);
  usePageScrollLock(drawer);
  useDismissOnly(drawer, target => Boolean(target.closest('#mobile-menu, [aria-controls="mobile-menu"]')), () => close());
  function close(after?: () => void) {
    if (closing) return;
    pending.current = after;
    setClosing(true);
    timer.current = window.setTimeout(() => {
      setDrawer(false);
      setClosing(false);
      menuButton.current?.focus({ preventScroll: true });
      pending.current?.();
      pending.current = undefined;
    }, window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 240);
  }
  useEffect(() => {
    if (!drawer) return;
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab") return;
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); };
  }, [drawer, closing]);

  const menu = <button ref={menuButton} className="mobile-tool" type="button" aria-label={menuLabel} aria-expanded={drawer && !closing} aria-controls="mobile-menu" onClick={() => { if (drawer) close(); else setDrawer(true); }}><Menu aria-hidden="true" /></button>;
  const notifications = <button className="mobile-tool app-sidebar-panel-button" type="button" aria-label={t("nav.notifications")} aria-controls="notifications-panel" aria-expanded={notificationsOpen} onClick={onNotifications}><Bell aria-hidden="true" />{unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>;
  function go(path: string) { close(() => navigate(`/${language}/${path}`)); }
  function handlePreferences(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest(".language-toggle")) {
      event.preventDefault(); event.stopPropagation();
      close(() => setLanguage(language === "ar" ? "en" : "ar"));
    }
  }
  return <>
    {slots && <>{createPortal(menu, slots.menu)}{createPortal(notifications, slots.notifications)}</>}
    <nav className="mobile-bottom-nav" dir={language === "ar" ? "rtl" : "ltr"} aria-label={t("nav.primary")} onClickCapture={onNavigateCapture}>
      <NavLink to={`/${language}`} end state={{ resetHome: true }} aria-label={t("nav.home")}><House aria-hidden="true" /></NavLink>
      <NavLink to={`/${language}/upload`} aria-label={t("nav.upload")}><Plus aria-hidden="true" /></NavLink>
      <NavLink to={`/${language}/${session ? "profile" : "login"}`} aria-label={profileLabel}>{session ? <span className="mobile-nav-avatar">{avatar ? <img src={avatar} alt="" onError={() => setAvatar(null)}/> : <span aria-hidden="true">{session.fullName?.trim().charAt(0).toLocaleUpperCase(language) || "?"}</span>}</span> : <UserRound aria-hidden="true" />}</NavLink>
    </nav>
    {drawer && createPortal(<div className={`mobile-drawer-layer${closing ? " is-closing" : ""}`}>
      <button className="mobile-drawer-backdrop" type="button" aria-label={closeLabel} onClick={() => close()} tabIndex={-1} />
      <section ref={dialog} className="mobile-drawer" id="mobile-menu" role="dialog" aria-modal="true" aria-label={menuLabel} dir={language === "ar" ? "rtl" : "ltr"}>
        <header className="mobile-drawer-header" dir="ltr"><img src={inkfigLogo} alt={t("app.name")}/><button className="mobile-drawer-close" type="button" aria-label={closeLabel} onClick={() => close()}><X aria-hidden="true" /></button></header>
        <div className="mobile-drawer-grid">
          <button type="button" aria-label={t("nav.exhibition")} onClick={() => go("exhibition")}><Trophy aria-hidden="true" /><span>{t("nav.exhibition")}</span>{exhibitionCount>0&&<span className="exhibition-count">{exhibitionCount>99?"99+":exhibitionCount}</span>}</button>
          <button type="button" aria-label={t("accounts.findUsers")} onClick={() => close(onAccounts)}><span className="mobile-find-users-icon" aria-hidden="true"/><span>{t("accounts.findUsers")}</span></button>
          <button type="button" aria-label={t("nav.saved")} onClick={() => go("profile?section=saved")}><Bookmark aria-hidden="true" /><span>{t("nav.saved")}</span></button>
          {administration && <button type="button" aria-label={t("nav.administration")} onClick={() => go("admin/users")}><ShieldCheck aria-hidden="true" /><span>{t("nav.administration")}</span></button>}
          {reports && <button type="button" aria-label={t("nav.reports")} onClick={() => go("admin/reports")}><Flag aria-hidden="true" /><span>{t("nav.reports")}</span>{reportCount>0&&<span className="exhibition-count">{reportCount>99?"99+":reportCount}</span>}</button>}
          <button type="button" aria-label={t("nav.settings")} onClick={() => go("settings")}><Settings aria-hidden="true" /><span>{t("nav.settings")}</span></button>
          {session && <button type="button" aria-label={t("nav.logout")} onClick={() => close(signOut)}><LogOut aria-hidden="true" /><span>{t("nav.logout")}</span></button>}
        </div>
        <div className="mobile-drawer-preferences" dir="ltr" onClickCapture={handlePreferences}><ThemeToggle/><LanguageToggle/></div>
      </section>
    </div>, document.body)}
  </>;
}
