import { Palette } from "lucide-react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext";
import { useI18n } from "../../i18n/I18nProvider";

export function LoginPage() {
  const { session } = useAuth();
  const { language, setLanguage, t } = useI18n();

  if (session !== null) {
    return <Navigate replace to={`/${language}/dashboard`} />;
  }

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true"><Palette size={24} /></div>
        <p className="eyebrow">{t("app.name")}</p>
        <h1 id="login-title">{t("auth.welcome")}</h1>
        <p className="muted-text">{t("app.tagline")}</p>
        <form className="form-stack">
          <label>
            <span>{t("auth.email")}</span>
            <input autoComplete="email" dir="ltr" name="email" type="email" />
          </label>
          <label>
            <span>{t("auth.password")}</span>
            <input autoComplete="current-password" dir="ltr" name="password" type="password" />
          </label>
          <button className="primary-button" disabled type="submit">{t("auth.signIn")}</button>
        </form>
        <button className="text-button" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
          {language === "ar" ? "English" : "العربية"}
        </button>
      </section>
    </main>
  );
}
