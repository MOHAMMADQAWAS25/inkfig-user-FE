import { TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError } from "../../api/httpClient";
import { useI18n } from "../../i18n/I18nProvider";
import { PasswordField } from "../auth/PasswordField";
import { saveBackupEmail, type ProfileSettings } from "./settingsApi";

export function BackupEmailSettings({ profile, onSaved }: { profile: ProfileSettings; onSaved: (profile: ProfileSettings) => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState(profile.backup_email ?? "");
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(remove: boolean) {
    const normalized = email.trim().toLowerCase();
    setError(""); setMessage("");
    if (!password) { setError(t("backup.passwordRequired")); return; }
    if (!remove && normalized !== confirmation.trim().toLowerCase()) { setError(t("backup.mismatch")); return; }
    if (!remove && normalized && !/^[a-z0-9][a-z0-9.]{0,63}@gmail\.com$/.test(normalized)) { setError(t("backup.invalid")); return; }
    setBusy(true);
    try {
      const updated = await saveBackupEmail(remove ? null : normalized || null, remove ? null : confirmation.trim().toLowerCase() || null, password);
      onSaved(updated); setEmail(updated.backup_email ?? ""); setConfirmation(""); setPassword("");
      setMessage(t(updated.backup_email ? "backup.saved" : "backup.removed"));
    } catch (requestError) {
      setError(t(requestError instanceof ApiError && requestError.status === 400 ? "settings.currentPasswordInvalid" : "backup.saveFailed"));
    } finally { setBusy(false); }
  }

  return <form onSubmit={(event: FormEvent) => { event.preventDefault(); void save(false); }}>
    <h2>{t("backup.title")}</h2><p>{t("backup.description")}</p>
    {!profile.backup_email && <p className="backup-warning" role="status"><TriangleAlert size={18} aria-hidden="true" />{t("backup.reminder")}</p>}
    <p className="muted-text" id="backup-email-notice">{t("backup.unverifiedNotice")}</p>
    <label><span>{t("backup.address")}</span><input type="email" dir="ltr" autoComplete="email" maxLength={254} value={email} disabled={busy} aria-describedby="backup-email-notice" onChange={event => setEmail(event.target.value)} /></label>
    <label><span>{t("backup.confirmAddress")}</span><input type="email" dir="ltr" autoComplete="off" maxLength={254} value={confirmation} disabled={busy} onChange={event => setConfirmation(event.target.value)} /></label>
    <PasswordField autoComplete="current-password" name="backup_current_password" label={t("settings.currentPassword")} value={password} onChange={setPassword} />
    {error && <p className="settings-alert error" role="alert">{error}</p>}
    {message && <p className="settings-alert success" role="status">{message}</p>}
    <div className="settings-form-actions"><button className="settings-primary" type="submit" disabled={busy}>{t(busy ? "settings.saving" : "backup.save")}</button>
      {profile.backup_email && <button className="secondary-button" type="button" disabled={busy} onClick={() => { if (window.confirm(t("backup.removeConfirm"))) void save(true); }}>{t("backup.remove")}</button>}
    </div>
  </form>;
}
