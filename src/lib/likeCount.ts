import type { TranslationKey } from "../i18n/resources";

export function likeCountLabel(count: number, t: (key: TranslationKey) => string): string {
  return `${count} ${t(count === 1 ? "home.like" : "home.likes")}`;
}
