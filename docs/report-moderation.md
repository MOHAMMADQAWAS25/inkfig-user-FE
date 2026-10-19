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
