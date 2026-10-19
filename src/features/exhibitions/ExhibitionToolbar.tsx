import { Link } from "react-router-dom";
import { Pencil, Upload, Images, Trash2 } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { ExhibitionBackButton } from "./ExhibitionBackButton";
import { ExhibitionNavbar } from "./ExhibitionNavbar";
import { useExhibitionCounts } from "./useExhibitionCounts";

export function ExhibitionToolbar({ id, manage, signedIn, available, busy, onEdit, onDelete }: {
  id: string; manage: boolean; signedIn: boolean; available: boolean;
  busy?: boolean; onEdit?: () => void; onDelete?: () => void;
}) {
  const { language, t } = useI18n();
  const counts=useExhibitionCounts()?.items.find(item=>item.exhibition_id===id);
  const pending=(counts?.submissions??0)+(counts?.withdrawals??0);
  return <ExhibitionNavbar label={t("exhibitions.actions")}>
    <ExhibitionBackButton to={`/${language}/exhibition`} label={t("exhibitions.back")}/>
    {manage && onEdit && <button className="primary-button" disabled={busy} onClick={onEdit}><Pencil size={17} aria-hidden="true"/>{t("exhibitions.edit")}</button>}
    {onDelete && <button className="exhibition-delete-button" disabled={busy} onClick={onDelete}><Trash2 size={17} aria-hidden="true"/>{t("exhibitions.delete")}</button>}
    {manage && <Link to={`/${language}/exhibition/${id}/review`}>{t("exhibitions.reviewQueue")}{pending>0&&<span className="exhibition-count">{pending>99?"99+":pending}</span>}</Link>}
    {signedIn ? <>
      {available ? <Link className="primary-button" to={`/${language}/upload?exhibition=${id}`}><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</Link> : <button disabled><Upload size={17} aria-hidden="true"/>{t("exhibitions.participateAction")}</button>}
      <Link to={`/${language}/exhibition/${id}/submissions`}><Images size={17} aria-hidden="true"/>{t("exhibitions.mySubmissions")}</Link>
    </> : <Link to={`/${language}/login`}>{t("exhibitions.login")}</Link>}
  </ExhibitionNavbar>;
}
