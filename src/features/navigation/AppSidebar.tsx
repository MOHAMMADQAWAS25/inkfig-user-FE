import { Bell, Bookmark, House, Plus, Search, Settings, Trophy, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { searchProfilesPage } from "../profile/profileApi";
import type { ProfileSearchResult } from "../profile/profileApi";

export function AppSidebar() {
  const { language, t } = useI18n();
  const location = useLocation();
  const [accountsOpen,setAccountsOpen]=useState(false);
  const [accountQuery,setAccountQuery]=useState("");
  const [accounts,setAccounts]=useState<ProfileSearchResult[]>([]);
  const [nextCursor,setNextCursor]=useState<number|null>(null);
  const [loading,setLoading]=useState(false);
  const [loadingMore,setLoadingMore]=useState(false);
  const [searchFailed,setSearchFailed]=useState(false);
  const searchInputRef=useRef<HTMLInputElement>(null);
  const savedActive = location.pathname === `/${language}/profile` && new URLSearchParams(location.search).get("section") === "saved";
  const items = [
    { to: `/${language}`, label: t("nav.home"), icon: House, end: true },
    { to: `/${language}/exhibition`, label: t("nav.exhibition"), icon: Trophy },
    { to: `/${language}/upload`, label: t("nav.upload"), icon: Plus },
    { to: `/${language}/notifications`, label: t("nav.notifications"), icon: Bell },
  ];
  const normalizedQuery=accountQuery.trim();
  useEffect(()=>{if(!accountsOpen){return;}window.setTimeout(()=>searchInputRef.current?.focus(),0);},[accountsOpen]);
  useEffect(()=>{if(!accountsOpen||normalizedQuery.length<1){setAccounts([]);setNextCursor(null);setLoading(false);setSearchFailed(false);return;}let active=true;setLoading(true);setSearchFailed(false);const timer=window.setTimeout(()=>{searchProfilesPage(normalizedQuery).then(page=>{if(active){setAccounts(page.items);setNextCursor(page.next_cursor)}}).catch(()=>{if(active){setAccounts([]);setNextCursor(null);setSearchFailed(true)}}).finally(()=>{if(active)setLoading(false)});},250);return()=>{active=false;window.clearTimeout(timer)};},[accountsOpen,normalizedQuery]);
  useEffect(()=>{setAccountsOpen(false);},[location.pathname,location.search]);
  async function loadMoreAccounts(){if(nextCursor===null||loadingMore)return;setLoadingMore(true);setSearchFailed(false);try{const page=await searchProfilesPage(normalizedQuery,nextCursor);setAccounts(current=>{const known=new Set(current.map(account=>account.user_id));return [...current,...page.items.filter(account=>!known.has(account.user_id))];});setNextCursor(page.next_cursor);}catch{setSearchFailed(true);}finally{setLoadingMore(false)}}

  return <><aside className="app-sidebar" aria-label={t("nav.primary")}>
    <Link className="app-sidebar-logo" to={`/${language}`} aria-label={t("app.name")}><img src={inkfigLogo} alt="" /></Link>
    <nav className="app-sidebar-nav">
      {items.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} aria-label={label} title={label}><Icon aria-hidden="true" size={24}/></NavLink>)}
      <button className={`app-sidebar-people-search${accountsOpen?" active":""}`} type="button" aria-label={t("accounts.openSearch")} title={t("accounts.openSearch")} aria-expanded={accountsOpen} aria-controls="account-discovery-panel" onClick={()=>setAccountsOpen(open=>!open)}><span aria-hidden="true"/></button>
      <Link className={savedActive?"active":""} to={`/${language}/profile?section=saved`} aria-label={t("nav.saved")} title={t("nav.saved")}><Bookmark aria-hidden="true" size={24}/></Link>
    </nav>
    <NavLink className="app-sidebar-settings" to={`/${language}/settings`} aria-label={t("nav.settings")} title={t("nav.settings")}><Settings aria-hidden="true" size={24}/></NavLink>
  </aside>{accountsOpen&&<><button className="account-discovery-backdrop" type="button" aria-label={t("accounts.closeSearch")} onClick={()=>setAccountsOpen(false)}/><section className="account-discovery-panel" id="account-discovery-panel" aria-label={t("accounts.title")}><header><h2>{t("accounts.title")}</h2><button type="button" aria-label={t("accounts.closeSearch")} onClick={()=>setAccountsOpen(false)}><X aria-hidden="true" size={20}/></button></header><label className="account-discovery-input"><Search aria-hidden="true" size={19}/><span className="sr-only">{t("accounts.searchLabel")}</span><input ref={searchInputRef} type="search" value={accountQuery} placeholder={t("accounts.searchPlaceholder")} onChange={event=>setAccountQuery(event.target.value)}/></label><div className="account-discovery-results" aria-live="polite">{normalizedQuery.length<1?<p>{t("accounts.startTyping")}</p>:loading?<p>{t("accounts.searching")}</p>:searchFailed&&accounts.length===0?<p role="alert">{t("accounts.searchFailed")}</p>:accounts.length===0?<p>{t("accounts.empty")}</p>:<>{accounts.map(account=><Link key={account.user_id} to={`/${language}/profile/${account.user_id}`} onClick={()=>setAccountsOpen(false)}>{account.avatar_url?<img src={account.avatar_url} alt=""/>:<span>{account.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span>}<strong>{account.full_name}</strong></Link>)}{nextCursor!==null&&<button className="account-discovery-load-more" type="button" disabled={loadingMore} onClick={loadMoreAccounts}>{t(loadingMore?"accounts.loadingMore":"accounts.loadMore")}</button>}{searchFailed&&<p role="alert">{t("accounts.searchFailed")}</p>}</>}</div></section></>}</>
}
