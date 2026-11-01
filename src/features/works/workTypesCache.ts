import type { WorkType } from "./worksApi";

const KEY = "inkfig.work-types.v1";
const MAX_AGE = 5 * 60_000;
/** Public reference data only; never persist accounts, files or credentials. */
export function readCachedWorkTypes(): WorkType[] | null {
  try {
    const cached: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (!cached || typeof cached !== "object") return null;
    const { savedAt, items } = cached as { savedAt?: unknown; items?: unknown };
    const age = typeof savedAt === "number" ? Date.now() - savedAt : -1;
    if (age < 0 || age >= MAX_AGE || !Array.isArray(items) || items.length > 100) return null;
    const fields = ["type_id", "code", "name_en", "name_ar"] as const;
    if (!items.every(item => item && typeof item === "object" && fields.every(key => typeof item[key] === "string" && item[key].trim().length > 0 && item[key].length <= 240))) return null;
    if (new Set(items.map(item => item.type_id)).size !== items.length) return null;
    return items.map(({ type_id, code, name_en, name_ar }) => ({ type_id, code, name_en, name_ar }));
  } catch { return null; }
}

export function cacheWorkTypes(items: WorkType[]): void {
  try { sessionStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), items })); } catch { /* Private mode/quota must not block upload. */ }
}
