# Report counters and reporting restrictions

- Admin desktop Reports/flag icon and mobile-menu Reports entry show the total
  pending user and post reports. Zero hides the badge; values above 99 show 99+.
  Opening the page does not clear pending reports. Reviewing/dismissing/actioning
  a pending report reduces the total.
- Authenticated managers fetch only GET /reports/pending-count off the Reports
  page. Existing authenticated WebSocket reports.changed signals invalidate the
  summary after creation, review and reporting-access changes. Reconnect also
  refreshes summaries. Bursts coalesce; hidden tabs defer live refreshes until
  visible. Full report rows reload only while the Reports page is mounted;
  loaded pages and filters are retained. REST remains the source of truth.
- On a selected report, the Reporter section offers Block reporter from
  submitting reports / Restore reporter's reporting access, with confirmation.
  This affects the reporter, not the reported person. It does not suspend the
  account, delete reports or resolve them. Administrator accounts and the current
  admin's own reporting access cannot be restricted through this control.
- Ordinary reporting remains enabled. An opening report dialog checks the
  current user's GET /reports/eligibility; blocked users see a localized notice.
  POST /reports checks the database again under the same account row lock used
  by PUT /reports/reporters/{user_id}/restriction, including old open forms.
  Admin restriction changes require reports.manage; eligibility/create require
  reports.create. Existing DB unique indexes reject duplicate reports from the
  same reporter on the same post or user with 409, even after review. Different
  reporters can report the same subject.
- Restrictions default to unblocked. Migration
  20261019_024_reporter_restrictions.sql stores the restriction and latest changer
  and update time. No new notification-table rows, permissions, environment
  variables or dependency changes are required. WebSocket delivery is best
  effort; saved state survives transport failure and reload/reconnect recovers.

Deploy the user-system migration/backend first, then frontend. Main-system is
unchanged. The additive API fields tolerate older frontend deployments.

## Report details popup

Selecting a report opens its existing details and authorized actions in a centered
native modal dialog, not a second column beside the queue. The table retains its
full width, loaded pages, filters and scroll position. The dialog scrolls internally,
supports English/Arabic and both themes, and uses native focus containment/background
inertness. Close with X, Escape or an outside click; dismissal is disabled while an
action is pending. Focus returns to the opening row button when it still exists.
Action errors and notices are shown inside the popup. Resolving a report that no
longer matches the selected status closes its popup through existing filtering.

Frontend-only change on `fix/report-details-popup`, baseline
`63a18865e1c9169dca50359c704be399d19df5f6`. To restore the side-panel behavior, revert
the commit titled `Open report details in a modal popup` and redeploy frontend;
preserve other changes and append a rollback log. No database migration or backend
deployment is needed.

### Two-column report details (2026-10-20)

The popup uses a wider responsive two-column layout: reported artwork or account
avatar on the physical left, report metadata/messages/links/actions on the right.
Artwork is contained without cropping in a bounded preview; missing previews keep
their existing placeholder. Arabic text is RTL inside the content column without
swapping the image/detail positions. At 760px and below, image stacks above details.
The native popup dismissal, focus/scroll restoration, busy guards, filtering,
pagination and backend-authorized actions are unchanged.

Frontend-only branch `fix/report-popup-columns`, baseline
`afa1b7b8d39e02cb5c8a049e8b70b3c89e174e70`. Revert the commit titled
`Arrange report popup preview and details in two columns` and redeploy frontend to
restore the single-column popup, preserving the popup itself and unrelated work.
No migration or backend deployment required.

### Fixed desktop preview (2026-10-20)

On desktop, only the right details column scrolls; the left preview and close
button remain stationary. Both columns are bounded to the viewport, including
short windows. Mobile retains the existing stacked, internally scrolling popup.
Frontend-only branch `fix/report-fixed-preview`, baseline `e8fe34d`.
Revert only `Keep report preview fixed while details scroll` to undo this change.

### Type-scoped reason filters (2026-10-20)

All Reports offers the unique union of post and account reason codes. User Reports
offers only impersonation, harassment, spam, hate speech and Other, matching backend
submission validation. Post Reports retains work reasons, including historical
sexual-content reports for moderation only. Options describe supported reasons,
not merely those present in the currently loaded batch. New-report forms share the
same current reason definitions; historical reasons are not offered for submission.
Changing type preserves a compatible reason, otherwise resets to All Reasons in the
same interaction. Existing server-side status/type/reason/order filtering precedes
pagination; scope changes restart at the first batch and reject stale responses.
Frontend-only `fix/report-reason-filters`; revert this ticket's commit to undo.
