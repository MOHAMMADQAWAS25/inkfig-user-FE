import { LogIn, UserPlus } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

import { useAuth } from "./AuthContext";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";

export function AuthLandingPage() {
  const { session } = useAuth();
  const { language, setLanguage, t } = useI18n();

  if (session !== null) {
    return <Navigate replace to={`/${language}/dashboard`} />;
  }

  return (
    <main className="auth-layout">
      <div className="auth-theme-control"><ThemeToggle /></div>
      <section className="auth-card auth-choice-card" aria-labelledby="auth-choice-title">
        <img className="auth-logo" src={inkfigLogo} alt={t("app.name")} />
        <p className="eyebrow">{t("app.name")}</p>
        <h1 id="auth-choice-title">{t("auth.getStarted")}</h1>
        <p className="muted-text">{t("app.tagline")}</p>
        <div className="auth-actions">
          <Link className="primary-button button-link" to={`/${language}/signup`}>
            <UserPlus size={18} /> {t("auth.signUp")}
          </Link>
          <Link className="secondary-button button-link" to={`/${language}/login`}>
            <LogIn size={18} /> {t("auth.signIn")}
          </Link>
        </div>
        <button className="text-button" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
          {language === "ar" ? "English" : "العربية"}
        </button>
      </section>
    </main>
  );
}
