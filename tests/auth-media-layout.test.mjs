import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
const design=css.split("/* Watercolor authentication:")[1];
test("watercolor forms retain glass and legibility in both themes without a colorful stripe",()=>{
  assert.match(design,/\.auth-photo-background \.auth-card::before \{ content: none/);
  assert.match(design,/background: rgb\(255 253 235 \/ \.55\)/);
  assert.match(design,/background: rgb\(23 29 17 \/ \.58\)/);
  assert.match(design,/backdrop-filter: blur\(18px\) saturate\(115%\)/);
  assert.match(design,/\.auth-photo-background \.auth-card \{ --auth-logo-nib:#eee7bd; --auth-logo-detail:#39431c/);
  assert.match(design,/\.auth-photo-background \.auth-form-column \{ max-height: none; overflow: visible/);
});
test("original artwork stays centered with bounded contain sizing and decorative-only blur",()=>{
  assert.match(design,/\.artwork-modal \{ align-items: stretch/);
  assert.match(design,/\.artwork-modal-media \{[^}]*align-self: stretch; place-items: center/);
  assert.match(design,/\.artwork-media-backdrop \{[^}]*object-fit: cover;[^}]*filter: blur\(24px\) saturate\(1\.15\) brightness\(\.85\); opacity: \.7; pointer-events: none/);
  assert.match(design,/\.artwork-modal-media \{[^}]*min-inline-size: 0[^}]*padding: 0/);
  assert.match(design,/\.artwork-media-original \{[^}]*object-fit: contain; object-position: center/);
  assert.match(design,/\.artwork-media-original \{[^}]*max-width: 100%/);
  assert.match(design,/@media \(max-width:780px\) \{ \.artwork-modal-media \{ max-width: 100%/);
});
test("sign-in stays within the viewport with accessible short-screen card overflow and neutral autofill",()=>{
  assert.match(design,/html:has\(\.auth-signin\) \{ overflow-y: hidden; scrollbar-gutter: auto; scrollbar-width: none/);
  assert.match(design,/\.auth-photo-background\.auth-signin \{[^}]*height: 100dvh; min-height: 0/);
  assert.match(design,/\.auth-signin \.login-card \{ max-height: 100%; overflow-y: auto/);
  assert.match(design,/html:has\(\.auth-signin\)::-webkit-scrollbar \{ display: none/);
  assert.match(design,/\.auth-signin \.form-stack input[^}]*background: transparent/);
  assert.match(design,/\.auth-signin \.password-input-shell[^}]*background: transparent/);
  assert.match(design,/input:is\(:autofill,:-webkit-autofill\)[^}]*1000px var\(--signin-autofill\) inset/);
  assert.match(design,/:root\[data-theme="dark"\] \.auth-signin \{ --signin-autofill:#1c2314/);
});
test("formal registration grows on desktop and stacks named sections on smaller screens",()=>{
  assert.match(design,/\.signup-form-column \{ width: min\(1120px,100%\)/);
  assert.match(design,/\.signup-security-section \{[^}]*border-inline-start: 1px solid var\(--border\)/);
  assert.match(design,/@media \(max-width:760px\) \{\s*\.signup-card \.signup-form-grid \{ grid-template-columns: minmax\(0,1fr\)/);
});
test("search hints slide and fade without intercepting input, with a reduced-motion fallback",()=>{
  assert.match(design,/\.gallery-search-field \{[^}]*flex: 1 1 0; min-width: 0; align-self: stretch/);
  assert.match(design,/\.search-hints \{[^}]*pointer-events: none/);
  assert.match(design,/@keyframes search-hint-first/);
  assert.match(design,/@keyframes search-hint-second/);
  assert.match(design,/focus-within \.search-hints > span \{ animation-play-state: paused/);
  assert.match(design,/@media \(prefers-reduced-motion:reduce\) \{[^}]*\}[^}]*animation: none/);
});
