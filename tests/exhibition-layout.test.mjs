import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("exhibition toolbar stays fixed above cards with safe-area spacing and blur", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  const toolbar = css.match(/\.exhibition-toolbar \{([^}]+)\}/)?.[1] ?? "";
  assert.match(toolbar, /position:fixed/);
  assert.match(toolbar, /top:calc\(12px \+ env\(safe-area-inset-top,0px\)\)/);
  assert.match(toolbar, /z-index:20/);
  assert.match(toolbar, /backdrop-filter:blur\(18px\)/);
  assert.match(toolbar, /flex-wrap:wrap/);
});

test("every exhibition card permits page scroll chaining while retaining accessible inner overflow", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  const content = css.match(/\.exhibition-overview-card>\.exhibition-card-content \{([^}]+)\}/)?.[1] ?? "";
  assert.match(content, /overflow:auto/);
  assert.match(content, /overscroll-behavior:auto/);
  assert.doesNotMatch(css, /\.exhibition[^{}]*\{[^}]*overscroll-behavior:(?:contain|none)/);
});

test("creator avatar and name zoom together without underlining or changing layout", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /\.feed-creator:hover \{ transform: scale\(1\.035\); text-decoration: none/);
  assert.match(css, /\[dir="rtl"\] \.feed-creator \{ transform-origin: right center/);
  assert.doesNotMatch(css, /\.feed-creator[^{}]*\{[^}]*text-decoration: underline/);
  assert.match(css, /\.feed-creator:is\(:hover,:focus-visible\) \{ transform: none/);
});
