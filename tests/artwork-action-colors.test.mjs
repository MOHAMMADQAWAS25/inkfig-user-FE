import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/features/works/artworkPage.css", import.meta.url), "utf8");

test("opened artwork icons keep red/yellow identity in both themes regardless of pressed state", () => {
  assert.match(css, /\.artwork-page-actions \.lucide-heart \{ color:var\(--danger\); \}/);
  assert.match(css, /\.artwork-page-actions \.lucide-bookmark \{ color:#a98100; \}/);
  assert.match(css, /:root\[data-theme="dark"\] \.artwork-page-actions \.lucide-bookmark \{ color:#f4c430; \}/);
  // Icon-only selectors preserve labels, layout, and the existing outline/filled state.
  assert.doesNotMatch(css, /\.artwork-page-actions button\[aria-pressed=true\] \.lucide-(heart|bookmark)/);
});
