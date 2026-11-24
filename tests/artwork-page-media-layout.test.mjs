import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/features/works/artworkPage.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/features/works/ArtworkPage.tsx", import.meta.url), "utf8");

test("fixed viewer centers natural media within a consistent image-independent frame", () => {
  assert.match(css, /\.artwork-page-hero > \.artwork-page-media \{[^}]*align-items:center[^}]*height:100%[^}]*min-height:0[^}]*box-sizing:border-box/);
  assert.match(css, /\.artwork-page-media-original \{[^}]*position:static[^}]*width:auto; height:auto[^}]*max-width:100%[^}]*max-height:100%[^}]*object-fit:contain; object-position:center/);
  assert.match(css,/\.artwork-page-hero \{[^}]*height:clamp\(420px,calc\(100svh - 112px\),820px\)/);
  assert.doesNotMatch(css, /artwork-modal-media|artwork-media-original|scale\(|blur\(/);
  assert.match(page, /<ArtworkPageMedia /);
  assert.doesNotMatch(page, /from "\.\.\/home\/ArtworkMedia"/);
});

test("restored image sizing retains portrait height fitting without forced side-gap enlargement", () => {
  assert.match(css, /\.artwork-page-media-original \{[^}]*width:auto; height:auto[^}]*max-width:100%[^}]*object-fit:contain; object-position:center/);
  assert.doesNotMatch(css, /video[^{}]*\{[^}]*object-fit:scale-down/);
  assert.doesNotMatch(css, /\.artwork-page-media-original \{[^}]*position:absolute/);
  const media=readFileSync(new URL("../src/features/works/ArtworkPageMedia.tsx",import.meta.url),"utf8");
  assert.match(media,/natural.height > natural.width \? height \/ natural.height/);
  assert.match(media,/Math.min\(width \/ natural.width, height \/ natural.height, 1\)/);
  assert.doesNotMatch(media,/Math.max\(fittedScale, width \/ natural.width\)/);
  assert.match(media,/const width = element.clientWidth, height = element.clientHeight/);
  assert.match(css,/overflow-y:auto; overscroll-behavior:auto/);
  assert.match(page,/<ArtworkHeader \/>/);
  assert.match(css,/\.artwork-page-back-overlay \{[^}]*inset-inline-start:14px/);
  assert.match(css,/\.artwork-page-back-overlay \{[^}]*border:0;[^}]*background:transparent/);
  assert.match(css,/button.artwork-page-back-overlay:is\(:hover,:focus-visible\):not\(:disabled\) \{ background:transparent/);
});
test("detail block keeps desktop columns and contains long metadata instead of growing",()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1\.1fr\) minmax\(0,1fr\)/);
  assert.match(css,/\.artwork-page-info \{[^}]*min-height:0[^}]*overflow-y:auto[^}]*scrollbar-gutter:stable/);
  assert.doesNotMatch(css,/artwork-page-hero--wide/);
  assert.doesNotMatch(page,/mediaRatio|naturalMedia/);
  assert.match(css,/\.feed-featured\[data-full-width="true"\] \.artwork-page-related-title/);
  assert.match(page,/featured=\{\{ key: workId, content: featuredContent \}\}/);
});

test("opened artwork uses available desktop width without a fixed outer cap",()=>{
  const shell=css.match(/\.artwork-page-shell \{([^}]+)\}/)?.[1]??"";
  assert.match(shell,/width:100%/);
  assert.match(shell,/min-width:0/);
  assert.doesNotMatch(shell,/max-width/);
  assert.match(css,/max-height:100%;[^}]*object-fit:contain/);
});

test("desktop numeric likes have theme contrast and stable transparent hit areas",()=>{
  assert.match(css,/@media\(min-width:721px\) \{[\s\S]*min-width:88px; gap:9px; font:inherit; font-weight:750/);
  assert.match(css,/:root:not\(\[data-theme="dark"\]\) \.artwork-page-actions button:not\(\[aria-pressed="true"\]\) \.lucide-heart \{ color:#8c8c8c/);
  assert.match(css,/button\[aria-pressed="true"\]:has\(\.lucide-heart\) \{ color:#e53935/);
  assert.match(css,/button:has\(\.lucide-heart\):focus-visible \{ outline:2px solid var\(--primary\)/);
  assert.match(css,/\.artwork-page \.feed-card-like:is\(:hover,:focus-visible\):not\(:disabled\) \{ background:transparent; box-shadow:none; transform:none; border-radius:10px/);
});
