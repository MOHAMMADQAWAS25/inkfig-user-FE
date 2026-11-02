import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
test("home separates its fixed texture from the original full-page theme tint without intercepting controls", () => {
  const home = css.match(/^\.gallery-home \{([^}]+)\}/m)?.[1] ?? "";
  const dark = css.match(/:root\[data-theme="dark"\] \.gallery-home \{([^}]+)\}/)?.[1] ?? "";
  const layer = css.match(/\.gallery-home::before \{([^}]+)\}/)?.[1] ?? "";
  const tint = css.match(/\.gallery-home::after \{([^}]+)\}/)?.[1] ?? "";
  assert.match(home, /--gallery-tint: linear-gradient\(rgb\(238 231 189 \/ 0\.82\), rgb\(238 231 189 \/ 0\.94\)\)/);
  assert.match(dark, /--gallery-tint: linear-gradient\(rgb\(16 20 12 \/ 0\.84\), rgb\(16 20 12 \/ 0\.94\)\)/);
  assert.match(home, /position: relative; isolation: isolate/);
  assert.match(home, /background: transparent/);
  assert.match(layer, /content: ""; position: fixed; inset: 0; z-index: -2; pointer-events: none/);
  assert.match(layer, /background: url\("\.\/assets\/gallery-ivory-background\.png"\) center top \/ cover/);
  assert.match(tint, /position: absolute; inset: 0; z-index: -1; pointer-events: none; background: var\(--gallery-tint\)/);
  assert.match(layer, /transform: translateZ\(0\)/);
  assert.doesNotMatch(home + dark, /cover fixed|background-attachment/);
  assert.doesNotMatch(layer, /will-change|filter:|animation:|transition:/);
});
