import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { translations } from "./resources";
import type { Language, TranslationKey } from "./resources";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLanguage(location.pathname);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        const segments = location.pathname.split("/").filter(Boolean);
        segments[0] = nextLanguage;
        navigate(`/${segments.join("/")}${location.search}`);
      },
      t: (key) => translations[language][key],
    }),
    [language, location.pathname, location.search, navigate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }
  return context;
}

function getLanguage(pathname: string): Language {
  return pathname.split("/").filter(Boolean)[0] === "ar" ? "ar" : "en";
}
