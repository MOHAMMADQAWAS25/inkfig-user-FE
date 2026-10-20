import { CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, UserCheck, Users, UserX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { useDebouncedSearch } from "../../lib/useDebouncedSearch";
import type { AuthSession } from "../../shared/types";
import { useAuth } from "../auth/AuthContext";
import { AppSidebar } from "../navigation/AppSidebar";
import { getManagedUsersPage, setManagedUserRole, setManagedUserStatus } from "./administrationApi";
import type { ManagedUser, ManagedUserPage } from "./administrationApi";

const PAGE_SIZE=10;
const roles:AuthSession["role"][]=["viewer","user","supervisor","admin","system_administrator"];
type StatusFilter="all"|"active"|"suspended";
type PendingAction={kind:"role";user:ManagedUser;role:AuthSession["role"]}|{kind:"status";user:ManagedUser;isActive:boolean};

export function AdminUsersPage(){
 const {session}=useAuth();const {language,t}=useI18n();
 const client=useQueryClient();const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const [query,setQuery]=useState("");const [roleFilter,setRoleFilter]=useState<"all"|AuthSession["role"]>("all");const [statusFilter,setStatusFilter]=useState<StatusFilter>("all");
 const settledQuery=useDebouncedSearch(query).trim();
 const scope=JSON.stringify([session?.userId,settledQuery,roleFilter,statusFilter]);
 const [pagination,setPagination]=useState({scope:"",page:1});
 const page=pagination.scope===scope?pagination.page:1;
 const setPage=(value:number|((previous:number)=>number))=>setPagination({scope,page:typeof value==="function"?value(page):value});
 const [pending,setPending]=useState<PendingAction|null>(null);const [changing,setChanging]=useState(false);
 const canRead=Boolean(session&&session.role==="system_administrator"&&hasPermission(session.permissions,"users.read"));
 const canChangeRoles=Boolean(session&&hasPermission(session.permissions,"users.role.manage"));const canChangeStatus=Boolean(session&&hasPermission(session.permissions,"users.status.manage"));
 const directory=useQuery<ManagedUserPage>({queryKey:["admin-users",scope,page],enabled:canRead,placeholderData:previous=>previous,
   queryFn:({signal})=>getManagedUsersPage((page-1)*PAGE_SIZE,{limit:PAGE_SIZE,query:settledQuery,role:roleFilter==="all"?undefined:roleFilter,isActive:statusFilter==="all"?undefined:statusFilter==="active"},signal),retry:false});
 const users=directory.data?.items??[];const visibleUsers=users;
 const total=directory.data?.total??0;const summary=directory.data?.summary??{total:0,active:0,administrators:0};
 const loading=directory.isFetching;const loadUsers=()=>directory.refetch();
 const pageCount=Math.max(1,Math.ceil(total/PAGE_SIZE));const activeCount=summary.active;const elevatedCount=summary.administrators;
 useEffect(()=>{if(directory.data&&page>pageCount)setPage(pageCount);},[directory.data,page,pageCount]);
 if(!session)return <Navigate replace to={`/${language}/login`}/>;if(!canRead)return <Navigate replace to={`/${language}`}/>;
 async function confirmAction(){if(!pending||changing)return;setChanging(true);setError("");setNotice("");try{if(pending.kind==="role")await setManagedUserRole(pending.user.user_id,pending.role);else await setManagedUserStatus(pending.user.user_id,pending.isActive);await client.invalidateQueries({queryKey:["admin-users"]});setNotice(t(pending.kind==="role"?"admin.roleChanged":"admin.statusChanged"));setPending(null);}catch{setError(t(pending.kind==="role"?"admin.roleChangeFailed":"admin.statusChangeFailed"));}finally{setChanging(false)}}
 return <main className="admin-page app-page-with-sidebar"><AppSidebar/><section className="admin-shell">
  <header className="admin-hero"><div><span><ShieldCheck size={17}/>{t("admin.systemArea")}</span><h1>{t("admin.title")}</h1><p>{t("admin.description")}</p></div><button className="admin-refresh" type="button" disabled={loading} onClick={()=>void loadUsers()}><RefreshCw size={18} className={loading?"spin":""}/>{t("admin.refresh")}</button></header>
  <section className="admin-stats" aria-label={t("admin.overview")}><article><Users/><div><strong>{summary.total}</strong><span>{t("admin.totalUsers")}</span></div></article><article><UserCheck/><div><strong>{activeCount}</strong><span>{t("admin.activeUsers")}</span></div></article><article><UserX/><div><strong>{summary.total-activeCount}</strong><span>{t("admin.suspendedUsers")}</span></div></article><article><ShieldCheck/><div><strong>{elevatedCount}</strong><span>{t("admin.administrators")}</span></div></article></section>
  <section className="admin-directory"><header><div><h2>{t("admin.directory")}</h2><p>{t("admin.directoryDescription")}</p></div><span>{t("admin.results").replace("{count}",String(total))}</span></header>
   <div className="admin-filters"><label className="admin-search"><Search size={18}/><span className="sr-only">{t("admin.search")}</span><input type="search" maxLength={200} value={query} placeholder={t("admin.searchPlaceholder")} onChange={event=>setQuery(event.target.value)}/>{query&&<button type="button" aria-label={t("admin.clearSearch")} onClick={()=>setQuery("")}><X size={16}/></button>}</label><label><span className="sr-only">{t("admin.filterRole")}</span><select value={roleFilter} onChange={event=>setRoleFilter(event.target.value as typeof roleFilter)}><option value="all">{t("admin.allRoles")}</option>{roles.map(role=><option key={role} value={role}>{t(`admin.role.${role}`)}</option>)}</select></label><label><span className="sr-only">{t("admin.filterStatus")}</span><select value={statusFilter} onChange={event=>setStatusFilter(event.target.value as StatusFilter)}><option value="all">{t("admin.allStatuses")}</option><option value="active">{t("admin.active")}</option><option value="suspended">{t("admin.suspended")}</option></select></label></div>
   {notice&&<p className="admin-notice" role="status"><CheckCircle2 size={17}/>{notice}</p>}{(error||directory.error)&&<div className="admin-error" role="alert"><span>{error||t("admin.loadFailed")}</span><button type="button" onClick={()=>void loadUsers()}>{t("admin.tryAgain")}</button></div>}
   {loading?<div className="admin-loading" aria-label={t("admin.loading")}>{Array.from({length:5},(_,index)=><span key={index}/>)}</div>:directory.error?null:visibleUsers.length===0?<div className="admin-empty"><Users size={34}/><h3>{t("admin.noUsers")}</h3><p>{t("admin.noUsersDescription")}</p></div>:<div className="admin-user-list">{visibleUsers.map(user=>{const ownAccount=user.user_id===session.userId;return <article className="admin-user-row" key={user.user_id}><div className="admin-user-identity"><span className="admin-user-avatar">{user.full_name.trim().charAt(0).toLocaleUpperCase(language)}</span><div><strong>{user.full_name}{ownAccount&&<small>{t("admin.you")}</small>}</strong><span>{user.email}</span></div></div><span className={`admin-status ${user.is_active?"active":"suspended"}`}><i/>{t(user.is_active?"admin.active":"admin.suspended")}</span><label className="admin-role-control"><span>{t("admin.roleLabel")}</span><select aria-label={`${t("admin.roleLabel")}: ${user.full_name}`} value={user.role} disabled={ownAccount||!canChangeRoles||changing} onChange={event=>setPending({kind:"role",user,role:event.target.value as AuthSession["role"]})}>{roles.map(role=><option key={role} value={role}>{t(`admin.role.${role}`)}</option>)}</select></label><button type="button" disabled={ownAccount||!canChangeStatus||changing} className={user.is_active?"admin-suspend":"admin-activate"} onClick={()=>setPending({kind:"status",user,isActive:!user.is_active})}>{user.is_active?<UserX size={17}/>:<UserCheck size={17}/>}<span>{t(user.is_active?"admin.suspend":"admin.activate")}</span></button></article>})}</div>}
   {!loading&&total>PAGE_SIZE&&<nav className="admin-pagination" aria-label={t("admin.pagination")}><button type="button" disabled={page===1} onClick={()=>setPage(current=>current-1)}><ChevronLeft size={18}/><span>{t("admin.previous")}</span></button><span>{t("admin.pageOf").replace("{page}",String(page)).replace("{pages}",String(pageCount))}</span><button type="button" disabled={page===pageCount} onClick={()=>setPage(current=>current+1)}><span>{t("admin.next")}</span><ChevronRight size={18}/></button></nav>}
  </section>
 </section>{pending&&<div className="admin-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!changing)setPending(null)}}><section className="admin-dialog" role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title"><button className="admin-dialog-close" type="button" aria-label={t("admin.cancel")} disabled={changing} onClick={()=>setPending(null)}><X size={19}/></button><span className={pending.kind==="status"&&!pending.isActive?"danger":""}>{pending.kind==="role"?<ShieldCheck/>:pending.isActive?<UserCheck/>:<UserX/>}</span><h2 id="admin-confirm-title">{t(pending.kind==="role"?"admin.confirmRoleTitle":pending.isActive?"admin.confirmActivateTitle":"admin.confirmSuspendTitle")}</h2><p>{t(pending.kind==="role"?"admin.confirmRoleDescription":pending.isActive?"admin.confirmActivateDescription":"admin.confirmSuspendDescription").replace("{name}",pending.user.full_name).replace("{role}",pending.kind==="role"?t(`admin.role.${pending.role}`):"")}</p><div><button type="button" disabled={changing} onClick={()=>setPending(null)}>{t("admin.cancel")}</button><button className={pending.kind==="status"&&!pending.isActive?"danger-button":"primary-button"} type="button" disabled={changing} onClick={()=>void confirmAction()}>{t(changing?"admin.applying":"admin.confirm")}</button></div></section></div>}</main>;
}
