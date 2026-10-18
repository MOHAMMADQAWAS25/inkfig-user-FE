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
