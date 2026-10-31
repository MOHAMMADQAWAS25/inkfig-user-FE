import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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
