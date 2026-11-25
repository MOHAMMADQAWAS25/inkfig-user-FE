import { LogOut, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { getPublicProfile, searchProfiles, type ProfileSearchResult } from "../profile/profileApi";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import { SEARCH_DEBOUNCE_MS } from "../../lib/useDebouncedSearch";
import { SmoothDetails } from "../layout/SmoothDetails";
import { useDismissOnly } from "../layout/useDismissOnly";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { LanguageToggle } from "../../i18n/LanguageToggle";

/** Search delegates to the existing home results route; account selection keeps its scope. */
export function ArtworkHeader() {
  const { session, signOut } = useAuth(), { language, t } = useI18n(), navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState<ProfileSearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  useDismissOnly(menuOpen, target => Boolean(menu.current?.contains(target)), () => menu.current?.removeAttribute("open"));
  const profile = useQuery({ queryKey: ["artwork-header-profile", session?.userId], enabled: Boolean(session), queryFn: () => getPublicProfile(session!.userId), staleTime: 60_000 });
  useEffect(() => {
    setAccounts([]);
    if (!focused || !query.trim().startsWith("@") || query.trim().length < 2) return;
    let active = true;
    const timer = window.setTimeout(() => { void searchProfiles(query.trim().slice(1)).then(items => { if (active) setAccounts(items); }).catch(() => undefined); }, SEARCH_DEBOUNCE_MS);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, focused]);
  function search(account?: ProfileSearchResult) {
    const params = new URLSearchParams();
    if (account) { params.set("artist", account.user_id); params.set("artistName", account.full_name); params.set("q", `@${account.full_name}`); }
    else if (query.trim()) params.set("q", query.trim());
    navigate(`/${language}${params.size ? `?${params}` : ""}`);
  }
  return <header className="artwork-header">
    <form className="gallery-search" role="search" onSubmit={event => { event.preventDefault(); search(); }} onClick={event => { if (event.target instanceof Element && !event.target.closest("input,button,a")) event.currentTarget.querySelector("input")?.focus(); }}>
      <Search size={20} aria-hidden="true"/><input type="search" aria-label={t("home.searchPlaceholder")} placeholder={t("home.searchPlaceholder")} value={query} onChange={event => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.form?.contains(event.relatedTarget)) setFocused(false); }} onKeyDown={event => { if (event.key === "Escape") { setFocused(false); event.currentTarget.blur(); } }}/>
      {focused && accounts.length > 0 && <div className="account-search-suggestions">{accounts.map(account => <button key={account.user_id} type="button" onClick={() => search(account)}><ProfileAvatar name={account.full_name} url={account.avatar_url} language={language}/><strong>{account.full_name}</strong></button>)}</div>}
    </form>
    {session ? <SmoothDetails className="gallery-profile-menu artwork-header-menu" ref={menu} onToggle={event => setMenuOpen(event.currentTarget.open)}>
      <summary aria-label={t("home.profileMenu")} title={t("home.profileMenu")}><ProfileAvatar name={session.fullName || "InkFig"} url={profile.data?.avatar_url} language={language}/></summary>
      {menuOpen && <div className="gallery-profile-popover">
        <Link className="gallery-profile-identity" to={`/${language}/profile`}><ProfileAvatar name={session.fullName || "InkFig"} url={profile.data?.avatar_url} language={language}/><div><strong>{session.fullName}</strong><small>{session.email}</small></div></Link>
        <div className="gallery-profile-preferences"><span>{t("home.preferences")}</span><div><LanguageToggle/><ThemeToggle/></div></div>
        <button type="button" onClick={signOut}><LogOut aria-hidden="true" size={18}/>{t("nav.logout")}</button>
      </div>}
    </SmoothDetails> : <Link className="artwork-header-profile gallery-guest-avatar" to={`/${language}/login`} aria-label={t("auth.signIn")}><UserRound size={22} aria-hidden="true"/></Link>}
  </header>;
}
