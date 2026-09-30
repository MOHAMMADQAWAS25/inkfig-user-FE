import { CalendarDays } from "lucide-react";
import { useRef } from "react";

import { useI18n } from "../../i18n/I18nProvider";

type DateOfBirthFieldProps = { label: string; value: string; onChange: (value: string) => void };

export function DateOfBirthField({ label, value, onChange }: DateOfBirthFieldProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  function openPicker() {
    inputRef.current?.focus();
    inputRef.current?.showPicker?.();
  }
  return (
    <label>
      <span>{label}</span>
      <span className="date-input-shell">
        <input ref={inputRef} required dir="ltr" max={new Date().toISOString().slice(0, 10)} name="date_of_birth" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
        <button aria-label={t("auth.openCalendar")} className="field-icon-button" type="button" onClick={openPicker}><CalendarDays aria-hidden="true" size={19} /></button>
      </span>
    </label>
  );
}
