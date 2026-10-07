import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { ApiError } from "../../api/httpClient";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "./AuthContext";
import { resendVerification, verifyEmail } from "./registrationApi";

interface VerificationLocationState {
  email?: string;
  resendAfterSeconds?: number;
  hourlyLimitReached?: boolean;
  avatarObjectPath?: string;
}

export function VerifyEmailPage() {
  const { session } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const state = location.state as VerificationLocationState | null;
  const [email, setEmail] = useState(state?.email ?? "");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(state?.resendAfterSeconds ?? 0);
  const [hourlyLimitReached, setHourlyLimitReached] = useState(
    state?.hourlyLimitReached ?? false,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown > 0]);

  if (session !== null) return <Navigate replace to={`/${language}`} />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await verifyEmail(email.trim().toLowerCase(), code, state?.avatarObjectPath);
      setSuccess(true);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 410) setError(t("auth.codeExpired"));
      else if (requestError instanceof ApiError && requestError.status === 429) setError(t("auth.tooManyAttempts"));
      else setError(t("auth.invalidCode"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resend() {
    setError("");
    setIsResending(true);
    try {
      const response = await resendVerification(email.trim().toLowerCase());
      setCooldown(response.resend_after_seconds);
      setHourlyLimitReached(response.hourly_limit_reached);
      setCode("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 429) {
        setCooldown(3600);
        setHourlyLimitReached(true);
        setError(t("auth.hourlyEmailLimit"));
      } else setError(t("auth.resendFailed"));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-theme-control"><ThemeToggle /></div>
      <section className="auth-card" aria-labelledby="verify-title">
        <img className="auth-logo" src={inkfigLogo} alt={t("app.name")} />
        <p className="eyebrow brand-name">{t("app.name")}</p>
        <h1 id="verify-title">{t("auth.verifyEmail")}</h1>
        <p className="muted-text">{t("auth.codeSent")}</p>
        {success ? (
          <div className="success-panel" role="status">
            <p>{t("auth.verificationSuccess")}</p>
            <Link className="primary-button button-link" to={`/${language}/login`}>{t("auth.continueToLogin")}</Link>
          </div>
        ) : (
          <form className="form-stack" onSubmit={submit}>
            <label><span>{t("auth.email")}</span><input required autoComplete="email" dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label><span>{t("auth.verificationCode")}</span><input className="verification-code-input" required autoComplete="one-time-code" dir="ltr" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></label>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            {hourlyLimitReached && !error && <p className="form-message error-message" role="status">{t("auth.hourlyEmailLimit")}</p>}
            <button className="primary-button" disabled={isSubmitting || code.length !== 6} type="submit">{isSubmitting ? t("auth.verifying") : t("auth.verify")}</button>
            <button className="secondary-button" disabled={isResending || cooldown > 0 || !email} type="button" onClick={resend}>
              {cooldown > 0 ? `${t("auth.resendIn")} ${formatWait(cooldown)}` : t("auth.resendCode")}
            </button>
          </form>
        )}
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
