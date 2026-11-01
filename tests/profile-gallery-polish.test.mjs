import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const css=readFileSync("src/styles.css","utf8").split("/* Visible card identities,")[1];
test("profile controls remain icon-only and fixed-size during hover with centered tabs",()=>{
 assert.match(css,/profile-report-button span[^\n]*display:none/);
 assert.match(css,/profile-logout > span \{ display:none/);
 assert.match(css,/profile-logout:is\(:hover,:focus-visible\) \{ width:44px/);
 assert.match(css,/\.profile-page \.profile-tabs button \{ justify-self:center; justify-content:center/);
 assert.match(css,/button::after \{ left:50%; right:auto; width:56px/);
 assert.match(css,/button > span \{ position:absolute; inset-inline-start:calc\(50% \+ 20px\)/);
});
test("exhibition backgrounds blur independently while the original image stays sharp",()=>{
 assert.match(css,/\.exhibition-artwork-blur \{[^}]*filter:blur\(24px\) saturate\(1\.15\)/);
 assert.match(css,/\.exhibition-artwork-original \{ position:relative; z-index:1/);
 assert.doesNotMatch(css,/\.exhibition-artwork-original[^{}]*\{[^}]*filter:blur/);
});
