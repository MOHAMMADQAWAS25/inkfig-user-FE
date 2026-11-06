import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8").split("/* Phone control refinements;")[1]?.split("@media(max-width:720px) {\n  /* Clip only")[0];
test("phone filters retain selection without inactive touch-hover and related badges disappear",()=>{
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(css,/:root:not\(\[data-theme="dark"\]\) \.gallery-filters button:not\(\.active\):hover/);
  assert.match(css,/:root\[data-theme="dark"\] \.gallery-filters button:not\(\.active\):hover/);
  assert.match(css,/\.artwork-page-related \.feed-post-card \.work-exhibition-overlay \{ display:none; pointer-events:none/);
});
test("phone drawer uses a scrollable middle with fixed bottom preferences and borderless glass in both themes",()=>{
  assert.match(css,/\.mobile-drawer \{ display:flex; flex-direction:column/);
  assert.match(css,/\.mobile-drawer-grid \{ flex:1 1 auto; min-height:0; overflow-y:auto/);
  assert.match(css,/\.mobile-drawer-preferences \{ flex-shrink:0; margin-top:26px; justify-content:flex-end/);
  assert.match(css,/\.mobile-bottom-nav \{ border:0; box-shadow:0 6px 24px/);
  assert.doesNotMatch(css,/inset 0 1px/);
  assert.match(css,/\[data-theme="dark"\] \.mobile-bottom-nav \{ box-shadow:/);
});
