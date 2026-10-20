# Artwork detail page: implementation and rollback record

Ticket branch: `feature/artwork-detail-page` (frontend and main backend).

## Before this ticket

- Frontend baseline: `c925263f8ec2bdc74a911c52bff1e9dc62c22c08`.
- Main backend baseline: `b11e077f0e60abb25a6a044ce5f63df3de1fb58c`.
- Both worktrees were clean and main was pulled before editing.
- No database migration, artwork mutation, credential or environment change is required.
- Other agents' notification, exhibition, SEO, image-protection and scrolling work is retained.

## Change inventory

- Added the localized `/artwork/:workId` page, responsive reference-inspired image/metadata layout, related feed, creator/follow controls, sharing and existing authorized artwork actions.
- Homepage/profile cards navigate instead of opening public-detail modals; public exhibition/notification links use the route. Legacy homepage `?work=` URLs redirect.
- Reused existing PostCard and Feed masonry with related-feed scroll restoration disabled, avoiding a related-feed load jumping the whole page.
- Profile snapshots in the existing authenticated query cache preserve batches, cursors, tab and return position. Mutations synchronize cached artwork state. Owner editing uses the existing profile editor through an owned-work deep link.
- Administrative/review previews retain their existing modal workflow and context.
- Added localization, scoped CSS, API/hook/cache/navigation helpers and regression coverage.

## Safe rollback if requested

Use new revert commits, not reset/force-push. Identify this ticket's commits by branch and commit subject (`Add routed artwork details and related masonry feed`); exact hashes are reported in the final handoff. Revert only those commits, preserving later unrelated changes. If conflicts occur, inspect them rather than choosing a whole side. Revert/redeploy frontend first to restore prior popup/card behavior; then revert/redeploy the main-backend endpoint. No database rollback or content deletion is needed. Rerun relevant tests/builds and follow the repository's pull/log/synchronize/push workflow. Append a rollback entry to the feature log; do not remove historical entries.

The baseline hashes are reference points, not instructions to discard newer work.

## 2026-10-20 - Isolated contain-fit artwork-page viewer

Branch: `fix/artwork-page-image-fit`. Pre-change frontend baseline: `43d1a8886aa528327cd9bb41d987b2a83db97f61`.

Replaces only the artwork page's shared popup media usage with `ArtworkPageMedia.tsx`. Dedicated class names prevent popup CSS inheritance. A definite responsive viewport contains a full-width/full-height, absolutely positioned image/video with `object-fit: contain` and centered positioning. Natural media dimensions cannot grow grid tracks beyond the viewer. No decorative blur copy, transform/shrinking calculation, measurement observers or forced minimum viewer height. Neutral theme surface fills unavoidable letterboxing; portrait, square and panoramic artwork retain their proportions. Existing popup media component and global popup styles remain untouched. Image right-click/drag deterrents, localized errors, video controls, post actions, theme colors, metadata, masonry and related rules are retained.

Changed files: ArtworkPage.tsx, new ArtworkPageMedia.tsx, artworkPage.css, artwork-page.test.tsx, new artwork-page-media.test.tsx and artwork-page-media-layout.test.mjs, this document and AGENT_FEATURE_LOG.md. No backend, migration, storage or artwork-data changes.

To return exactly to this ticket's starting viewer behavior, revert the commit titled `Fix artwork page image fitting with isolated viewer`, then rebuild/redeploy frontend. Revert only this follow-up: do not revert the earlier icon colors or related-artwork/backend work, reset main, force-push, or remove historical feature-log entries. Exact commit hash and verification/deployment results are provided in the handoff. If future edits overlap, inspect conflicts and preserve unrelated changes.

## 2026-10-20 - No-upscale opened artwork images

Baseline: `1265206` (reference only, not a reset target). The image-only selector
`.artwork-page-media > img.artwork-page-media-original` uses `object-fit: scale-down`.
The browser chooses natural intrinsic CSS size or a smaller contain-fit size,
centered in the existing bounded viewer. Large images shrink; small images are
not automatically enlarged. The original URL/file and responsive viewer bounds
remain unchanged. This does not promise one source pixel per physical display
pixel on high-density screens or add an interactive zoom feature. Video, feed
cards, shared popups and related-gallery layout are unchanged.

Files: artworkPage.css, ArtworkPageMedia.tsx (comment), artwork-page-media tests,
this document and AGENT_FEATURE_LOG.md. No backend, API or migration changes.
To restore automatic enlargement, revert only the commit titled
`Prevent upscaling small images on artwork pages`, rebuild and redeploy frontend.
Do not revert the original viewer or unrelated intervening work.
