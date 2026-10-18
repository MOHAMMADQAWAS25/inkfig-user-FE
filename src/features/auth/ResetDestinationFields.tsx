import { useI18n } from "../../i18n/I18nProvider";
import type { ResetDestination } from "./passwordResetApi";

export function ResetDestinationFields({ value, onChange, disabled }: {
  value: ResetDestination | undefined;
  onChange: (value: ResetDestination) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return <fieldset className="reset-destinations" disabled={disabled}>
    <legend>{t("backup.chooseDestination")}</legend>
    {(["primary", "backup"] as const).map(destination => <label key={destination}>
      <input type="radio" name="reset_destination" required value={destination}
        checked={value === destination} onChange={() => onChange(destination)} />
      <span>{t(destination === "primary" ? "backup.primaryDestination" : "backup.backupDestination")}</span>
    </label>)}
  </fieldset>;
}
