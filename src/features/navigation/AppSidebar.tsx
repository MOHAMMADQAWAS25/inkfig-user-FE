import { Bell, Bookmark, Flag, House, Plus, Search, Settings, ShieldCheck, Trophy, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState, type SetStateAction, type MouseEvent } from "react";
import { usePageScrollLock } from "../layout/usePageScrollLock";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { getWebSocketTicket, notificationTarget } from "../notifications/notificationApi";
import { useNotificationInbox } from "../notifications/useNotificationInbox";
import { useExhibitionCounts } from "../exhibitions/useExhibitionCounts";
import { useReportCount } from "../reports/useReportCount";
import { searchProfilesPage } from "../profile/profileApi";
import type { ProfileSearchResult } from "../profile/profileApi";
import { useMobileViewport } from "../../lib/useMobileViewport";
import { SEARCH_DEBOUNCE_MS } from "../../lib/useDebouncedSearch";
import { MobileNavigation } from "./MobileNavigation";
import { useDismissOnly } from "../layout/useDismissOnly";

export function AppSidebar() {
  const mobile = useMobileViewport();
  const { language, t } = useI18n();
  const { session } = useAuth();
  const location = useLocation();
  const labeledRail = true;
  const navigate = useNavigate();
  const navigationTimerRef=useRef<number|undefined>(undefined);
  const [accountsOpen,setAccountsOpenRaw]=useState(false);
  const [notificationsOpen,setNotificationsOpenRaw]=useState(false);
  const [closingPanels,setClosingPanels]=useState({accounts:false,notifications:false});
  const panelStateRef=useRef({accounts:false,notifications:false});
  const panelTimersRef=useRef<Partial<Record<"accounts"|"notifications",number>>>({});






  const [accountQuery,setAccountQuery]=useState("");
  const [accounts,setAccounts]=useState<ProfileSearchResult[]>([]);
  const [nextCursor,setNextCursor]=useState<number|null>(null);
  const [loading,setLoading]=useState(false);
  const [loadingMore,setLoadingMore]=useState(false);
  const [searchFailed,setSearchFailed]=useState(false);
  const searchInputRef=useRef<HTMLInputElement>(null);
  const accountSearchGeneration=useRef(0);


  const savedActive = location.pathname === `/${language}/profile` && new URLSearchParams(location.search).get("section") === "saved";
  const items = [
    { to: `/${language}`, label: t("nav.home"), icon: House, className: "mobile-nav-home", end: true },
    { to: `/${language}/exhibition`, label: t("nav.exhibition"), icon: Trophy, className: "mobile-nav-exhibition" },
    { to: `/${language}/upload`, label: t("nav.upload"), icon: Plus, className: "mobile-nav-upload" },
  ];
  const showSystemAdministration=session?.role==="system_administrator"&&hasPermission(session.permissions,"users.read");
  const showReportAdministration=Boolean(session&&hasPermission(session.permissions,"reports.manage"));
  const normalizedQuery=accountQuery.trim();
  const inbox=useNotificationInbox(session?.userId,notificationsOpen&&!closingPanels.notifications);
  const {items:notifications,unread:unreadCount,loading:notificationsLoading,cursor:notificationsCursor,loadingMore:notificationsLoadingMore}=inbox;
  const exhibitionCounts=useExhibitionCounts();
  const reportCount=useReportCount();
  const activePanel = accountsOpen ? "account-discovery-panel" : notificationsOpen ? "notifications-panel" : null;
  usePageScrollLock(activePanel !== null);
  useLayoutEffect(() => {
    if (!activePanel) return;
    const panel = document.getElementById(activePanel);
    if (!panel) return;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const previous = document.activeElement as HTMLElement | null;
    const controls = () => Array.from(panel.querySelectorAll<HTMLElement>('input,button:not(:disabled),a[href],[tabindex="0"]'))
      .sort((a,b) => a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    if (!document.querySelector('dialog[open]')) (panel.querySelector<HTMLInputElement>('input') ?? controls()[0])?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || document.querySelector('dialog[open]')) return;
      const nodes = controls(), first = nodes[0], last = nodes[nodes.length - 1];
      if (!panel.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const focus = (event: FocusEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.target instanceof Element && !panel.contains(event.target) && !event.target.closest(`[aria-controls="${activePanel}"]`)) controls()[0]?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focus);
    return () => { document.removeEventListener("keydown", keydown, true); document.removeEventListener("focusin", focus); panel.removeAttribute("role"); panel.removeAttribute("aria-modal"); if (previous?.isConnected && !document.querySelector('dialog[open]')) previous.focus({ preventScroll: true }); };
  }, [activePanel]);
  function transitionPanel(kind:"accounts"|"notifications",value:SetStateAction<boolean>){
    const current=panelStateRef.current[kind];
    const next=typeof value==="function"?value(current):value;
    if(!current&&!next)return;
    const raw=kind==="accounts"?setAccountsOpenRaw:setNotificationsOpenRaw;
    const timer=panelTimersRef.current[kind];
    if(timer!==undefined)window.clearTimeout(timer);
    panelStateRef.current[kind]=next;
    if(current&&!next){
      setClosingPanels(state=>({...state,[kind]:true}));
      panelTimersRef.current[kind]=window.setTimeout(()=>{
        raw(false);setClosingPanels(state=>({...state,[kind]:false}));
      },280);
    }else if(next){
      setClosingPanels(state=>({...state,[kind]:false}));raw(true);
    }
  }
  useEffect(()=>()=>{for(const timer of Object.values(panelTimersRef.current))window.clearTimeout(timer);},[]);
  function navigateAfterClosing(event:MouseEvent<HTMLElement>){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target instanceof Element?event.target.closest("a"):null;
    if(!link||!(panelStateRef.current.accounts||panelStateRef.current.notifications))return;
    const href=link.getAttribute("href");if(!href||link.target==="_blank")return;
    event.preventDefault();setAccountsOpen(false);setNotificationsOpen(false);
    if(navigationTimerRef.current!==undefined)window.clearTimeout(navigationTimerRef.current);
    navigationTimerRef.current=window.setTimeout(()=>navigate(href,{state:href===`/${language}`?{resetHome:true}:undefined}),280);
  }
  useEffect(()=>()=>{if(navigationTimerRef.current!==undefined)window.clearTimeout(navigationTimerRef.current);},[]);
  function setAccountsOpen(value:SetStateAction<boolean>){transitionPanel("accounts",value);}
  function setNotificationsOpen(value:SetStateAction<boolean>){transitionPanel("notifications",value);}
  useEffect(()=>{
    if(!session)return;
    let active=true;let socket:WebSocket|null=null;let retry:number|undefined;let attempts=0;
    const changed=()=>{window.dispatchEvent(new Event("inkfig:notifications-changed"));window.dispatchEvent(new CustomEvent("inkfig:exhibitions-changed"));window.dispatchEvent(new Event("inkfig:reports-changed"));};
    const connect=async()=>{
      try{
        const access=await getWebSocketTicket();if(!active)return;
        socket=new WebSocket(`${access.websocket_url}?ticket=${encodeURIComponent(access.ticket)}`);
        socket.onopen=()=>{if(active){attempts=0;changed();}};
        socket.onmessage=event=>{
          if(!active)return;
          try{
            const data=JSON.parse(String(event.data));
            if(data.type==="notifications.changed")window.dispatchEvent(new Event("inkfig:notifications-changed"));
            else if(data.type==="reports.changed")window.dispatchEvent(new Event("inkfig:reports-changed"));
            else if(data.type==="exhibitions.changed"&&typeof data.exhibition_id==="string")window.dispatchEvent(new CustomEvent("inkfig:exhibitions-changed",{detail:{exhibition_id:data.exhibition_id}}));
          }catch{/* Ignore malformed signals. */}
        };
        socket.onclose=()=>{if(active){attempts++;retry=window.setTimeout(()=>void connect(),Math.min(30000,1000*2**Math.min(attempts,5)));}};
      }catch{if(active){attempts++;retry=window.setTimeout(()=>void connect(),Math.min(30000,1000*2**Math.min(attempts,5)));}}
    };
    void connect();return()=>{active=false;if(retry!==undefined)window.clearTimeout(retry);socket?.close();};
  },[session?.userId]);
  useEffect(()=>{if(!accountsOpen){return;}window.setTimeout(()=>searchInputRef.current?.focus(),0);},[accountsOpen]);
  useEffect(()=>{accountSearchGeneration.current+=1;setLoadingMore(false);if(!accountsOpen||normalizedQuery.length<1){setAccounts([]);setNextCursor(null);setLoading(false);setSearchFailed(false);return;}let active=true;setAccounts([]);setNextCursor(null);setLoading(true);setSearchFailed(false);const timer=window.setTimeout(()=>{searchProfilesPage(normalizedQuery).then(page=>{if(active){setAccounts(page.items);setNextCursor(page.next_cursor)}}).catch(()=>{if(active){setAccounts([]);setNextCursor(null);setSearchFailed(true)}}).finally(()=>{if(active)setLoading(false)});},SEARCH_DEBOUNCE_MS);return()=>{active=false;accountSearchGeneration.current+=1;window.clearTimeout(timer)};},[accountsOpen,normalizedQuery,accountQuery]);
  useEffect(()=>{setAccountsOpen(false);setNotificationsOpen(false);},[location.pathname,location.search]);
  useEffect(()=>{if(!accountsOpen&&!notificationsOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!document.querySelector('dialog[open]')){if(accountsOpen)closeAccounts();if(notificationsOpen)closeNotifications();}};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[accountsOpen,notificationsOpen]);
  function closeAccounts(){setAccountsOpen(false);}
  useDismissOnly(accountsOpen || notificationsOpen, target => Boolean(
    target.closest('dialog[open]') ||
    (accountsOpen && target.closest('#account-discovery-panel, [aria-controls="account-discovery-panel"]')) ||
    (notificationsOpen && target.closest('#notifications-panel, [aria-controls="notifications-panel"]'))
  ), () => { setAccountsOpen(false); setNotificationsOpen(false); });
  function closeNotifications(){setNotificationsOpen(false);}
  async function loadMoreAccounts(){if(nextCursor===null||loading||loadingMore)return;const generation=accountSearchGeneration.current;setLoadingMore(true);setSearchFailed(false);try{const page=await searchProfilesPage(normalizedQuery,nextCursor);if(generation!==accountSearchGeneration.current)return;setAccounts(current=>{const known=new Set(current.map(account=>account.user_id));return [...current,...page.items.filter(account=>!known.has(account.user_id))];});setNextCursor(page.next_cursor);}catch{if(generation===accountSearchGeneration.current)setSearchFailed(true);}finally{if(generation===accountSearchGeneration.current)setLoadingMore(false)}}


  return <>{mobile ? <MobileNavigation unreadCount={unreadCount} notificationsOpen={notificationsOpen} onNotifications={()=>{setAccountsOpen(false);setNotificationsOpen(open=>!open);}} onAccounts={()=>{setNotificationsOpen(false);setAccountsOpen(true);}} administration={Boolean(showSystemAdministration)} reports={showReportAdministration} exhibitionCount={exhibitionCounts?.total??0} reportCount={reportCount??0} onNavigateCapture={navigateAfterClosing}/> : <aside className={`app-sidebar${labeledRail ? " app-sidebar-labeled" : ""}`} onClickCapture={navigateAfterClosing} aria-label={t("nav.primary")}>
    <Link className="app-sidebar-logo" to={`/${language}`} state={{resetHome:true}} aria-label={t("app.name")}><img src={inkfigLogo} alt="" /></Link>
    <nav className="app-sidebar-nav">
      {items.map(({to,label,icon:Icon,className,end})=><NavLink className={className} key={to} to={to} state={end?{resetHome:true}:undefined} end={end} aria-label={label} data-tooltip={labeledRail ? undefined : label}><Icon aria-hidden="true" size={24}/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{label}</span>}{className==="mobile-nav-exhibition"&&(exhibitionCounts?.total??0)>0&&<span className="notification-badge">{exhibitionCounts!.total>99?"99+":exhibitionCounts!.total}</span>}</NavLink>)}
      <button className={`app-sidebar-panel-button${notificationsOpen?" active":""}`} type="button" aria-label={t("nav.notifications")} data-tooltip={labeledRail ? undefined : t("nav.notifications")} aria-expanded={notificationsOpen} aria-controls="notifications-panel" onClick={()=>{setAccountsOpen(false);setNotificationsOpen(open=>!open);}}><Bell aria-hidden="true" size={24}/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{t("nav.notifications")}</span>}{unreadCount>0&&<span className="notification-badge">{unreadCount>99?"99+":unreadCount}</span>}</button>
      {showSystemAdministration&&<NavLink className="mobile-nav-admin" to={`/${language}/admin/users`} aria-label={t("nav.administration")} data-tooltip={labeledRail ? undefined : t("nav.administration")}><ShieldCheck aria-hidden="true" size={24}/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{t("nav.administration")}</span>}</NavLink>}
      {showReportAdministration&&<NavLink className="mobile-nav-reports" to={`/${language}/admin/reports`} aria-label={t("nav.reports")} data-tooltip={labeledRail ? undefined : t("nav.reports")}><Flag aria-hidden="true" size={24}/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{t("nav.reports")}</span>}{(reportCount??0)>0&&<span className="notification-badge">{reportCount!>99?"99+":reportCount}</span>}</NavLink>}
      <button className={`app-sidebar-people-search${accountsOpen?" active":""}`} type="button" aria-label={t("accounts.findUsers")} data-tooltip={labeledRail ? undefined : t("accounts.findUsers")} aria-expanded={accountsOpen} aria-controls="account-discovery-panel" onClick={()=>{setNotificationsOpen(false);setAccountsOpen(open=>!open);}}><span className="app-sidebar-people-icon" aria-hidden="true"/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{t("accounts.findUsers")}</span>}</button>
      <Link className={`mobile-nav-saved${savedActive?" active":""}`} to={`/${language}/profile?section=saved`} aria-label={t("nav.saved")} data-tooltip={labeledRail ? undefined : t("nav.saved")}><Bookmark aria-hidden="true" size={24}/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{t("nav.saved")}</span>}</Link>
    </nav>
    <NavLink className="app-sidebar-settings" to={`/${language}/settings`} aria-label={t("nav.settings")} data-tooltip={labeledRail ? undefined : t("nav.settings")}><Settings aria-hidden="true" size={24}/>{labeledRail && <span className="app-sidebar-label" aria-hidden="true">{t("nav.settings")}</span>}</NavLink>
  </aside>}{notificationsOpen&&<><button className={`account-discovery-backdrop sidebar-panel-enter${closingPanels.notifications?" sidebar-panel-exit":""}`} type="button" aria-label={t("notifications.close")} onClick={()=>setNotificationsOpen(false)}/><section className={`account-discovery-panel notifications-panel sidebar-panel-enter${closingPanels.notifications?" sidebar-panel-exit":""}`} id="notifications-panel" onClickCapture={navigateAfterClosing} aria-label={t("nav.notifications")}><header><h2>{t("nav.notifications")}</h2><button type="button" aria-label={t("notifications.close")} onClick={()=>setNotificationsOpen(false)}><X aria-hidden="true" size={20}/></button></header>{notificationsLoading?<p className="notifications-status">{t("notifications.loading")}</p>:notifications.length===0?<div className="notifications-empty"><Bell aria-hidden="true" size={30}/><h3>{t("notifications.emptyTitle")}</h3><p>{t("notifications.emptyDescription")}</p></div>:<div className="notifications-list">{notifications.map(item=><article key={item.notification_id} className={item.read?"":"unread"}><Link className="notification-avatar" to={`/${language}/profile/${item.actor_user_id}`} aria-label={item.actor_name}>{item.actor_avatar_url?<img src={item.actor_avatar_url} alt=""/>:item.actor_name.trim().charAt(0).toLocaleUpperCase(language)}</Link><Link className="notification-content" to={notificationTarget(item,language)}><span><strong>{item.actor_name}</strong> {t(`notifications.${item.event_type}` as "notifications.follow"|"notifications.like"|"notifications.save")}{item.work_title&&<b className="notification-work-title">{item.work_title}</b>}{item.exhibition_name&&<b className="notification-work-title">{item.exhibition_name}</b>}{item.decision_reason&&<small>{item.decision_reason}</small>}<small>{new Intl.DateTimeFormat(language,{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.created_at))}</small></span></Link></article>)}{notificationsCursor!==null&&<button className="account-discovery-load-more" type="button" disabled={notificationsLoadingMore} onClick={()=>void inbox.more()}>{t(notificationsLoadingMore?"accounts.loadingMore":"accounts.loadMore")}</button>}</div>}</section></>}
  {accountsOpen&&<><button className={`account-discovery-backdrop sidebar-panel-enter${closingPanels.accounts?" sidebar-panel-exit":""}`} type="button" aria-label={t("accounts.closeSearch")} onClick={()=>setAccountsOpen(false)}/><section className={`account-discovery-panel sidebar-panel-enter${closingPanels.accounts?" sidebar-panel-exit":""}`} id="account-discovery-panel" onClickCapture={navigateAfterClosing} aria-label={t("accounts.title")}><header><h2>{t("accounts.title")}</h2><button type="button" aria-label={t("accounts.closeSearch")} onClick={()=>setAccountsOpen(false)}><X aria-hidden="true" size={20}/></button></header><label className="account-discovery-input"><Search aria-hidden="true" size={19}/><span className="sr-only">{t("accounts.searchLabel")}</span><input ref={searchInputRef} type="search" value={accountQuery} placeholder={t("accounts.searchPlaceholder")} onChange={event=>setAccountQuery(event.target.value)}/></label><div className="account-discovery-results" aria-live="polite">{normalizedQuery.length<1?<p>{t("accounts.startTyping")}</p>:loading?<p>{t("accounts.searching")}</p>:searchFailed&&accounts.length===0?<p role="alert">{t("accounts.searchFailed")}</p>:accounts.length===0?<p>{t("accounts.empty")}</p>:<>{accounts.map(account=><Link key={account.user_id} to={`/${language}/profile/${account.user_id}`} onClick={()=>setAccountsOpen(false)}>{account.avatar_url?<img src={account.avatar_url} alt=""/>:<span>{account.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span>}<strong>{account.full_name}</strong></Link>)}{nextCursor!==null&&<button className="account-discovery-load-more" type="button" disabled={loadingMore} onClick={loadMoreAccounts}>{t(loadingMore?"accounts.loadingMore":"accounts.loadMore")}</button>}{searchFailed&&<p role="alert">{t("accounts.searchFailed")}</p>}</>}</div></section></>}</>
}
