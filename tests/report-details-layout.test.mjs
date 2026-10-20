import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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
