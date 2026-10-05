import type { LucideIcon } from "lucide-react";
import { Bell, Settings, Trophy } from "lucide-react";

import { useI18n } from "../../i18n/I18nProvider";
import { AppSidebar } from "./AppSidebar";

type FeatureKey="exhibition"|"notifications"|"settings";
const placeholders:Record<FeatureKey,{icon:LucideIcon;title:"placeholder.exhibitionTitle"|"placeholder.notificationsTitle"|"placeholder.settingsTitle"}>={
  exhibition:{icon:Trophy,title:"placeholder.exhibitionTitle"},
  notifications:{icon:Bell,title:"placeholder.notificationsTitle"},
  settings:{icon:Settings,title:"placeholder.settingsTitle"},
};

export function FeaturePlaceholderPage({feature}:{feature:FeatureKey}) {
  const {t}=useI18n();
  const {icon:Icon,title}=placeholders[feature];
  return <main className="app-feature-page"><AppSidebar/><section className="app-feature-placeholder"><Icon aria-hidden="true" size={34}/><h1>{t(title)}</h1><p>{t("placeholder.comingSoon")}</p></section></main>;
}
