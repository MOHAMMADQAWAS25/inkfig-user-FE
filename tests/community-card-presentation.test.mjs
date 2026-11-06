import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const css=readFileSync("src/styles.css","utf8");
test("card identities and numeric reactions grow without changing masonry footer height",()=>{
  assert.match(css,/\.feed-post-card \.feed-card-footer \.feed-creator \{[^}]*font-size:\.85rem; font-weight:750/);
  assert.match(css,/\.feed-card-footer \.feed-creator :is\(img,\.feed-creator-initial\) \{ width:28px; height:28px/);
  assert.match(css,/\.feed-card-like svg \{ flex:0 0 20px; color:#fff/);
  assert.match(css,/\.feed-card-like\.liked,\.feed-card-like\.liked svg \{ color:#e53935/);
  assert.match(css,/\.feed-card-footer \{[^}]*height:44px/);
  assert.match(css,/\.feed-card-like \{[^}]*background:transparent/);
  assert.match(css,/\.feed-card-like:is\(:hover,:focus-visible\):not\(:disabled\) \{ background:transparent/);
  assert.match(css,/\.artwork-modal-actions \.artwork-modal-like:is\(:hover,:focus-visible\):not\(:disabled\) \{ background:transparent; border-color:transparent; box-shadow:none/);
  assert.match(css,/\.profile-artwork-grid \.artwork-pin-like:hover \{ background:transparent; box-shadow:none/);
});
test("footer is opaque and theme-relative, with one dark grey divider",()=>{
  assert.match(css,/\.site-footer \{[^}]*border-top:1px solid #4b4d46; background:var\(--bg\)/);
  assert.match(css,/\.site-footer::before \{ display:none/);
});
test("profile galleries omit creator hover overlays and personal submissions reuse the browsing card",()=>{
  const profile=readFileSync("src/features/profile/ProfilePage.tsx","utf8");
  assert.doesNotMatch(profile,/className="artwork-artist-link"/);
  const submissions=readFileSync("src/features/exhibitions/MyExhibitionSubmissionsPage.tsx","utf8");
  assert.match(submissions,/<ExhibitionArtworkCard[^>]*showRating=\{false\}/);
  assert.match(submissions,/className="exhibition-personal-submission"/);
  assert.match(css,/\.exhibition-personal-submissions \.exhibition-record-actions \{ flex:0 0 auto/);
});
