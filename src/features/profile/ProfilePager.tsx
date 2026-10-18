import { useMemo, type ReactNode } from "react";
import { useMobileViewport } from "../../lib/useMobileViewport";
import { useProfileSwipe } from "./useProfileSwipe";
import { useI18n } from "../../i18n/I18nProvider";

type Section = "posts" | "saved" | "likes";
const sections: Section[] = ["posts", "saved", "likes"];

export function ProfilePager({ section, select, enabled, children }: { section: Section; select: (section: Section) => void; enabled: boolean; children: (section: Section) => ReactNode }) {
  const mobile = useMobileViewport();
  const { language } = useI18n();
  const swipe = useProfileSwipe(enabled, section, select);
  const contents = useMemo(() => mobile && enabled ? sections.map(page => children(page)) : [], [children, mobile, enabled]);
  if (!mobile || !enabled) return <div key={section} className="profile-sections">{children(section)}</div>;
  return <div className="profile-swipe-area" {...swipe}>
    <div className="profile-swipe-track" dir="ltr">
      {sections.map((page, index) => <div key={page} className="profile-swipe-slide" dir={language === "ar" ? "rtl" : "ltr"} style={{ left: `${index * 100}%` }} data-active={section === page} aria-hidden={section !== page} inert={section !== page}>
        <div className="profile-sections">{contents[index]}</div>
      </div>)}
    </div>
  </div>;
}
