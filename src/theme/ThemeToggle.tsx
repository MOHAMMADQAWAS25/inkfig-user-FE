import { Moon, Sun } from "lucide-react";

import { useI18n } from "../i18n/I18nProvider";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const nextThemeLabel = theme === "dark" ? t("theme.useLight") : t("theme.useDark");

  return (
    <button aria-label={nextThemeLabel} className="icon-button theme-toggle" title={nextThemeLabel} type="button" onClick={toggleTheme}>
      {theme === "dark" ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  );
}
