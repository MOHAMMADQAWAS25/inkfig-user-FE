import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("report popup controls have theme-aware hover, focus and reduced-motion states without activating disabled buttons", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /\.moderation-detail-dialog :is\(\.moderation-actions button,\.moderation-view-links a,\.moderation-detail-close\) \{ transition:background-color 160ms/);
  assert.match(css, /:is\(:hover,:focus-visible\):not\(:disabled\) \{ background-color:color-mix\(in srgb,var\(--text\) 8%,var\(--surface\)\)/);
  assert.match(css, /button\.danger:is\(:hover,:focus-visible\):not\(:disabled\) \{[^}]*border-color:currentColor/);
  assert.match(css, /\.moderation-detail-dialog[^\n]*:focus-visible \{ outline:2px solid currentColor/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.moderation-detail-dialog[^\n]*transition:none/);
});

test("report details use a bounded theme-aware native popup rather than a second table column", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/features/admin/AdminReportsPage.tsx", import.meta.url), "utf8");
  const dialog = readFileSync(new URL("../src/features/reports/ReportDetailsDialog.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /has-selection|<aside className="moderation-detail"/);
  assert.match(page, /<ReportDetailsDialog /);
  assert.match(dialog, /showModal\(\)/);
  assert.match(dialog, /usePageScrollLock\(true\)/);
  assert.match(css, /\.reports-admin-page \.moderation-detail-dialog \{[^}]*width:min\(1100px,calc\(100% - 32px\)\)[^}]*max-height:calc\(100svh - 40px\)[^}]*overflow-y:auto[^}]*background:var\(--surface\)/);
  assert.match(css, /\.moderation-detail-columns \{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)[^}]*direction:ltr/);
  assert.match(css, /@media\(max-width:760px\)\{\.moderation-detail-columns \{ grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /\.moderation-detail-media > \.moderation-preview \{[^}]*height:100%[^}]*object-fit:contain/);
  assert.match(css, /\.moderation-detail-dialog::backdrop/);
});

test("desktop report preview stays fixed while only the details column scrolls", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  const desktop = css.split("@media(min-width:761px){")[1]?.split("@media(max-width:760px)")[0];
  assert.ok(desktop);
  assert.match(desktop, /\.moderation-detail-dialog \{ overflow-y:hidden/);
  assert.match(desktop, /\.moderation-detail-columns \{ min-height:0; max-height:calc\(100svh - 132px\)/);
  assert.match(desktop, /\.moderation-detail-media \{ position:relative; height:min\(65svh,620px,calc\(100svh - 132px\)\)/);
  assert.match(desktop, /\.moderation-detail-media \{[^}]*align-self:center/);
  assert.match(css, /\.moderation-detail-media \{[^}]*place-items:center/);
  assert.match(desktop, /\.moderation-detail-content \{[^}]*min-height:0[^}]*max-height:calc\(100svh - 132px\)[^}]*overflow-y:auto[^}]*scrollbar-gutter:stable/);
});
