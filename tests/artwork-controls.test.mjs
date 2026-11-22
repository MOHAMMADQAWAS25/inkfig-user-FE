import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const css=readFileSync("src/styles.css","utf8"),pageCss=readFileSync("src/features/works/artworkPage.css","utf8");

test("all artwork save controls stay icon-only, unframed and keyboard accessible",()=>{
  for(const file of ["src/features/works/ArtworkPage.tsx","src/features/home/ArtworkDetailModal.tsx"]){
    const source=readFileSync(file,"utf8");
    assert.match(source,/artwork-save-icon/);
    assert.match(source,/aria-label=\{t\(work.saved_by_me\s*\?\s*"home.unsaveWork"\s*:\s*"home.saveWork"\)\}/);
    assert.match(source,/aria-pressed=\{work.saved_by_me\}/);
    assert.match(source,/<Bookmark aria-hidden="true"/);
  }
  assert.match(css,/button\.artwork-save-icon:is\(:hover,:focus-visible\):not\(:disabled\) \{ width:44px; min-width:44px; max-width:44px; min-height:46px;[^}]*border:0;[^}]*background:transparent; box-shadow:none; transform:none/);
  assert.match(css,/\.artwork-save-icon:focus-visible \{ outline:2px solid var\(--primary\)/);
});
test("Back and report keep generous stable padding and exhibition cards use pointer cursors",()=>{
  assert.match(pageCss,/\.artwork-page-back \{[^}]*min-height:44px; padding:10px 18px/);
  assert.match(pageCss,/button:has\(\.lucide-flag\) \{ min-height:44px; padding:10px 18px/);
  assert.match(css,/button\.artwork-modal-report \{ min-height:44px; padding:10px 20px/);
  assert.match(css,/\.exhibition-artwork-card \{[^}]*cursor:pointer/);
});
