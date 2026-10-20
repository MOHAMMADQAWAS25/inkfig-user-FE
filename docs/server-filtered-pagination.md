# Server-filtered pagination audit (2026-10-20)

## Corrected flows

| List | Database query scope | Page behavior |
| --- | --- | --- |
| Reports | status + target_type + reason_code; newest/oldest with creation/ID ties | 25 matches per request; all filters/order retained on continuation/live refresh |
| Admin users | trimmed literal case-insensitive name/email search + role + is_active | 10 matching users per UI page; no fetch-all loop; filtered total supplies page count |
| Exhibition periods | existing backend upcoming/past predicates and ordering | Separate returned groups/cursors; no browser-clock reclassification or client sorting |

Reports `total` is for all selected filters. `type_counts` applies status/reason but
not the selected type, so All/Posts/Accounts tabs retain useful full-dataset totals.
User `total` counts the filtered directory; `summary` counts the entire existing
administrable joined-account scope for overview cards. These are database
aggregations, not counts of downloaded rows.

Changing report filters/order resets the batch scope, closes stale details and
invalidates in-flight old responses. User query keys include viewer, filters and
page; a changed scope starts at page one without requesting its previous page.
Mutations invalidate user pages/summaries; shrinking totals clamp invalid pages.
Fetch failures do not claim there are no matching records. UI styles and existing
moderation/role/status permissions are unchanged.

## Audit of other list filtering

- Home category/selected owner and semantic query already reach backend filtering
  before continuation. Search-rank sorting is a defensive presentation check of
  backend-ranked results, not eligibility filtering.
- Profile posts/likes/saves and followers/following already have backend scope and
  continuation; find-user search sends its query to the backend.
- Exhibition submission statuses and eligible exhibitions already filter before
  backend pagination. No additional backend changes were necessary.
- Related artwork eligibility/ranking remains database-side similarity >=0.20.
- Notifications already have server continuation and separate summary counts.
- Bounded full option lists, recent-history exact-match visibility, duplicate-ID
  removal, virtualization and immediate post-mutation row cleanup remain legitimate
  frontend presentation/state work; they are not filters of unloaded database pages.

## Limits and verification

This is a filter/order-before-pagination correction, not a universal pagination
redesign. Existing numeric offset bounds and timestamp/keyset cursor designs are
retained. Offset pages can shift during concurrent inserts/deletions; refresh
recovers canonical state. Totals and rows are separate database reads and may
briefly differ during concurrent changes. Exact totals and substring search may
scan many rows as data grows; production query plans/cost should be monitored.
Existing report status/date index supports both sort directions; no speculative
index/migration was added for every filter combination.

Backend tests execute filtered queries against isolated SQLite fixtures (including
matches beyond the initial batch and ties), plus HTTP authorization/validation.
They are not a production PostgreSQL integration claim. Browser tests are DOM-based
and do not certify real-device rendering. No production user/report mutations are
needed for this verification.

## Deployment and rollback

Matching branch `fix/server-filtered-pagination` in user-system and user-FE.
Deploy user-system first (additive query parameters/page metadata), then frontend.
No migration, main-system deployment, new dependency or configuration change.

Frontend baseline: `398ea79706d0df068f1f3ced98465bd60006de9f`.
Backend baseline is recorded in its feature log. Commit subjects identify this
ticket: `Filter report and user directories before pagination` (backend) and
`Use server-filtered pagination for administration lists` (frontend).

Revert frontend ticket commit first, then backend ticket commit if requested,
and redeploy in that order. Preserve later unrelated changes and historical logs;
do not reset/force-push. No data/schema rollback is required.
