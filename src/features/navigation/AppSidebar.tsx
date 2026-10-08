import { Bell, Bookmark, House, Plus, Search, Settings, ShieldCheck, Trophy, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type SetStateAction } from "react";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { getNotifications, getWebSocketTicket, markNotificationsRead, type NotificationItem } from "../notifications/notificationApi";
import { searchProfilesPage } from "../profile/profileApi";
import type { ProfileSearchResult } from "../profile/profileApi";

export function AppSidebar() {
  const { language, t } = useI18n();
  const { session } = useAuth();
  const location = useLocation();
  const [accountsOpen,setAccountsOpenRaw]=useState(false);
  const [notificationsOpen,setNotificationsOpenRaw]=useState(false);
  const [closingPanel,setClosingPanel]=useState<"accounts"|"notifications"|null>(null);
  const [notifications,setNotifications]=useState<NotificationItem[]>([]);
  const [unreadCount,setUnreadCount]=useState(0);
  const [notificationsLoading,setNotificationsLoading]=useState(false);
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
  ];
  const showSystemAdministration=session?.role==="system_administrator"&&hasPermission(session.permissions,"users.read");
  const normalizedQuery=accountQuery.trim();
  function transitionPanel(kind:"accounts"|"notifications",value:SetStateAction<boolean>){const raw=kind==="accounts"?setAccountsOpenRaw:setNotificationsOpenRaw;raw(current=>{const next=typeof value==="function"?value(current):value;if(current&&!next){setClosingPanel(kind);window.setTimeout(()=>{raw(false);setClosingPanel(open=>open===kind?null:open);},260);return current;}return next;});}
  function setAccountsOpen(value:SetStateAction<boolean>){transitionPanel("accounts",value);}
  function setNotificationsOpen(value:SetStateAction<boolean>){transitionPanel("notifications",value);}
  async function refreshNotifications(){if(!session)return;try{const feed=await getNotifications();setNotifications(feed.items);setUnreadCount(feed.unread_count);}catch{return;}}
  useEffect(()=>{if(!session){setNotifications([]);setUnreadCount(0);return;}void refreshNotifications();},[session]);
  useEffect(()=>{if(!session)return;let active=true;let socket:WebSocket|null=null;let retry:number|undefined;let attempts=0;const connect=async()=>{try{const access=await getWebSocketTicket();if(!active)return;socket=new WebSocket(`${access.websocket_url}?ticket=${encodeURIComponent(access.ticket)}`);socket.onopen=()=>{attempts=0};socket.onmessage=event=>{try{if(JSON.parse(String(event.data)).type==="notifications.changed")void refreshNotifications();}catch{return;}};socket.onclose=()=>{if(active){attempts+=1;retry=window.setTimeout(()=>void connect(),Math.min(30000,1000*2**Math.min(attempts,5)));}};}catch{if(active){attempts+=1;retry=window.setTimeout(()=>void connect(),Math.min(30000,1000*2**Math.min(attempts,5)));}}};void connect();return()=>{active=false;if(retry!==undefined)window.clearTimeout(retry);socket?.close();};},[session]);
  useEffect(()=>{if(!notificationsOpen||!session)return;setNotificationsLoading(true);getNotifications().then(feed=>{setNotifications(feed.items);setUnreadCount(feed.unread_count);if(feed.unread_count>0)return markNotificationsRead().then(()=>setUnreadCount(0));}).catch(()=>undefined).finally(()=>setNotificationsLoading(false));},[notificationsOpen,session]);
  useEffect(()=>{if(!accountsOpen){return;}window.setTimeout(()=>searchInputRef.current?.focus(),0);},[accountsOpen]);
  useEffect(()=>{if(!accountsOpen||normalizedQuery.length<1){setAccounts([]);setNextCursor(null);setLoading(false);setSearchFailed(false);return;}let active=true;setLoading(true);setSearchFailed(false);const timer=window.setTimeout(()=>{searchProfilesPage(normalizedQuery).then(page=>{if(active){setAccounts(page.items);setNextCursor(page.next_cursor)}}).catch(()=>{if(active){setAccounts([]);setNextCursor(null);setSearchFailed(true)}}).finally(()=>{if(active)setLoading(false)});},250);return()=>{active=false;window.clearTimeout(timer)};},[accountsOpen,normalizedQuery]);
  useEffect(()=>{setAccountsOpen(false);setNotificationsOpen(false);},[location.pathname,location.search]);
  useEffect(()=>{if(!accountsOpen&&!notificationsOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){if(accountsOpen)closeAccounts();if(notificationsOpen)closeNotifications();}};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[accountsOpen,notificationsOpen]);
  function closeAccounts(){setAccountsOpen(false);}
  function closeNotifications(){setNotificationsOpen(false);}
  async function loadMoreAccounts(){if(nextCursor===null||loadingMore)return;setLoadingMore(true);setSearchFailed(false);try{const page=await searchProfilesPage(normalizedQuery,nextCursor);setAccounts(current=>{const known=new Set(current.map(account=>account.user_id));return [...current,...page.items.filter(account=>!known.has(account.user_id))];});setNextCursor(page.next_cursor);}catch{setSearchFailed(true);}finally{setLoadingMore(false)}}

  return <><aside className={`app-sidebar closing-${closingPanel??"none"}`} aria-label={t("nav.primary")}>
    <Link className="app-sidebar-logo" to={`/${language}`} aria-label={t("app.name")}><img src={inkfigLogo} alt="" /></Link>
    <nav className="app-sidebar-nav">
      {items.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} aria-label={label} data-tooltip={label}><Icon aria-hidden="true" size={24}/></NavLink>)}
      <button className={`app-sidebar-panel-button${notificationsOpen?" active":""}`} type="button" aria-label={t("nav.notifications")} data-tooltip={t("nav.notifications")} aria-expanded={notificationsOpen} aria-controls="notifications-panel" onClick={()=>{setAccountsOpen(false);setNotificationsOpen(open=>!open);}}><Bell aria-hidden="true" size={24}/>{unreadCount>0&&<span className="notification-badge">{unreadCount>99?"99+":unreadCount}</span>}</button>
      {showSystemAdministration&&<NavLink to={`/${language}/admin/users`} aria-label={t("nav.administration")} data-tooltip={t("nav.administration")}><ShieldCheck aria-hidden="true" size={24}/></NavLink>}
      <button className={`app-sidebar-people-search${accountsOpen?" active":""}`} type="button" aria-label={t("accounts.findUsers")} data-tooltip={t("accounts.findUsers")} aria-expanded={accountsOpen} aria-controls="account-discovery-panel" onClick={()=>{setNotificationsOpen(false);setAccountsOpen(open=>!open);}}><span aria-hidden="true"/></button>
      <Link className={savedActive?"active":""} to={`/${language}/profile?section=saved`} aria-label={t("nav.saved")} data-tooltip={t("nav.saved")}><Bookmark aria-hidden="true" size={24}/></Link>
    </nav>
    <NavLink className="app-sidebar-settings" to={`/${language}/settings`} aria-label={t("nav.settings")} data-tooltip={t("nav.settings")}><Settings aria-hidden="true" size={24}/></NavLink>
    {notificationsOpen&&<><button className="account-discovery-backdrop sidebar-panel-enter" type="button" aria-label={t("notifications.close")} onClick={()=>setNotificationsOpen(false)}/><section className="account-discovery-panel notifications-panel sidebar-panel-enter" id="notifications-panel" aria-label={t("nav.notifications")}><header><h2>{t("nav.notifications")}</h2><button type="button" aria-label={t("notifications.close")} onClick={()=>setNotificationsOpen(false)}><X aria-hidden="true" size={20}/></button></header>{notificationsLoading?<p className="notifications-status">{t("notifications.loading")}</p>:notifications.length===0?<div className="notifications-empty"><Bell aria-hidden="true" size={30}/><h3>{t("notifications.emptyTitle")}</h3><p>{t("notifications.emptyDescription")}</p></div>:<div className="notifications-list">{notifications.map(item=><Link key={item.notification_id} className={item.read?"":"unread"} to={`/${language}/profile/${item.actor_user_id}`}><span className="notification-avatar">{item.actor_avatar_url?<img src={item.actor_avatar_url} alt=""/>:item.actor_name.trim().charAt(0).toLocaleUpperCase(language)}</span><span><strong>{item.actor_name}</strong> {t(`notifications.${item.event_type}` as "notifications.follow"|"notifications.like"|"notifications.save")}<small>{new Intl.DateTimeFormat(language,{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.created_at))}</small></span></Link>)}</div>}</section></>}
  </aside>{accountsOpen&&<><button className="account-discovery-backdrop sidebar-panel-enter" type="button" aria-label={t("accounts.closeSearch")} onClick={()=>setAccountsOpen(false)}/><section className="account-discovery-panel sidebar-panel-enter" id="account-discovery-panel" aria-label={t("accounts.title")}><header><h2>{t("accounts.title")}</h2><button type="button" aria-label={t("accounts.closeSearch")} onClick={()=>setAccountsOpen(false)}><X aria-hidden="true" size={20}/></button></header><label className="account-discovery-input"><Search aria-hidden="true" size={19}/><span className="sr-only">{t("accounts.searchLabel")}</span><input ref={searchInputRef} type="search" value={accountQuery} placeholder={t("accounts.searchPlaceholder")} onChange={event=>setAccountQuery(event.target.value)}/></label><div className="account-discovery-results" aria-live="polite">{normalizedQuery.length<1?<p>{t("accounts.startTyping")}</p>:loading?<p>{t("accounts.searching")}</p>:searchFailed&&accounts.length===0?<p role="alert">{t("accounts.searchFailed")}</p>:accounts.length===0?<p>{t("accounts.empty")}</p>:<>{accounts.map(account=><Link key={account.user_id} to={`/${language}/profile/${account.user_id}`} onClick={()=>setAccountsOpen(false)}>{account.avatar_url?<img src={account.avatar_url} alt=""/>:<span>{account.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span>}<strong>{account.full_name}</strong></Link>)}{nextCursor!==null&&<button className="account-discovery-load-more" type="button" disabled={loadingMore} onClick={loadMoreAccounts}>{t(loadingMore?"accounts.loadingMore":"accounts.loadMore")}</button>}{searchFailed&&<p role="alert">{t("accounts.searchFailed")}</p>}</>}</div></section></>}</>
}
