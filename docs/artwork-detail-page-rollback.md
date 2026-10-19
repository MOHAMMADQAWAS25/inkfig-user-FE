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
