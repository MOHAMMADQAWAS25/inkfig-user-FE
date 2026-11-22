# Project state - inkfig-user-FE
Updated: 2026-11-15. Evidence: synchronized source at 5dd4ec9 plus this docs-only setup.
Start with [instructions](../../AGENTS.md) and [active handoff](../collaboration/tasks/INKFIG-COLLAB-001.md).

## Current objective and approved scope
Establish useful bounded project memory and three-person collaboration.
Owner's attached 2026-11-15 workflow authorizes documentation/instruction changes,
preserving application behavior and existing work. No runtime/config/data changes.
Status: Create exhibition button alignment/styling implemented; checks running.
Task: [INKFIG-CREATE-BUTTON-001](../collaboration/tasks/INKFIG-CREATE-BUTTON-001.md).
Human: a7mad.ishaq; agent: /root, a7mad-create-button-2026-11-22.
Default integration decision-maker: owner, until explicitly delegated.
No partner workstreams or checkout/session assignments have been approved.

## Implemented in current source (not a live certification)
- Public masonry home, semantic/account search, upload/profile/follows/likes/saved,
  auth/verification/reset/settings, notifications panel/toasts and admin users/reports.
- Exhibitions/current-upcoming-past, submissions/review/blocks/withdrawals,
  per-exhibition rating popup and paginated category-filtered leaderboard.
- Dedicated artwork route now integrates a measured detail block with related masonry.
  Desktop related columns can grow beyond six; default home geometry is separate.
- Mobile background-route recovery/swipes, no-upscale natural media and theme/localization.
- Latest e3f4d07 integrated discovery + 5dd4ec9 zoom-responsive detail/desktop likes.
  These supersede this session's earlier fixed-box description; do not restore it accidentally.

## Git and preserved work
- Baseline branch main, origin/main synchronized at 5dd4ec9.
- Clean frontend checkout at inspection; no pre-existing staged/unstaged/untracked files.
- Git authors evidence: MOHAMMADQAWAS25/mohammadqawas25, a7mad.ishaq, anasmazen;
  contributions do not establish exclusive ownership.
- Public GitHub issue queries returned no open issues on 2026-11-15.
  Other checkouts, private conversations and unpublished changes are not visible.
- Setup task issue URL unavailable: no authenticated issue-writing tool/gh here.
  Repository handoffs are publishable coordination, not locks.

## Verification / deployment distinction
- This setup passed documentation links, memory size bounds, selected secret/path
  patterns, staged Markdown-only review and whitespace checks; see handoff.
- Application suites NOT rerun for docs-only changes. Last recorded results:
  522 checks (121 Node/source + 401 Vitest), strict build, per 2026-11-10 log. Historical reports are not a new verification claim.
- Configured workflow: [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml).
- No manual migrations, deployment, production writes or live browser tests authorized/run.
- [skip ci] on setup commits avoids existing automatic production workflows.
- Setup commit dd424da0a051996ab538d9e19f3b28f6824c5a49 pushed successfully to origin/main.
  Final checkpoint/log commit follows it in Git history; no production deployment claimed.

## Applicable verification commands (not run for this docs-only setup)
npm test; npm run build. Local worker fallback: npm test -- --pool=threads --maxWorkers=2.
Do not run manual migrations/deployments or production fixtures without explicit approval.

## Partial / pending / known limits
- Search Console ranking diagnosis for brand Inkfig remains unresolved; metadata is not a ranking guarantee.
- /:language/notifications still renders FeaturePlaceholderPage; actual notification panel is implemented.
- Home scroll performance was investigated/rolled back in earlier work, not certified fixed by detail-layout changes.
- Current card/default-home geometry must be read from feedLayout.ts rather than old chat pixel estimates.
- Physical iOS/Safari verification is not established by prior synthetic fixture screenshots.
- Deployment versions, pending production migrations and live health are unverified.
- No authenticated Search Console access/browser bridge established in this session.
- Personalization/tags remain proposals, not approval to implement a trained recommender.
- Expired/used email-code cleanup was deferred by owner until later; user service owns it.
- Physical-device and real PostgreSQL concurrency/plan certification are not implied by tests.

## Exact next actions
1. Setup is documented/published; preserve existing local files, do not repeat it.
2. Owner/partners each establish independent clones and publish one bounded task claim.
3. Confirm human -> checkout/session mappings and integration owner for shared changes.
4. On next implementation, inspect current source and relevant memory; update its handoff.
5. Request explicit approval for manual migration/deploy/production mutation if needed.
