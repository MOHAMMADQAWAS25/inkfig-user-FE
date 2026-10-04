import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { hasPermission } from "../../lib/permissions";
import { getManagedUsers, setManagedUserRole, setManagedUserStatus } from "./administrationApi";
import type { ManagedUser } from "./administrationApi";
import type { AuthSession } from "../../shared/types";

const roles:AuthSession["role"][]=["viewer","user","supervisor","admin","system_administrator"];
export function AdminUsersPage(){
 const {session}=useAuth();const {language}=useI18n();const [users,setUsers]=useState<ManagedUser[]>([]);const [error,setError]=useState("");
 const allowed=Boolean(session&&hasPermission(session.permissions,"users.read"));
 useEffect(()=>{if(allowed)getManagedUsers().then(setUsers).catch(()=>setError("Unable to load users."));},[allowed]);
 if(!session)return <Navigate replace to={`/${language}/login`}/>;if(!allowed)return <Navigate replace to={`/${language}`}/>;
 const replace=(next:ManagedUser)=>setUsers(current=>current.map(user=>user.user_id===next.user_id?next:user));
 return <main className="admin-page"><section className="admin-card"><Link to={`/${language}`}>← Home</Link><h1>User administration</h1><p>Roles and account access are enforced by the backend.</p>{error&&<p className="error-message">{error}</p>}<div className="admin-user-list">{users.map(user=><article className="admin-user-row" key={user.user_id}><div><strong>{user.full_name}</strong><span>{user.email}</span></div><select aria-label={`Role for ${user.full_name}`} value={user.role} disabled={user.user_id===session.userId} onChange={event=>setManagedUserRole(user.user_id,event.target.value as AuthSession["role"]).then(replace).catch(()=>setError("This role change is not allowed."))}>{roles.map(role=><option key={role} value={role}>{role.replaceAll("_"," ")}</option>)}</select><button type="button" disabled={user.user_id===session.userId} className={user.is_active?"danger-button":"primary-button"} onClick={()=>setManagedUserStatus(user.user_id,!user.is_active).then(replace).catch(()=>setError("This account change is not allowed."))}>{user.is_active?"Ban":"Activate"}</button></article>)}</div></section></main>;
}
