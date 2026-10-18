import { useI18n } from "../../i18n/I18nProvider";

/** Decorative hints only: the search input keeps a stable accessible label. */
export function SearchHints({ visible, artistSelected }: { visible: boolean; artistSelected: boolean }) {
  const { t } = useI18n();
  return <span className="search-hints" aria-hidden="true" data-visible={visible} data-artist-selected={artistSelected}>
    <span>{t(artistSelected ? "home.searchArtistWork" : "home.searchArtHint")}</span>
    {!artistSelected && <span>{t("home.searchArtistHint")}</span>}
  </span>;
}
