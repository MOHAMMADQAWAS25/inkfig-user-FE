import { Link } from "react-router-dom";
import { Pencil, Upload, Images } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { ExhibitionBackButton } from "./ExhibitionBackButton";

export function ExhibitionToolbar({ id, manage, signedIn, available, busy, onEdit }: {
  id: string; manage: boolean; signedIn: boolean; available: boolean;
  busy?: boolean; onEdit?: () => void;
}) {
  const { language, t } = useI18n();
  return <nav className="exhibition-toolbar" aria-label={t("exhibitions.actions")}>
    <ExhibitionBackButton to={`/${language}/exhibition`} label={t("exhibitions.back")}/>
    {manage && onEdit && <button className="primary-button" disabled={busy} onClick={onEdit}><Pencil size={17} aria-hidden="true"/>{t("exhibitions.edit")}</button>}
    {signedIn ? <>
      {available ? <Link className="primary-button" to={`/${language}/upload?exhibition=${id}`}><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</Link> : <button disabled><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</button>}
      <Link to={`/${language}/exhibition/${id}/submissions`}><Images size={17} aria-hidden="true"/>{t("exhibitions.mySubmissions")}</Link>
    </> : <Link to={`/${language}/login`}>{t("exhibitions.login")}</Link>}
  </nav>;
}
