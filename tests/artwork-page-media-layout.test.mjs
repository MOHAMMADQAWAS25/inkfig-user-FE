import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/features/works/artworkPage.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/features/works/ArtworkPage.tsx", import.meta.url), "utf8");

test("page-only viewer has definite responsive bounds, no popup selectors or intrinsic grid overflow", () => {
  assert.match(css, /\.artwork-page-media \{[^}]*height:min\(76svh,900px\)[^}]*min-height:0[^}]*box-sizing:border-box/);
  assert.match(css, /@media\(max-width:900px\)[\s\S]*\.artwork-page-media \{ height:min\(65svh,640px\); \}/);
  assert.match(css, /\.artwork-page-media-original \{[^}]*position:absolute; inset:0[^}]*width:100%; height:100%[^}]*object-fit:contain; object-position:center/);
  assert.doesNotMatch(css, /artwork-modal-media|artwork-media-original|scale\(|blur\(/);
  assert.match(page, /<ArtworkPageMedia /);
  assert.doesNotMatch(page, /from "\.\.\/home\/ArtworkMedia"/);
});
