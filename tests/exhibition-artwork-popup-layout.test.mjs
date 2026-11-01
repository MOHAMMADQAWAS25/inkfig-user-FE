import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("exhibition cards open a scoped native popup while home/profile keep artwork routes",()=>{
  const read=path=>readFileSync(new URL(`../src/features/${path}`,import.meta.url),"utf8");
  const card=read("exhibitions/ExhibitionArtworkCard.tsx");
  assert.doesNotMatch(card,/\/artwork\//);
  assert.match(card,/<Link className="exhibition-artwork-artist"/);
  assert.match(card,/aria-haspopup="dialog"/);
  const popup=read("exhibitions/ExhibitionArtworkPopup.tsx");
  assert.match(popup,/showModal\(\)/);assert.match(popup,/usePageScrollLock\(true\)/);
  assert.match(popup,/createPortal\(/);assert.match(popup,/ArtworkDetailModal containedInDialog/);
  assert.match(popup,/mediaFooter=\{exhibitionId \? <ExhibitionRatingControls/);
  assert.match(read("exhibitions/ExhibitionsPage.tsx"),/artworkPopup\?\.scope === popupScope/);
  for(const path of ["feed/PostCard.tsx","profile/ProfilePage.tsx"]){assert.match(read(path),/artworkPath\(language,/);assert.doesNotMatch(read(path),/ExhibitionArtworkPopup/);}
  const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
  assert.match(css,/\.exhibition-artwork-popup:not\(\[open\]\) \{ display:none/);
});
