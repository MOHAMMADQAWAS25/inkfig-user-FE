import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("exhibition badges use top-left hover overlays without changing masonry geometry",()=>{
  const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
  assert.match(css,/\.work-exhibition-overlay \{ position:absolute; top:12px; left:12px;[^}]*opacity:0; pointer-events:none/);
  assert.match(css,/\.feed-post-card:hover \.work-exhibition-overlay,\.artwork-card:hover \.work-exhibition-overlay/);
  assert.match(css,/\.work-exhibition-overlay \{[^}]*width:42px; height:42px/);
  assert.match(css,/@media\(max-width:600px\)\{\.work-exhibition-overlay \{ width:38px; height:38px/);
  assert.match(css, /data-focus-mode="keyboard"[^\n]*work-exhibition-overlay/);
  assert.match(css, /@media\(hover:none\)\{\.work-exhibition-overlay \{ opacity:1/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.work-exhibition-overlay \{ transition:none/);
  for(const path of ["feed/PostCard.tsx","profile/ProfilePage.tsx","works/ArtworkPage.tsx"]){
    assert.match(readFileSync(new URL(`../src/features/${path}`,import.meta.url),"utf8"),/<WorkExhibitionBadge /);
  }
  assert.doesNotMatch(readFileSync(new URL("../src/features/exhibitions/ExhibitionArtworkCard.tsx",import.meta.url),"utf8"),/WorkExhibitionBadge/);
});
