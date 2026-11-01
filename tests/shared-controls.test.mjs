import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read=path=>readFileSync(new URL(`../src/${path}`,import.meta.url),"utf8");
const css=read("styles.css");
const shared=css.split("/* Shared footer and device-independent artwork/profile controls. */")[1];
test("homepage footer follows document flow and both themes",()=>{
  assert.match(read("app/AppRouter.tsx"), /<SiteFooter\/>/);
  assert.doesNotMatch(read("features/home/HomePage.tsx"), /<footer/);
  assert.match(shared, /\.site-content \{ padding-bottom: 0/);
  assert.match(shared, /\.site-footer \{ position: static;[^}]*min-height: 76px/);
  assert.match(shared, /:root\[data-theme="dark"\] \.site-footer \{ background: #171d11/);
});
test("camera badge and fixed icon-only logout are available on desktop",()=>{
  assert.match(shared, /\.profile-avatar-actions \{ display: none/);
  assert.match(shared, /\.profile-avatar-camera \{[^}]*display: block/);
  assert.match(shared, /\.profile-logout:is\(:hover,:focus-visible\) \{ width:44px/);
  assert.match(shared, /\.profile-logout > span \{ display:none/);
  assert.match(shared, /\.app-sidebar-logo img \{ width: 58px/);
});
test("pointer focus cannot pin card overlays but keyboard focus remains supported",()=>{
  assert.match(css, /\.artwork-pin-media\[data-focus-mode="keyboard"\]:focus-within/);
  assert.doesNotMatch(css, /\.artwork-pin-media:focus-within/);
  assert.doesNotMatch(read("features/feed/PostCard.tsx"), /hoverReset/);
  assert.match(read("features/profile/ProfilePage.tsx"), /<CardMedia>/);
});
