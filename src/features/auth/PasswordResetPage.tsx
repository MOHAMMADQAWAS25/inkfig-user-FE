import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";

import { ApiError } from "../../api/httpClient";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "./AuthContext";
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode,
} from "./passwordResetApi";

type Stage = "email" | "code" | "password" | "complete";

export function PasswordResetPage() {
  const { session } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [hourlyLimitReached, setHourlyLimitReached] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown > 0]);

  if (session !== null) return <Navigate replace to={`/${language}/dashboard`} />;

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(email.trim().toLowerCase());
      setCooldown(response.resend_after_seconds);
      setHourlyLimitReached(response.hourly_limit_reached);
      setStage("code");
    } catch {
      setError(t("auth.resetRequestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(email.trim().toLowerCase());
      setCooldown(response.resend_after_seconds);
      setHourlyLimitReached(response.hourly_limit_reached);
      setCode("");
    } catch {
      setError(t("auth.resetRequestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await verifyPasswordResetCode(email.trim().toLowerCase(), code);
      setResetToken(response.reset_token);
      setStage("password");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 410) setError(t("auth.resetCodeExpired"));
      else if (requestError instanceof ApiError && requestError.status === 429) setError(t("auth.tooManyAttempts"));
      else setError(t("auth.invalidResetCode"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(email.trim().toLowerCase(), resetToken, password, confirmation);
      setResetToken("");
      setStage("complete");
    } catch {
      setError(t("auth.resetSessionExpired"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-theme-control"><ThemeToggle /></div>
      <section className="auth-card" aria-labelledby="reset-title">
        <img className="auth-logo" src={inkfigLogo} alt={t("app.name")} />
        <p className="eyebrow brand-name">{t("app.name")}</p>
        <h1 id="reset-title">{t("auth.resetPassword")}</h1>
        {stage === "complete" ? (
          <div className="success-panel" role="status">
            <p>{t("auth.resetComplete")}</p>
            <Link className="primary-button button-link" to={`/${language}/login`}>{t("auth.continueToLogin")}</Link>
          </div>
        ) : stage === "email" ? (
          <form className="form-stack" onSubmit={submitEmail}>
            <p className="muted-text">{t("auth.resetInstructions")}</p>
            <label><span>{t("auth.email")}</span><input required autoComplete="email" dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            <button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? t("auth.sendingResetCode") : t("auth.sendResetCode")}</button>
          </form>
        ) : stage === "code" ? (
          <form className="form-stack" onSubmit={submitCode}>
            <p className="muted-text">{t("auth.resetCodeSent")}</p>
            <label><span>{t("auth.verificationCode")}</span><input className="verification-code-input" required autoComplete="one-time-code" dir="ltr" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></label>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            {hourlyLimitReached && !error && <p className="form-message error-message" role="status">{t("auth.hourlyEmailLimit")}</p>}
            <button className="primary-button" disabled={isSubmitting || code.length !== 6} type="submit">{isSubmitting ? t("auth.verifying") : t("auth.verify")}</button>
            <button className="secondary-button" disabled={isSubmitting || cooldown > 0} type="button" onClick={resendCode}>
              {cooldown > 0 ? `${t("auth.resendIn")} ${formatWait(cooldown)}` : t("auth.requestNewCode")}
            </button>
          </form>
        ) : (
          <form className="form-stack" onSubmit={submitPassword}>
            <p className="muted-text">{t("auth.chooseNewPassword")}</p>
            <label><span>{t("auth.password")}</span><input required autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <label><span>{t("auth.confirmPassword")}</span><input required autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            <button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? t("auth.resettingPassword") : t("auth.resetPassword")}</button>
          </form>
        )}
        {stage !== "complete" && <p className="auth-switch"><Link to={`/${language}/login`}>{t("auth.backToLogin")}</Link></p>}
        <button className="text-button" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>{language === "ar" ? "English" : "العربية"}</button>
      </section>
    </main>
  );
}

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
}
