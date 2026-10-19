import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
const css = readFileSync("src/styles.css", "utf8");
test("slider backdrop covers the whole viewport and rail through closing", () => {
  assert.match(css, /body:has\(#account-discovery-panel, #notifications-panel\) \.account-discovery-backdrop \{[^}]*z-index: 52;[^}]*inset: 0;[^}]*pointer-events: auto/);
  assert.match(css, /body:has\(#account-discovery-panel, #notifications-panel\) :is\(\.app-sidebar, \.mobile-bottom-nav, \.gallery-header\) \{ pointer-events: none/);
  assert.match(css, /body:has\(#account-discovery-panel, #notifications-panel\) \.gallery-header \{ z-index: 20/);
});
test("signup has a stationary viewport and an accessible inner-overflow fallback", () => {
  assert.match(css, /html:has\(\.auth-signup\), body:has\(\.auth-signup\) \{ overflow: hidden/);
  assert.match(css, /\.auth-photo-background.auth-signup \{[^}]*height: 100dvh/);
  assert.match(css, /\.auth-signup \.signup-card \{[^}]*max-height: 100%; overflow-y: auto/);
});
test("shared dropdown and identity preview animate and respect reduced motion", () => {
  assert.match(css, /\.themed-select-options \{[^}]*visibility: hidden;[^}]*pointer-events: none;[^}]*transition: opacity 160ms/);
  assert.match(css, /\.submission-artist-profile:focus-within \.submission-profile-preview/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /\.themed-select \*, \.exhibition-submission-record[^}]*transition: none/);
});
