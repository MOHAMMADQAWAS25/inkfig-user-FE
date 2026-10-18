export const workCategories = [
  { code: "digital-art", label: "home.filter.digitalArt" },
  { code: "hand-art", label: "home.filter.handArt" },
  { code: "video", label: "home.filter.video" },
  { code: "audio", label: "home.filter.audio" },
  { code: "animation", label: "home.filter.animation" },
  { code: "games", label: "home.filter.games" },
  { code: "interactive", label: "home.filter.interactive" },
  { code: "vr-ar", label: "home.filter.vrAr" },
  { code: "other", label: "home.filter.other" },
] as const;

export function sortWorkTypes<T extends { code: string }>(types: readonly T[]): T[] {
  const rank = (code: string) => {
    const index = workCategories.findIndex(category => category.code === code);
    return index < 0 ? workCategories.length : index;
  };
  return [...types].sort((a, b) => rank(a.code) - rank(b.code));
}
