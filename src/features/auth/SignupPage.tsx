import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { ApiError } from "../../api/httpClient";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { useAuth } from "./AuthContext";
import { DateOfBirthField } from "./DateOfBirthField";
import { PasswordField } from "./PasswordField";
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
        setError(requestError.message.toLowerCase().includes("phone") ? t("auth.phoneExists") : t("auth.emailExists"));
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
              <input required autoComplete="email" dir="ltr" name="email" placeholder="12345678@students.hebron.edu / name@hebron.edu" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </label>
            <label>
              <span>{t("auth.fullName")}</span>
              <input required autoComplete="name" name="full_name" type="text" minLength={2} maxLength={120} value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} />
            </label>
            <label>
              <span>{t("auth.phoneNumber")}</span>
              <input required autoComplete="tel" dir="ltr" inputMode="numeric" maxLength={10} minLength={10} name="phone_number" pattern="[0-9]{10}" placeholder="05xxxxxxxx" type="tel" value={form.phone_number} onChange={(event) => updateField("phone_number", event.target.value)} />
            </label>
            <label>
              <span>{t("auth.gender")}</span>
              <select required name="gender" value={form.gender} onChange={(event) => updateField("gender", event.target.value as Gender)}>
                <option value="female">{t("auth.genderFemale")}</option>
                <option value="male">{t("auth.genderMale")}</option>
              </select>
            </label>
            <DateOfBirthField label={t("auth.dateOfBirth")} value={form.date_of_birth} onChange={(value) => updateField("date_of_birth", value)} />
            <PasswordField autoComplete="new-password" label={t("auth.password")} name="password" value={form.password} onChange={(value) => updateField("password", value)} />
            <PasswordField autoComplete="new-password" label={t("auth.confirmPassword")} name="password_confirmation" value={form.password_confirmation} onChange={(value) => updateField("password_confirmation", value)} />
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
