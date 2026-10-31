import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Users page centers its bounded shell between the navigation rail and viewport edge", () => {
  const page = readFileSync(new URL("../src/features/admin/AdminUsersPage.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(page, /admin-page users-admin-page app-page-with-sidebar/);
  assert.match(css, /\.users-admin-page\.app-page-with-sidebar \{[^}]*padding-left:calc\(var\(--app-rail-size\) \+ var\(--users-gutter\)\); padding-right:var\(--users-gutter\)/);
  assert.match(css, /\[dir="rtl"\] \.users-admin-page\.app-page-with-sidebar \{ padding-right:calc\(var\(--app-rail-size\) \+ var\(--users-gutter\)\); padding-left:var\(--users-gutter\)/);
  assert.match(css, /\.admin-shell \{ width: min\(1380px,100%\); margin: 0 auto/);
  assert.match(css, /@media\(max-width:720px\)\{\.users-admin-page\.app-page-with-sidebar \{ --users-gutter:var\(--page-gutter,14px\)/);
});

test("users and reports omit the hero/refresh sections while preserving their main content", () => {
  const users = readFileSync(new URL("../src/features/admin/AdminUsersPage.tsx", import.meta.url), "utf8");
  const reports = readFileSync(new URL("../src/features/admin/AdminReportsPage.tsx", import.meta.url), "utf8");
  for (const page of [users, reports]) {
    assert.doesNotMatch(page, /admin-hero|admin-refresh|RefreshCw/);
    assert.match(page, /<AppSidebar\//);
  }
  assert.match(users, /className="admin-stats"/);
  assert.match(users, /className="admin-directory"/);
  assert.match(users, /admin.tryAgain/);
  assert.match(reports, /className="moderation-toolbar"/);
  assert.match(reports, /<ReportDetailsDialog /);
  assert.match(reports, /useReportsLive/);
});
