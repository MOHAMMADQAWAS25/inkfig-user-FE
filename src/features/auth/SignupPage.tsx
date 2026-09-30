import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { ApiError } from "../../api/httpClient";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "./AuthContext";
import { registerUser } from "./registrationApi";
import type { Gender, RegistrationRequest } from "./registrationApi";

const STUDENT_EMAIL = /^\d{8}@students\.hebron\.edu$/i;
const STAFF_EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@hebron\.edu$/i;
const PHONE_NUMBER = /^[0-9]{10}$/;

const initialForm: RegistrationRequest = {
  email: "",
  full_name: "",
  phone_number: "",
  gender: "female",
  date_of_birth: "",
  password: "",
  password_confirmation: "",
};

export function SignupPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();
  const [form, setForm] = useState<RegistrationRequest>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session !== null) {
    return <Navigate replace to={`/${language}/dashboard`} />;
  }

  function updateField(field: keyof RegistrationRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const email = form.email.trim().toLowerCase();
    if (!STUDENT_EMAIL.test(email) && !STAFF_EMAIL.test(email)) {
      setError(t("auth.invalidHebronEmail"));
      return;
    }
    if (!PHONE_NUMBER.test(form.phone_number)) {
      setError(t("auth.invalidPhoneNumber"));
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerUser({ ...form, email });
      navigate(`/${language}/verify-email`, {
        state: {
          email: response.email,
          resendAfterSeconds: response.resend_after_seconds,
          hourlyLimitReached: response.hourly_limit_reached,
        },
      });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        setError(t("auth.emailExists"));
      } else if (requestError instanceof ApiError && requestError.status === 429) {
        setError(t("auth.hourlyEmailLimit"));
      } else {
        setError(t("auth.registrationFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout auth-layout-scroll auth-photo-background">
      <div className="auth-theme-control"><ThemeToggle /></div>
      <div className="auth-form-column signup-form-column auth-enter-from-end">
        <section className="auth-card signup-card" aria-labelledby="signup-title">
        <img className="auth-logo" src={inkfigLogo} alt={t("app.name")} />
        <h1 id="signup-title">{t("auth.createAccount")}</h1>
        <p className="muted-text">{t("auth.hebronOnly")}</p>

          <form className="form-stack signup-form-grid" onSubmit={submit}>
            <label className="signup-email-field">
              <span>{t("auth.email")}</span>
              <input required autoComplete="email" dir="ltr" name="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
              <small>{t("auth.emailHint")}</small>
            </label>
            <label>
              <span>{t("auth.fullName")}</span>
              <input required autoComplete="name" name="full_name" type="text" minLength={2} maxLength={120} value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} />
            </label>
            <label>
              <span>{t("auth.phoneNumber")}</span>
              <input required autoComplete="tel" dir="ltr" inputMode="numeric" maxLength={10} minLength={10} name="phone_number" pattern="[0-9]{10}" type="tel" value={form.phone_number} onChange={(event) => updateField("phone_number", event.target.value)} />
              <small>{t("auth.phoneHint")}</small>
            </label>
            <label>
              <span>{t("auth.gender")}</span>
              <select required name="gender" value={form.gender} onChange={(event) => updateField("gender", event.target.value as Gender)}>
                <option value="female">{t("auth.genderFemale")}</option>
                <option value="male">{t("auth.genderMale")}</option>
              </select>
            </label>
            <label>
              <span>{t("auth.dateOfBirth")}</span>
              <input required dir="ltr" max={new Date().toISOString().slice(0, 10)} name="date_of_birth" type="date" value={form.date_of_birth} onChange={(event) => updateField("date_of_birth", event.target.value)} />
            </label>
            <label>
              <span>{t("auth.password")}</span>
              <input required autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} name="password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
            </label>
            <label>
              <span>{t("auth.confirmPassword")}</span>
              <input required autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} name="password_confirmation" type="password" value={form.password_confirmation} onChange={(event) => updateField("password_confirmation", event.target.value)} />
            </label>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? t("auth.creatingAccount") : t("auth.createAccount")}
            </button>
          </form>

        <p className="auth-switch">{t("auth.haveAccount")} <Link to={`/${language}/login`}>{t("auth.signIn")}</Link></p>
        <button className="text-button" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
          {language === "ar" ? "English" : "العربية"}
        </button>
        </section>
      </div>
    </main>
  );
}
