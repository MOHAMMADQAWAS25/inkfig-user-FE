import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
const phone=css.split("/* Phone-only polish:")[1];
test("phone polish is breakpoint-scoped, hides card overlays and lightens visible identities",()=>{
  assert.match(phone,/@media \(max-width:720px\)/);
  assert.match(phone,/\.work-exhibition-overlay/);
  assert.match(phone,/font-size:\.76rem; font-weight:400/);
  assert.match(phone,/\.auth-signin \.auth-logo \{ width:min\(148px,50%\)/);
  assert.match(phone,/\.site-footer \{ margin-block-end:0; padding-block-end:calc/);
  assert.doesNotMatch(css,/translateY\(calc\(-110% \* var\(--mobile-header-progress/);
});
test("phone opened media uses stable small-viewport height and compact identity with framed numeric likes",()=>{
  const artwork=readFileSync(new URL("../src/features/works/artworkPage.css",import.meta.url),"utf8").split("@media(max-width:720px)")[1];
  assert.match(artwork,/height:clamp\(160px,42svh,360px\); transition:none/);
  assert.match(artwork,/width:44px; height:44px/);
  assert.match(artwork,/button:has\(\.lucide-heart\) \{ background:var\(--surface\); border-color:var\(--border\)/);
});
