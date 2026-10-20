import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
test("unopened exhibition cards have an external soft shadow without blurring their contents",()=>{
 const css=readFileSync("src/styles.css","utf8");
 const glow=css.match(/\.exhibition-overview-card:not\(\.exhibition-detail-card\), \.exhibition-artwork-card \{([^}]+)\}/)?.[1]||"";
 assert.match(glow,/box-shadow: 0 6px 28px/);
 assert.doesNotMatch(glow,/filter:|backdrop-filter:/);
});
test("artwork follow hover swaps theme colors and preserves its pill geometry",()=>{
 const css=readFileSync("src/features/works/artworkPage.css","utf8");
 assert.match(css,/\.artwork-page-creator > button:hover:not\(:disabled\) \{ background: var\(--primary\); color: var\(--primary-ink\); border-radius: 999px; transform: none; box-shadow: none/);
});
