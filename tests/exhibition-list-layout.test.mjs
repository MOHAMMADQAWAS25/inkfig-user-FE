import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("exhibition list stays single-column at existing card dimensions with even group spacing", () => {
  const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
  assert.match(css,/\.exhibition-period-section>\.exhibitions-grid \{ grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/\.exhibitions-list \{ display:grid; gap:22px/);
  assert.match(css,/\.exhibitions-list > \.exhibition-period-section \{ display:grid; gap:22px; margin:0/);
  assert.match(css,/\.exhibitions-list > \.exhibition-period-section > \.exhibitions-grid \{ margin:0/);
  assert.match(css,/\.exhibition-overview-card \{[^}]*block-size:min\(500px,calc\(100svh - 96px\)\)/);
});
