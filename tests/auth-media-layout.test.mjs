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
test("sign-in hides only its scrollbar and neutralizes blue autofill without blocking short-screen scrolling",()=>{
  assert.match(design,/html:has\(\.auth-signin\) \{ overflow-y: auto; scrollbar-gutter: auto; scrollbar-width: none/);
  assert.match(design,/html:has\(\.auth-signin\)::-webkit-scrollbar \{ display: none/);
  assert.match(design,/\.auth-signin \.form-stack input[^}]*background: transparent/);
  assert.match(design,/\.auth-signin \.password-input-shell[^}]*background: transparent/);
  assert.match(design,/input:is\(:autofill,:-webkit-autofill\)[^}]*1000px var\(--signin-autofill\) inset/);
  assert.match(design,/:root\[data-theme="dark"\] \.auth-signin \{ --signin-autofill:#1c2314/);
});
