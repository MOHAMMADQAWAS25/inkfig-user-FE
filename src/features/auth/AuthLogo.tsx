import officialLogo from "../../assets/inkfig-logo.svg?raw";
import { useI18n } from "../../i18n/I18nProvider";

// Trusted, bundled SVG only. Keep the official geometry/fig; theme the pen and leaf fills.
const markup = officialLogo.replace(/<(?:path|circle)\b[^>]+>/g, element => {
  if (element.includes('d="M173.31,218.19') || element.includes('d="M181.81,227.19')) return element.replace('fill="#eee7bd"', 'fill="var(--auth-logo-nib)"');
  if (element.includes('d="M173.31,171.69') || element.includes('d="M156.81,157.19') || element.includes('cx="49.43"')) return element.replace('fill="#3b4b21"', 'fill="var(--auth-logo-detail)"');
  return element.replace('fill="#617d2b"', 'fill="var(--auth-logo-leaf)"');
});

export function AuthLogo() {
  const { t } = useI18n();
  return <span className="auth-logo" role="img" aria-label={t("app.name")} dangerouslySetInnerHTML={{ __html: markup }} />;
}
