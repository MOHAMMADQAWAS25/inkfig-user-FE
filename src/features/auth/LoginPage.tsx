import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";

import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useAuth } from "./AuthContext";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { ApiError } from "../../api/httpClient";
import { loginUser } from "./authenticationApi";

export function LoginPage() {
  const { session, setSession } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session !== null) {
    return <Navigate replace to={`/${language}/dashboard`} />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await loginUser(email.trim().toLowerCase(), password);
      setSession({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        email: response.email,
        fullName: response.full_name,
        permissions: response.permissions,
        userId: response.user_id,
      });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 403) setError(t("auth.verifyBeforeLogin"));
      else setError(t("auth.invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout auth-photo-background">
      <div className="auth-theme-control"><ThemeToggle /></div>
      <div className="auth-form-column login-form-column auth-enter-from-start">
        <section className="auth-card login-card" aria-labelledby="login-title">
        <img className="auth-logo" src={inkfigLogo} alt={t("app.name")} />
        <h1 id="login-title">{t("auth.welcome")}</h1>
        <p className="muted-text">{t("app.tagline")}</p>
        <form className="form-stack" onSubmit={submit}>
          <label>
            <span>{t("auth.email")}</span>
            <input required autoComplete="email" dir="ltr" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>{t("auth.password")}</span>
            <input required autoComplete="current-password" dir="ltr" minLength={8} name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <Link className="forgot-password-link" to={`/${language}/reset-password`}>{t("auth.forgotPassword")}</Link>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          <button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? t("auth.signingIn") : t("auth.signIn")}</button>
        </form>
        <p className="auth-switch">{t("auth.noAccount")} <Link to={`/${language}/signup`}>{t("auth.signUp")}</Link></p>
        <button className="text-button" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
          {language === "ar" ? "English" : "العربية"}
        </button>
        </section>
      </div>
    </main>
  );
}
