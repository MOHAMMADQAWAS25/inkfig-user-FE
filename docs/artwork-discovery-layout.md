# Integrated artwork discovery layout

Baseline: frontend main `79648c6`. Ticket branch: `feature/integrated-artwork-discovery`.

The detail page reserves a measured, multi-column block inside the existing virtual
masonry feed. Recommendations use unoccupied columns beside it and continue below
it. Below 1000px of available feed width the block spans all columns. RTL mirrors
placement. The default home feed has no reserved block and keeps its old layout.

The detail block stays mounted when recommendation cards are virtualized.
ResizeObserver measures its height after image loading, wrapping, reaction errors
or width changes, so recommendations cannot cover it. Image dimensions drive
natural sizing; small images are not upscaled, wide artwork stacks above details,
and portrait media can share a row with details. Phone maximum media height is
captured until width changes, avoiding browser-toolbar resizing while scrolling.

No new API, dependency, migration, stored-data change, or recommendation algorithm.
Existing authentication, permissions, reaction cache updates, pagination,
navigation and moderation remain authoritative. Existing exhibition popup viewers
are separate and unchanged.

## Rollback

All ticket changes (including shared Feed's optional featured block and tests) are
contained in one commit, **Integrate artwork detail into recommendation masonry**.
The handoff records its exact hash. If rollback is requested, synchronize clean
main, create a dedicated rollback branch, and use
`git revert --no-commit <ticket-commit>`. Preserve AGENT_FEATURE_LOG.md exactly as it was before the
revert (do not remove this ticket's historical entry), then append a new rollback
entry. Review the code-only reversal, rerun frontend tests/build, and commit/push
through the authorized Git workflow. If later changes overlap, reconcile them
instead of blindly overwriting them. Never reset main or overwrite other work.
Both backends and database need no rollback. The prior mobile fixes are in earlier
commits and are not reverted with this ticket.
