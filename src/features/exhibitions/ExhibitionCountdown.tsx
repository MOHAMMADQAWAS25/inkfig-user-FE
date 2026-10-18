import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";

export function ExhibitionCountdown({ eventAt }: { eventAt: string }) {
  const { language, t } = useI18n();
  const target = new Date(eventAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!Number.isFinite(target) || target <= Date.now()) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= target) window.clearInterval(timer);
    };
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [target]);
  if (!Number.isFinite(target)) return null;
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  const number = new Intl.NumberFormat(language, { minimumIntegerDigits: 2 });
  const units = [
    [Math.floor(seconds / 86400), "exhibitions.days"],
    [Math.floor(seconds / 3600) % 24, "exhibitions.hours"],
    [Math.floor(seconds / 60) % 60, "exhibitions.minutes"],
    [seconds % 60, "exhibitions.seconds"],
  ] as const;
  return (
    <div className="exhibition-countdown" role="timer" aria-live="off">
      <span className="exhibition-countdown-label"><Timer size={16} aria-hidden="true" />{t(seconds === 0 ? "exhibitions.started" : "exhibitions.startsIn")}</span>
      {seconds > 0 && <div className="exhibition-countdown-units">{units.map(([value, label]) => <span key={label}><strong>{number.format(value)}</strong><small>{t(label)}</small></span>)}</div>}
    </div>
  );
}
