import { Languages } from "lucide-react";

import { useI18n } from "./I18nProvider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();
  const nextLanguage = language === "ar" ? "en" : "ar";
  const label = nextLanguage === "ar" ? t("language.useArabic") : t("language.useEnglish");

  return (
    <button aria-label={label} className="icon-button theme-toggle language-toggle" title={label} type="button" onClick={() => setLanguage(nextLanguage)}>
      <Languages aria-hidden="true" size={19} />
    </button>
  );
}