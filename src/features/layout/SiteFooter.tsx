import { useLocation } from "react-router-dom";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  if (!/^\/(en|ar)\/?$/.test(pathname)) return null;
  return <footer className="site-footer"><img src={inkfigLogo} alt={t("app.name")}/><p>{t("home.footer")}</p></footer>;
}
