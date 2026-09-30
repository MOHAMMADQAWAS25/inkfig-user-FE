import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { useI18n } from "../../i18n/I18nProvider";

type PasswordFieldProps = { autoComplete: string; label: string; name: string; value: string; onChange: (value: string) => void };

export function PasswordField({ autoComplete, label, name, value, onChange }: PasswordFieldProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return <label><span>{label}</span><span className="password-input-shell"><input required autoComplete={autoComplete} dir="ltr" minLength={8} maxLength={128} name={name} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} /><button aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")} className="field-icon-button" type="button" onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}</button></span></label>;
}
