import { KeyRound, MailCheck, Shield, UserRoundPen, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { ApiError } from "../../api/httpClient";
import { useI18n } from "../../i18n/I18nProvider";
import { AppSidebar } from "../navigation/AppSidebar";
import { useAuth } from "../auth/AuthContext";
import { DateOfBirthField } from "../auth/DateOfBirthField";
import { PasswordField } from "../auth/PasswordField";
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode,
} from "../auth/passwordResetApi";
import { deactivateAccount, loadProfileSettings, saveProfileSettings, type ProfileSettings } from "./settingsApi";

type Section = "profile" | "password" | "account";
const blankProfile: ProfileSettings = { email: "", full_name: "", phone_number: "", gender: "female", date_of_birth: "", is_active: true };

export function SettingsPage() {
  const { language, t } = useI18n();
  const { session, setSession, signOut } = useAuth();
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState(blankProfile);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStage, setResetStage] = useState<"code"|"password">("code");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [hourlyLimitReached, setHourlyLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    loadProfileSettings().then(setProfile).catch(() => setError(t("settings.loadFailed")));
  }, [session, t]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown > 0]);

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

  async function openPasswordReset() {
    setResetOpen(true);
    setResetStage("code");
    setCode("");
    setPassword("");
    setConfirmation("");
    setResetToken("");
    setError("");
    setMessage("");
    await sendResetCode();
  }

  async function sendResetCode() {
    setBusy(true);
    setError("");
    try {
      const response = await requestPasswordReset(session!.email);
      setCooldown(response.resend_after_seconds);
      setHourlyLimitReached(response.hourly_limit_reached);
      setCode("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 429) {
        setHourlyLimitReached(true);
        setCooldown(3600);
        fail(t("auth.hourlyEmailLimit"));
      } else {
        fail(t("auth.resetRequestFailed"));
      }
    } finally { setBusy(false); }
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await verifyPasswordResetCode(session!.email, code);
      setResetToken(response.reset_token);
      setResetStage("password");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 410) fail(t("auth.resetCodeExpired"));
      else if (requestError instanceof ApiError && requestError.status === 429) fail(t("auth.tooManyAttempts"));
      else fail(t("auth.invalidResetCode"));
    } finally { setBusy(false); }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) return fail(t("auth.passwordMismatch"));
    setBusy(true);
    try {
      await confirmPasswordReset(session!.email, resetToken, password, confirmation);
      setResetToken("");
      signOut();
    } catch {
      fail(t("auth.resetSessionExpired"));
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
      {section==="password"&&<div className="settings-password-reset"><MailCheck aria-hidden="true" size={34}/><h2>{t("settings.password")}</h2><p>{t("settings.passwordDescription")}</p><div className="settings-reset-email"><span>{t("auth.email")}</span><strong dir="ltr">{session.email}</strong></div><button className="settings-primary" disabled={busy} type="button" onClick={openPasswordReset}>{t("settings.resetWithCode")}</button></div>}
      {section==="account"&&<div className="settings-account"><h2>{t("settings.account")}</h2><p>{t("settings.accountDescription")}</p><div className="settings-status"><span>{t("settings.status")}</span><strong>{profile.is_active?t("settings.active"):t("settings.inactive")}</strong></div><div className="settings-danger"><h3>{t("settings.deactivate")}</h3><p>{t("settings.deactivateDescription")}</p><button disabled={busy} type="button" onClick={deactivate}>{t("settings.deactivate")}</button></div></div>}
    </section>
  </section>
  {resetOpen&&<div className="settings-reset-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&!busy&&setResetOpen(false)}><section className="settings-reset-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-reset-title"><header><div><MailCheck size={22}/><h2 id="settings-reset-title">{t("settings.password")}</h2></div><button disabled={busy} type="button" aria-label={t("settings.closeReset")} onClick={()=>setResetOpen(false)}><X size={20}/></button></header>
    {resetStage==="code"?<form onSubmit={submitCode}><p>{t("settings.codeSentTo")} <strong dir="ltr">{session.email}</strong></p><label><span>{t("auth.verificationCode")}</span><input className="verification-code-input" required autoComplete="one-time-code" dir="ltr" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,""))}/></label>{error&&<p className="settings-alert error" role="alert">{error}</p>}{hourlyLimitReached&&!error&&<p className="settings-alert error" role="status">{t("auth.hourlyEmailLimit")}</p>}<button className="settings-primary" disabled={busy||code.length!==6} type="submit">{busy?t("auth.verifying"):t("auth.verify")}</button><button className="settings-reset-resend" disabled={busy||cooldown>0} type="button" onClick={sendResetCode}>{cooldown>0?`${t("auth.resendIn")} ${formatWait(cooldown)}`:t("auth.requestNewCode")}</button></form>
    :<form onSubmit={submitPassword}><p>{t("auth.chooseNewPassword")}</p><PasswordField autoComplete="new-password" label={t("settings.newPassword")} name="password" value={password} onChange={setPassword}/><PasswordField autoComplete="new-password" label={t("auth.confirmPassword")} name="password_confirmation" value={confirmation} onChange={setConfirmation}/>{error&&<p className="settings-alert error" role="alert">{error}</p>}<button className="settings-primary" disabled={busy} type="submit">{busy?t("auth.resettingPassword"):t("auth.resetPassword")}</button></form>}
  </section></div>}
  </main>;
}

function formatWait(seconds:number):string {
  if(seconds<60)return `${seconds}s`;
  return `${Math.ceil(seconds/60)}m`;
}
