import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("rating controls are gallery-only and card hover ratings are absent while detail summaries remain",()=>{
  const read=path=>readFileSync(new URL(`../src/features/${path}`,import.meta.url),"utf8");
  assert.match(read("exhibitions/ExhibitionArtworkCard.tsx"),/<article className="exhibition-artwork-card" onClick=/);
  assert.match(read("exhibitions/ExhibitionArtworkCard.tsx"),/<ExhibitionRatingControls /);
  for(const path of ["feed/PostCard.tsx","profile/ProfilePage.tsx","works/ArtworkPage.tsx","works/WorkExhibitionBadge.tsx"]){
    assert.doesNotMatch(read(path),/ExhibitionRatingControls|changeExhibitionRating/);
  }
  for(const path of ["feed/PostCard.tsx","profile/ProfilePage.tsx"]){
    assert.doesNotMatch(read(path),/RatingSummary/);
    assert.match(read(path),/<WorkExhibitionBadge /);
  }
  assert.match(read("works/WorkExhibitionBadge.tsx"),/<RatingSummary rating=\{item.rating\}/);
  const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
  assert.match(css,/\.exhibition-rating-overlay \{ position:absolute/);
  assert.match(css,/\.exhibition-rating-stars input \{[^}]*opacity:0/);
  assert.match(css,/\.exhibition-rating-stars label:focus-within/);
  assert.match(css,/prefers-reduced-motion:reduce[^\n]*exhibition-rating-overlay/);
});
