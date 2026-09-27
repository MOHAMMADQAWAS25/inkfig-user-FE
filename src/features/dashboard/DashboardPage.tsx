import { Image, Sparkles } from "lucide-react";

import { useI18n } from "../../i18n/I18nProvider";

export function DashboardPage() {
  const { t } = useI18n();
  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">{t("status.foundation")}</p>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.description")}</p>
        </div>
        <span className="status-badge"><Sparkles size={15} />{t("status.foundation")}</span>
      </header>
      <div className="empty-state">
        <Image aria-hidden="true" size={34} />
        <p>{t("dashboard.description")}</p>
      </div>
    </section>
  );
}
