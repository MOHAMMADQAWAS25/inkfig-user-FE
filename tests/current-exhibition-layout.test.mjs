import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const css=readFileSync("src/styles.css","utf8");
test("public exhibition wall uses two large split cards with rail-safe and mobile bounds",()=>{
 assert.match(css,/\.exhibition-artwork-grid \{[^}]*grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.exhibition-artwork-card \{[^}]*grid-template-columns: minmax\(0,1fr\) minmax\(0,1fr\)/);
 assert.match(css,/\.exhibitions-page.app-page-with-sidebar \{ padding-inline-start: calc\(var\(--app-rail-size\) \+ 24px\)/);
 assert.match(css,/@media \(max-width:1100px\) \{ \.exhibition-artwork-grid \{ grid-template-columns: minmax\(0,1fr\)/);
 assert.match(css,/\.exhibition-artwork-media img \{[^}]*object-fit: contain/);
});
test("native report modal is fixed, viewport bounded and permits safe small-screen fallback",()=>{
 assert.match(css,/\.report-modal \{ position: fixed;[^}]*max-height: calc\(100dvh - 24px\)/);
 assert.match(css,/\.report-modal \{[^}]*scrollbar-width: none/);
 assert.match(css,/\.report-modal \.report-dialog textarea \{[^}]*resize: none/);
 assert.match(css,/\.app-sidebar-labeled \[data-tooltip\]::after \{ display: none/);
});
