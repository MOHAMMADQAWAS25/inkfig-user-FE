import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const css=readFileSync("src/styles.css","utf8");
const polish=css.split("/* Exhibition/community polish:")[1];
test("expanded exhibition wall uses equal logical administration-size gutters",()=>{
  assert.match(polish,/--exhibition-gutter:clamp\(22px,3.2vw,48px\)/);
  assert.match(polish,/padding-inline-start:calc\(var\(--app-rail-size\) \+ var\(--exhibition-gutter\)\)/);
  assert.match(polish,/\.exhibition-detail-page \.exhibitions-shell \{ width:100%; max-width:1800px/);
  assert.match(polish,/@media\(max-width:720px\)[^\n]*--exhibition-gutter:var\(--page-gutter,14px\)/);
});
test("rating stars preview without pointer focus rectangles and remain keyboard accessible",()=>{
  assert.match(css,/label:has\(input:focus-visible\) \{[^}]*border-radius:50%/);
  assert.doesNotMatch(css,/exhibition-rating-stars label:focus-within/);
  assert.match(polish,/exhibition-rating-stars input \{[^}]*background:transparent; box-shadow:none; outline:0/);
  assert.match(polish,/artwork-modal-media-footer \.exhibition-rating-controls/);
});
test("visible creator and likes row reserves space outside natural image proportions",()=>{
  assert.match(readFileSync("src/features/feed/feedLayout.ts","utf8"),/CREATOR_ROW_HEIGHT = 44/);
  assert.match(polish,/\.feed-post-card \{ grid-template-rows:minmax\(0,1fr\) 44px/);
  assert.match(polish,/\.feed-card-footer \{ display:flex/);
  assert.match(polish,/\.feed-card-footer \.feed-creator \{[^}]*opacity:1; pointer-events:auto/);
});
test("footer is centered and theme-relative, report/actions keep stable dimensions",()=>{
  assert.match(polish,/\.site-footer \{ position:relative; isolation:isolate; justify-content:center/);
  assert.match(polish,/\.site-footer \{[^}]*border-top:1px solid #4b4d46; background:var\(--bg\)/);
  assert.match(polish,/:root\[data-theme="dark"\] \.site-footer \{ background:var\(--bg\)/);
  assert.match(polish,/profile-report-button span \{ max-width:none; opacity:1; transition:none/);
  assert.match(polish,/artwork-modal-save\):?[^\n]*min-height:46px/);
  assert.match(polish,/\.work-exhibition-overlay \{[^}]*max-width:calc\(100% - 76px\)[^}]*border-radius:10px/);
});
