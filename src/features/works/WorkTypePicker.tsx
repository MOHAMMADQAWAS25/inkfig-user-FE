import { Brush, Clapperboard, Ellipsis, Gamepad2, Glasses, Headphones, Monitor, MousePointer2, Play, Shapes, LayoutGrid } from "lucide-react";
import type { WorkType } from "./worksApi";
import { useI18n } from "../../i18n/I18nProvider";
import { sortWorkTypes } from "./workCategories";

const icons = { "digital-art": Monitor, "hand-art": Brush, video: Play, audio: Headphones, animation: Clapperboard, games: Gamepad2, interactive: MousePointer2, "vr-ar": Glasses, other: Ellipsis };

export function WorkTypePicker({ types, value, onChange, disabled }: { types: WorkType[]; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const { language, t } = useI18n();
  return <fieldset className="work-type-picker" disabled={disabled}>
    <legend><LayoutGrid size={18} aria-hidden="true"/>{t("works.type")} <span aria-hidden="true">*</span></legend>
    <div className="work-type-options">{sortWorkTypes(types).map(type => {
      const Icon = icons[type.code as keyof typeof icons] ?? Shapes;
      return <label className="work-type-option" key={type.type_id}>
        <input required type="radio" name="work_type" value={type.type_id} checked={value === type.type_id} onChange={() => onChange(type.type_id)}/>
        <Icon size={22} aria-hidden="true"/><span>{language === "ar" ? type.name_ar : type.name_en}</span><span className="work-type-indicator" aria-hidden="true"/>
      </label>;
    })}</div>
  </fieldset>;
}
