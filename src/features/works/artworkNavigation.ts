import type { Location } from "react-router-dom";

export type ArtworkBackground = { location: Location; scrollY: number };
export function mobileArtworkBackground(state: unknown): ArtworkBackground | null {
  const background = (state as { artworkBackground?: ArtworkBackground } | null)?.artworkBackground;
  const location = background?.location;
  return location && /^\/(en|ar)(\/profile(\/[^/]+)?)?\/?$/.test(location.pathname)
    && Number.isFinite(background.scrollY) && background.scrollY >= 0 ? background : null;
}

export function artworkNavigationState(location: Location) {
  const returnTo = location.pathname + location.search;
  if (!window.matchMedia?.("(max-width: 720px)").matches) return { returnTo };
  const previous = mobileArtworkBackground(location.state);
  // Keep history serializable and bounded across related-artwork navigation.
  const background = previous ?? { location: { ...location, state: null }, scrollY: Math.max(0, window.scrollY) };
  return { returnTo, artworkBackground: background };
}

export function artworkPath(language: string, id: string) { return `/${language}/artwork/${encodeURIComponent(id)}`; }
export function safeArtworkReturn(value: unknown, fallback: string): string {
  return typeof value === "string" && /^\/(en|ar)(\/|\?|$)/.test(value) && !value.includes("\\") ? value : fallback;
}
