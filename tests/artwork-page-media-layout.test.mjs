import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/features/works/artworkPage.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/features/works/ArtworkPage.tsx", import.meta.url), "utf8");

test("page-only viewer uses natural responsive dimensions instead of a fixed letterboxed frame", () => {
  assert.match(css, /\.artwork-page-media \{[^}]*height:auto[^}]*min-height:0[^}]*box-sizing:border-box/);
  assert.match(css, /\.artwork-page-media-original \{[^}]*position:static[^}]*width:auto; height:auto[^}]*max-width:100%[^}]*max-height:min\(78svh,860px\)[^}]*object-fit:contain; object-position:center/);
  assert.doesNotMatch(css, /artwork-modal-media|artwork-media-original|scale\(|blur\(/);
  assert.match(page, /<ArtworkPageMedia /);
  assert.doesNotMatch(page, /from "\.\.\/home\/ArtworkMedia"/);
});

test("opened artwork images shrink to fit without enlarging small originals; videos keep contain", () => {
  assert.match(css, /\.artwork-page-media-original \{[^}]*width:auto; height:auto[^}]*max-width:100%[^}]*object-fit:contain; object-position:center/);
  assert.doesNotMatch(css, /video[^{}]*\{[^}]*object-fit:scale-down/);
  assert.doesNotMatch(css, /\.artwork-page-media-original \{[^}]*position:absolute/);
});
test("detail block adapts its image column and headings without changing popup viewers",()=>{
  assert.match(css,/grid-template-columns:fit-content\(55%\) minmax\(280px,1fr\)/);
  assert.match(css,/\.artwork-page-hero--wide \{ grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/\.feed-featured\[data-full-width="true"\] \.artwork-page-related-title/);
  assert.match(page,/featured=\{\{ key: workId, content: featuredContent \}\}/);
});

test("opened artwork uses available desktop width without a fixed outer cap",()=>{
  const shell=css.match(/\.artwork-page-shell \{([^}]+)\}/)?.[1]??"";
  assert.match(shell,/width:100%/);
  assert.match(shell,/min-width:0/);
  assert.doesNotMatch(shell,/max-width/);
  assert.match(css,/@media\(min-width:721px\) \{\s*\.artwork-page-media-original \{ max-height:78svh/);
});

test("desktop numeric likes have theme contrast and stable transparent hit areas",()=>{
  assert.match(css,/@media\(min-width:721px\) \{[\s\S]*min-width:88px; gap:9px; font:inherit; font-weight:750/);
  assert.match(css,/:root:not\(\[data-theme="dark"\]\) \.artwork-page-actions button:not\(\[aria-pressed="true"\]\) \.lucide-heart \{ color:#8c8c8c/);
  assert.match(css,/button\[aria-pressed="true"\]:has\(\.lucide-heart\) \{ color:#e53935/);
  assert.match(css,/button:has\(\.lucide-heart\):focus-visible \{ outline:2px solid var\(--primary\)/);
  assert.match(css,/\.artwork-page \.feed-card-like:is\(:hover,:focus-visible\):not\(:disabled\) \{ background:transparent; box-shadow:none; transform:none; border-radius:10px/);
});
