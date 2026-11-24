import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL(`../src/${p}`,import.meta.url),"utf8");
const css=read("features/works/artworkViewer.css");

test("original-size viewer preserves intrinsic pixels and offers a bounded fit mode",()=>{
  assert.match(css,/\.artwork-original-canvas \.artwork-original-image \{[^}]*width:auto; height:auto; max-width:none; max-height:none/);
  assert.match(css,/data-fit="true"[^}]*\.artwork-original-image \{ max-width:100%; max-height:100%/);
  const source=read("features/works/ArtworkImageExpand.tsx");
  assert.match(source,/useState\(false\)/);assert.match(source,/showModal\(\)/);
  assert.match(source,/usePageScrollLock\(true\)/);assert.match(source,/createPortal\(/);
  assert.match(source,/aria-label=\{labels.close\}/);assert.match(source,/onCancel=/);
});
test("shared gallery/submission popups use a fixed box and no scale/padding crop",()=>{
  assert.match(css,/\.exhibition-expanded-card-popup \.artwork-modal\.artwork-fixed-viewer \{[^}]*grid-template-columns:minmax\(0,1\.1fr\) minmax\(0,1fr\)[^}]*height:clamp\(420px,calc\(100svh - 112px\),820px\)/);
  assert.match(css,/\.artwork-fixed-media-original \{[^}]*position:static[^}]*width:auto; height:auto[^}]*max-width:100%; max-height:100%[^}]*transform:none/);
  assert.match(css,/\.artwork-fixed-viewer > \.artwork-fixed-media \{[^}]*height:100%; padding:0/);
  const modal=read("features/home/ArtworkDetailModal.tsx");
  assert.match(modal,/artwork-modal artwork-fixed-viewer/);assert.match(modal,/<ArtworkMedia fixedFrame/);
  assert.match(modal,/<WorkExhibitionBadge[^>]*detail compact/);
});
