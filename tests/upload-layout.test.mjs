import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8").split("/* Shared artwork/exhibition upload:")[1];
test("upload panels follow theme tokens, preserve the rail and stack on small screens",()=>{
  assert.match(css,/\.upload-page \{[^}]*background: var\(--bg\); color: var\(--text\)/);
  assert.match(css,/padding-inline-start: calc\(var\(--app-rail-size\)/);
  assert.match(css,/\.upload-workspace\.form-stack \{[^}]*grid-template-columns: minmax\(0,2fr\) minmax\(260px,1fr\)/);
  assert.match(css,/@media \(max-width:780px\)[\s\S]*grid-template-columns: minmax\(0,1fr\)/);
  assert.match(css,/@media \(max-width:720px\) \{ \.upload-page\.app-page-with-sidebar \{ padding-inline: 12px/);
});
test("hidden file input cannot widen the upload page and type tiles expose keyboard focus",()=>{
  assert.match(css,/\.upload-workspace input\.sr-only \{ width: 1px; height: 1px; min-width: 0; min-height: 0/);
  assert.match(css,/\.upload-media-panel \.work-file-field \{ position: relative/);
  assert.match(css,/:has\(input:focus-visible\) \{ outline: 2px solid var\(--primary\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)[^}]*transition: none/);
});
