import { KeyRound, Shield, UserRoundPen } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { ApiError } from "../../api/httpClient";
import { useI18n } from "../../i18n/I18nProvider";
import { AppSidebar } from "../navigation/AppSidebar";
import { useAuth } from "../auth/AuthContext";
import { DateOfBirthField } from "../auth/DateOfBirthField";
import { PasswordField } from "../auth/PasswordField";
import { changePassword, deactivateAccount, loadProfileSettings, saveProfileSettings, type ProfileSettings } from "./settingsApi";

type Section = "profile" | "password" | "account";
const blankProfile: ProfileSettings = { email: "", full_name: "", phone_number: "", gender: "female", date_of_birth: "", is_active: true };

export function SettingsPage() {
  const { language, t } = useI18n();
  const { session, setSession, signOut } = useAuth();
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState(blankProfile);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    loadProfileSettings().then(setProfile).catch(() => setError(t("settings.loadFailed")));
  }, [session, t]);

  if (!session) return <Navigate replace to={`/${language}/login`} />;
  const notify = (nextMessage: string) => { setMessage(nextMessage); setError(""); };
  const fail = (nextError: string) => { setError(nextError); setMessage(""); };

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{10}$/.test(profile.phone_number)) return fail(t("auth.invalidPhoneNumber"));
    setBusy(true);
    try {
      const updated = await saveProfileSettings({ full_name: profile.full_name, phone_number: profile.phone_number, gender: profile.gender, date_of_birth: profile.date_of_birth });
      setProfile(updated);
      setSession({ ...session!, fullName: updated.full_name });
      notify(t("settings.profileSaved"));
    } catch (requestError) {
      fail(requestError instanceof ApiError && requestError.status === 409 ? t("auth.phoneExists") : t("settings.saveFailed"));
    } finally { setBusy(false); }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) return fail(t("auth.passwordMismatch"));
    setBusy(true);
    try {
      await changePassword(currentPassword, password, confirmation);
      signOut();
    } catch (requestError) {
      fail(requestError instanceof ApiError && requestError.status === 400 ? t("settings.currentPasswordInvalid") : t("settings.passwordFailed"));
    } finally { setBusy(false); }
  }

  async function deactivate() {
    if (!window.confirm(t("settings.deactivateConfirm"))) return;
    setBusy(true);
    try { await deactivateAccount(); signOut(); }
    catch { fail(t("settings.deactivateFailed")); setBusy(false); }
  }

  const tabs = [
    { key: "profile" as const, icon: UserRoundPen, label: t("settings.editProfile") },
    { key: "password" as const, icon: KeyRound, label: t("settings.password") },
    { key: "account" as const, icon: Shield, label: t("settings.account") },
  ];

  return <main className="app-page-with-sidebar settings-page"><AppSidebar/><section className="settings-shell">
    <aside className="settings-sections"><h1>{t("nav.settings")}</h1>{tabs.map(({key,icon:Icon,label})=><button className={section===key?"active":""} key={key} type="button" onClick={()=>{setSection(key);setError("");setMessage("");}}><Icon aria-hidden="true" size={19}/>{label}</button>)}</aside>
    <section className="settings-panel">
      {error&&<p className="settings-alert error" role="alert">{error}</p>}{message&&<p className="settings-alert success" role="status">{message}</p>}
      {section==="profile"&&<form onSubmit={submitProfile}><h2>{t("settings.editProfile")}</h2><p>{t("settings.profileDescription")}</p>
        <label><span>{t("auth.email")}</span><input disabled dir="ltr" value={profile.email}/><small>{t("settings.emailLocked")}</small></label>
        <label><span>{t("auth.fullName")}</span><input required maxLength={120} minLength={2} value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})}/></label>
        <label><span>{t("auth.phoneNumber")}</span><input required dir="ltr" inputMode="numeric" maxLength={10} minLength={10} pattern="[0-9]{10}" value={profile.phone_number} onChange={e=>setProfile({...profile,phone_number:e.target.value.replace(/\D/g,"")})}/></label>
        <label><span>{t("auth.gender")}</span><select value={profile.gender} onChange={e=>setProfile({...profile,gender:e.target.value as ProfileSettings["gender"]})}><option value="female">{t("auth.genderFemale")}</option><option value="male">{t("auth.genderMale")}</option></select></label>
        <DateOfBirthField label={t("auth.dateOfBirth")} value={profile.date_of_birth} onChange={date_of_birth=>setProfile({...profile,date_of_birth})}/>
        <button className="settings-primary" disabled={busy} type="submit">{busy?t("settings.saving"):t("settings.save")}</button>
      </form>}
      {section==="password"&&<form onSubmit={submitPassword}><h2>{t("settings.password")}</h2><p>{t("settings.passwordDescription")}</p>
        <PasswordField autoComplete="current-password" label={t("settings.currentPassword")} name="current_password" value={currentPassword} onChange={setCurrentPassword}/>
        <PasswordField autoComplete="new-password" label={t("settings.newPassword")} name="password" value={password} onChange={setPassword}/>
        <PasswordField autoComplete="new-password" label={t("auth.confirmPassword")} name="password_confirmation" value={confirmation} onChange={setConfirmation}/>
        <div className="settings-form-actions"><button className="settings-primary" disabled={busy} type="submit">{t("settings.changePassword")}</button><Link to={`/${language}/reset-password`}>{t("auth.forgotPassword")}</Link></div>
      </form>}
      {section==="account"&&<div className="settings-account"><h2>{t("settings.account")}</h2><p>{t("settings.accountDescription")}</p><div className="settings-status"><span>{t("settings.status")}</span><strong>{profile.is_active?t("settings.active"):t("settings.inactive")}</strong></div><div className="settings-danger"><h3>{t("settings.deactivate")}</h3><p>{t("settings.deactivateDescription")}</p><button disabled={busy} type="button" onClick={deactivate}>{t("settings.deactivate")}</button></div></div>}
    </section>
  </section></main>;
}
