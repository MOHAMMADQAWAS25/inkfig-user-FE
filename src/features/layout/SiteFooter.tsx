import { useLocation } from "react-router-dom";
import inkfigLogo from "../../assets/inkfig-logo.svg";
import { useI18n } from "../../i18n/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const publicPage = ["login", "signup", "verify-email", "reset-password"].includes(pathname.split("/")[2]);
  return <footer className={`site-footer${publicPage ? "" : " site-footer-app"}`}><img src={inkfigLogo} alt={t("app.name")}/><p>{t("home.footer")}</p></footer>;
}
