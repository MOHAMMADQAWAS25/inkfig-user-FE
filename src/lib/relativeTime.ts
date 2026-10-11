export function relativeTime(value: string, language: string, now = Date.now()): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "";
  const seconds = Math.max(1, Math.floor((now - timestamp) / 1000));
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
  ];
  const [unit, size] = units.find(([, size]) => seconds >= size) ?? ["second", 1];
  return new Intl.RelativeTimeFormat(language, {numeric: "always"}).format(-Math.floor(seconds / size), unit);
}
