import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { loadProfileSettings } from "../settings/settingsApi";

export function FirstLoginBackupPrompt({ ready }: { ready: boolean }) {
  const { session } = useAuth();
  const { language, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [requested] = useState(() => location.state?.firstLoginBackupPrompt === true);
  const [eligible, setEligible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const laterButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!location.state?.firstLoginBackupPrompt) return;
    const { firstLoginBackupPrompt: _consumed, ...remaining } = location.state;
    navigate(location.pathname + location.search, { replace: true, state: remaining });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!requested || !session) return;
    let cancelled = false;
    loadProfileSettings().then(profile => { if (!cancelled) setEligible(!profile.backup_email); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [requested, session?.userId]);

  const open = Boolean(requested && session && eligible && ready && !dismissed);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const node = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node.showModal();
    laterButton.current?.focus();
    return () => { node.close(); previousFocus?.focus({ preventScroll: true }); };
  }, [open]);

  if (!open) return null;
  const dismiss = () => setDismissed(true);
  return <dialog ref={dialog} className="first-login-backup-dialog" aria-labelledby="backup-prompt-title" aria-describedby="backup-prompt-description"
    onCancel={event => { event.preventDefault(); dismiss(); }}
    onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
    <div className="first-login-backup-content">
      <Mail size={28} aria-hidden="true" />
      <h2 id="backup-prompt-title">{t("backup.promptTitle")}</h2>
      <p id="backup-prompt-description">{t("backup.reminder")}</p>
      <div className="first-login-backup-actions">
        <button className="primary-button" type="button" onClick={() => { dismiss(); navigate(`/${language}/settings?section=security`); }}>{t("backup.promptAdd")}</button>
        <button ref={laterButton} className="secondary-button" type="button" onClick={dismiss}>{t("backup.promptLater")}</button>
      </div>
    </div>
  </dialog>;
}
