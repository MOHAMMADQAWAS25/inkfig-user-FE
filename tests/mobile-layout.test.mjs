import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const mobile = css.split("/* Mobile-only gallery, navigation and profile refinements. */")[1];
test("new gallery and profile styling stays inside the phone breakpoint",()=>{
  assert.match(mobile, /@media \(max-width: 720px\)/);
  assert.match(mobile, /\.artwork-pin-media \.artwork-card-type-tag/);
  assert.match(mobile, /\.artwork-pin-media \.artwork-pin-save,[\s\S]*?display: none/);
  assert.match(mobile, /\.gallery-filters button \{[^}]*font-size: \.78rem/);
  assert.match(mobile, /\.artwork-modal-save span[^}]*max-width: none; opacity: 1/);
});
test("phone upload stays centered and notifications stay immediately to its left",()=>{
  assert.match(mobile, /\.app-sidebar, \[dir="rtl"\] \.app-sidebar \{ display: grid; width: auto/);
  assert.match(mobile, /grid-template-columns: repeat\(7,minmax\(0,1fr\)\)/);
  assert.match(mobile, /\.app-sidebar-panel-button \{ grid-column: 3/);
  assert.match(mobile, /\.mobile-nav-upload \{ grid-column: 4/);
  assert.match(mobile, /\.mobile-nav-upload \{ grid-column: 5/);
  assert.match(mobile, /grid-template-columns: repeat\(9,minmax\(0,1fr\)\)/);
  assert.match(mobile, /safe-area-inset-bottom/);
});
test("phone artwork and profile preserve natural media and camera controls",()=>{
  assert.match(mobile, /max-height: 42svh/);
  assert.match(mobile, /overscroll-behavior: contain/);
  assert.match(mobile, /\.profile-intro \.profile-avatar-actions \{ display: none/);
  assert.match(mobile, /\.profile-avatar-camera > summary[^}]*width: 44px; height: 44px/);
  assert.match(mobile, /:root\[data-theme="dark"\] \.profile-avatar-camera/);
});
