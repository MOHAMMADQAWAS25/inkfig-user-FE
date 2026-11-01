# Exhibition artwork ratings

## Presentation

Only public exhibition gallery artwork cards mount ExhibitionRatingControls.
Artwork image, title and View artwork links remain navigable; voting form is not
nested inside a link. Submit is explicit, stars alone never send a vote. Native
radio inputs support keyboard navigation; busy guards prevent repeated requests.
Change/remove are available for an existing eligible vote, never after closing.
Guest, own-work, organizer, restricted and ended views show results without inputs.
The existing exhibition clock disables controls at the end boundary; server time
and authorization remain authoritative. Empty scores say No ratings yet, not zero.

Home/search/related/profile posts/likes/saved cards show read-only latest-exhibition
average/count on hover or keyboard focus; touch shows it without a hover. A year
tooltip/accessibility label identifies which exhibition, not a combined lifetime
rating. Opened artwork and existing preview membership badges show each exhibition's
independent summary with its link, no editable stars—even when opened from gallery.
RatingSummary has no mutation or interactive voting controls. Existing trophy/save,
masonry, image protection, categories and artwork dimensions preserved. Exhibition
wall can grow naturally to accommodate controls. English/Arabic, both themes,
wrapping and reduced-motion styles reuse current tokens.

## Data and updates

Uses companion main-system migration/API. Ratings are per exhibition/work/voter;
full eligibility is returned with the gallery page, not fetched per card. Only
score goes in PUT body; DELETE has no body and both use the existing cookie-aware
requestJson helper. Server returns confirmed totals/my score. No optimistic average
or vote counter calculations. Failures retain confirmed results; eligibility
failures invalidate the current gallery. Leaving aborts pending UI updates (a
server-committed vote may still exist and will be seen on the next read).

updateRatingCaches updates only the current viewer/matching exhibition/work across
gallery/feed/profile/detail/related caches and preserves pagination. Other viewers'
personal cache entries and other exhibition scores are untouched. New reads update
other users' votes; this feature does not add polling, a voter list, vote notices,
new realtime broadcasts, ranking, fraud-detection infrastructure or winner selection.

## Rollout and rollback

Backend migration `20261101_018_create_exhibition_ratings.sql` first, API next,
frontend main workflow last. Matching feature/exhibition-artwork-ratings branches.
Baseline frontend `ca57072`, backend `7dd7d40`. Optional rating fields tolerate an
older API during rollout; no fake history/scores. Revert this frontend commit first
to remove voting and summary UI; revert companion backend application if necessary.
Keep/export existing vote data; no automatic destructive migration rollback.

Automated interaction, read-only/localization, API, cache-isolation and layout
regressions accompany full test/build checks. No physical-device/pixel-layout or
real production voting certification claimed. Backend enforces real permission,
account, approval and time constraints; gallery-only is UI scope, not proof of the
page that an HTTP client displayed. See companion backend doc for retention/cascades.

## Card-hover removal (2026-11-01)

User requested removing ratings from card hover. PostCard (home/search/related)
and profile posts/likes/saved no longer render rating summaries, including touch
or keyboard overlays. Exhibition trophy/save icons remain unchanged. Gallery
voting/results and opened artwork/preview detail ratings remain available.
Frontend-only branch `fix/remove-card-hover-ratings`, baseline `18d525a`.
Revert only this removal commit to restore the hover summaries; no migration or
backend data/permission changes.

## Exhibition artwork popup (2026-11-01)

Gallery artwork triggers now open an in-place native details popup rather than
navigating away. Voting stays on gallery cards; popup results remain read-only.
Homepage/profile artwork routes are unchanged. See exhibition-artwork-popup.md
for scoped behavior, verification limits and revert-only instructions.
