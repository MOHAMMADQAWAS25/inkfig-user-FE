# Project state - inkfig-user-FE
Updated: 2026-11-24. Evidence: synchronized mainb56d5b0 and verified frame ticket.
Start with [instructions](../../AGENTS.md) and [active handoff](../collaboration/tasks/INKFIG-ARTWORK-FRAME-001.md).

## Current objective and approved scope
Owner requested My Submissions artwork popup spacing and a line below Related Links.
Preserve current artwork frames/original viewer, history/actions, and other pages.
Status: scoped styling verified;547 checks and production build passed; push pending.
Task: [INKFIG-SUBMISSION-SPACING-001](../collaboration/tasks/INKFIG-SUBMISSION-SPACING-001.md).
Integration owner: a7mad.ishaq; agent /root, submission-spacing-2026-11-24.
Frontend-only; no migration/API/authorization/dependency changes.
One focused source commit/publication follows verification; exact hash and automatic
deployment outcome reported in handoff. No manual deployment/production mutations.
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
- e3f4d07/5dd4ec9 measured discovery/expanded recommendations retained. The owner
  now explicitly replaces their image-dependent sizing with consistent frames,
  side-by-side desktop details, centered media and internal metadata scrolling.
- Original-image native viewer has actual-pixel/Fit modes and same-URL history;
  Back closes the original first. Compact exhibition tags keep per-event links/ratings.
- Artwork viewers use icon-only unframed accessible saves; card identities/counts
  keep their sizes but use regular weight. Exhibition previews have scoped same-URL
  history entries; Back closes/Forward restores without remounting their gallery.
- Notification/find-user panels portal to body, avoiding artwork hover inheritance;
  backdrop, focus/scroll locking and dismiss-only closing remain active.

## Git and preserved work
- Baseline mainb56d5b0; independent fix/consistent-artwork-viewer.
- Clean frontend checkout at inspection; no pre-existing staged/unstaged/untracked files.
- Git authors evidence: MOHAMMADQAWAS25/mohammadqawas25, a7mad.ishaq, anasmazen;
  contributions do not establish exclusive ownership.
- Public GitHub issue queries returned no open issues on 2026-11-15.
  Other checkouts, private conversations and unpublished changes are not visible.
- Setup task issue URL unavailable: no authenticated issue-writing tool/gh here.
  Repository handoffs are publishable coordination, not locks.

## Verification / deployment distinction
- Current ticket:547 checks (125 Node/source +422 Vitest/39 files), strict TS/Vite/SEO
  build and whitespace passed. Actual components/inert fixtures tested13 combinations
  of1440/1180/820/768/390 widths, themes/languages, portrait/wide/square/tall/panorama/
  tiny images and20 tags/long text; no upscale/distortion/overflow or changing box size.
- Native original-viewer Back retained its parent popup, then parent Back retained
  gallery DOM. Phone120px height-only changes left frame/card dimensions unchanged.
- No live production mutations or physical Safari/iOS certification. Temporary
  browser/server closed; no helpers/screenshots/build output committed.
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
1. Fetch/integrate safely, publish the verified focused ticket and inspect automatic CI.
2. Report exact hash, conflicts/push/merge/deployment separately; owner visual review next.
3. Retain independent checkouts, scoped handoffs and earlier unresolved limits.
4. Rollback by reverting the focused source commit while preserving feature-log history.
