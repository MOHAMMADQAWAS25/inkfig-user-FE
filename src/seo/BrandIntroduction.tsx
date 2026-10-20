import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import brand from "./brand.json";

/** The same public introduction is included in the initial build-time HTML. */
export function BrandIntroduction() {
  const { language } = useI18n();
  const copy = brand[language];
  return <details className="brand-introduction">
    <summary>{copy.summary}</summary>
    <div>
      <h1>{brand.name}</h1>
      <p>{copy.description}</p>
      <nav aria-label={copy.summary}>
        <Link to={`/${language}/`}>{copy.gallery}</Link>
        <Link to={`/${language}/exhibition/`}>{copy.exhibitions}</Link>
      </nav>
    </div>
  </details>;
}
