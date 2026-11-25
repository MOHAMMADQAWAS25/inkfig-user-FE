# Integrated artwork discovery layout

Current presentation contract: the owner-approved 2026-11-24 consistent-frame
follow-up below supersedes the original image-dependent sizing/wide-image stacking.
The measured featured-block masonry and zoom-responsive recommendations remain.
The subsequent portrait/lightbox follow-up at the end overrides shrink-only
portrait sizing and original-pixel/Fit modes; wide-image sizing remains unchanged.

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

## Zoom-responsive follow-up (2026-11-10)

Baseline `e3f4d07`; branch `fix/zoom-responsive-artwork-and-desktop-likes`.
Opened artwork feeds now add approximately 220px-wide recommendation columns as
available CSS width grows (including browser zoom-out), without the old six-column
or 1800px outer-page limit. The detail reservation stays approximately 720–1280px
wide where side-by-side placement is possible; narrow layouts still span every
column. RTL mirrors the same geometry. Width changes replan directly from the
container ResizeObserver rather than waiting for the ordinary-feed debounce.
Desktop media follows its viewport-relative height limit without the former
860px ceiling, while retaining intrinsic proportions and no-upscaling behavior.
Home/list feed geometry, phone media height locking, pagination, virtualization,
recommendation ranking and API behavior remain unchanged.

Desktop numeric likes retain transparent backgrounds, gain visible light-theme
unliked hearts, red liked heart/count, restrained pointer hover and keyboard focus
outlines. Phone styling is unchanged. No new data/dependency/backend changes.

This follow-up is one separate commit, `Refine zoom-responsive artwork discovery
and desktop likes`. Revert that commit alone to return to `e3f4d07` behavior. To
also undo the original integrated layout, reverse the follow-up first and then
the original ticket. Preserve every historical feature-log entry and append the
rollback record, as described above; never reset or overwrite unrelated changes.

## Consistent opened-artwork frame (2026-11-24)

Baseline `b56d5b0`; branch `fix/consistent-artwork-viewer`.
At a given desktop viewport, every artwork uses the same responsive-height box
with image/details columns, regardless of image dimensions, description length or
exhibition count. Images remain at intrinsic size if they fit; otherwise scale down
only enough to fit, without cropping/upscaling. Centering balances any unused space
on opposing sides. Wide images no longer move details below on desktop/tablets.
Long metadata scrolls inside its column. Phones stack stable image/details regions;
pixel sizing is captured until width changes to avoid browser-toolbar resizing.

Opened artwork exhibition memberships use compact, deduplicated clickable name/year
tags with small per-event rating summaries. Many/long tags wrap without changing
the outer frame; rating permissions and submission/voting controls are unchanged.

The image expand icon opens the original URL at actual size in a native modal with
scroll/pan space and an optional Fit to screen toggle. Its same-URL React Router
entry lets browser Back close the original first, keeping the parent card/gallery
mounted; Forward restores it. Native focus containment/restore, nested scroll locks,
Escape/close, loading failures, image protection and English/Arabic labels retained.
No video image-expansion UI; existing video controls remain unchanged.

This follow-up is isolated in `Standardize artwork frames and add original image
viewer`. Revert that focused commit to restore `b56d5b0` presentation without undoing
the prior save-icon, typography, notification isolation or exhibition Back fixes.
Preserve feature-log history and reconcile later overlaps during any rollback.
No API, backend, stored-data, migration or dependency changes.

## 2026-11-24 portrait and lightbox follow-up

Baseline fca8273; branch fix/artwork-fit-lightbox. Portraits scale to full frame
height, centered horizontally; if wider than the column, its edges are clipped
evenly. The expansion always shows the complete image fitted to the viewport.
Landscape/square images keep the prior shrink-only contain rule. Decorative image
blur appears only in remaining gaps, beneath the sharp original. Layout client
dimensions exclude temporary opening-animation transforms.

Expansion has no toolbar/size toggle: native modal, inset close, strong blurred/dim
backdrop,180ms opening/closing, outside/Escape/Back dismissal and reduced-motion
fallback. Same-URL history, focus and nested scroll locks remain. Details allow
scroll chaining; artwork route/exhibition popup retain search/profile access.
The existing home keyword/selected-account query contracts are reused.
Rollback this focused follow-up independently, preserving append-only logs.

## Image Back overlay and side-gap fill follow-up

From dd31376, Back moves inside the image top-left and its old feed row disappears.
Images fit at least the media width; portraits retain full-height fitting. Excess
height/width clips evenly without distortion, eliminating side gaps. Wide media
already filling width and vertical-gap blur remain. Complete source stays visible
in the unchanged expanded screen-fit popup. No API/data changes.

Owner rollback after d2e2c6f: undo only forced side-gap enlargement, restoring
ArtworkPageMedia exactly to dd31376. Back keeps its overlay/RTL position and lifted
layout, with transparent normal/hover background and no border. Earlier portrait
fitting, gap blur and screen-fit popup remain.

## 2026-11-25 adaptive wide frames and aligned header

Owner now requests shorter landscape boxes. Shared media measures image width/
ratio and metadata child layout, bounds desktop height420–680px plus viewport cap,
keeps image/details side by side and scrolls long metadata. Portrait height stays
unchanged. Phone wide-media height uses width/aspect while portrait and toolbar-
stable limits remain. No renewed forced image upscaling or changed home geometry.
Header desktop search52px/avatar34px match home; shared20px gutter aligns header,
featured card and recommendation wall, reducing outer dead space. Responsive
phone sizes/RTL/theme and native popup header/backdrop constraints are retained.

Selective follow-up: baseline four-sided gaps alone trigger proportional width
enlargement. Check both axes before enlargement on every resize, leaving one-axis/
no-gap images unchanged. Center any excess height; complete source remains in the
fit-only expansion. Adaptive wide-box/header changes are retained.
