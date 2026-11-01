# Infinite image feed

The main gallery uses `useInfiniteFeed` (TanStack Query) and `Feed`.
Masonry is the default; pass `layout="list"` for a centered single column,
optionally `listMaxWidth={470}`. No video upload/player is introduced.
Profile galleries retain their existing pagination; this upgrade targets Home.

## Pagination and navigation

Chronological/category/artist feeds use `GET /api/v1/feed`, 20 cards per page,
with opaque composite cursors. Semantic search still uses the existing ranked
`/works/search` endpoint and its numeric continuation: the adapter preserves
ranking and deduplicates IDs, but does not claim snapshot/keyset guarantees for
search. Search starts only on Enter; account suggestions retain their debounce.
Full descriptions/links are fetched from `/works/{id}` when opening details.

TanStack Query caches successful pages for five minutes, keyed by viewer,
category, artist and submitted query. Requests consume its AbortSignal;
unmount/filter changes cancel obsolete requests. A synchronous lock and Query's
request coordination prevent duplicate pagination. Repeated cursors terminate
instead of looping. Errors keep existing cards visible and expose Retry.
Sign-in, sign-out and authentication expiry clear the in-memory query cache.
There is no localStorage persistence of personalized feed pages.

The sentinel uses IntersectionObserver with `rootMargin: "1200px 0px"`;
no pagination scroll handler is installed. Observers disconnect on cleanup.
Scroll positions for the eight most recent scopes are kept in memory, and
restored after the container has a usable width. URL parameters retain submitted
filters across route navigation; detail overlays leave the feed mounted.

## Masonry and virtualization

`FeedLayout` derives heights from stored dimensions before downloading images.
Cards reserve a fixed44px creator/like footer below the media. Masonry adds this
height independently of each image's natural aspect ratio. Creator links remain
visible on touch and desktop; the permission-gated heart/count action is separate
from artwork navigation. Save and exhibition badges remain media overlays.
Each append goes into the shortest column. The layout cache preserves existing
positions on append and interaction changes, rebuilding on geometry, order,
dimensions or direction changes. Cards use absolute translate3d positions;
the container keeps the tallest column's full height.

Columns use container width, not device names: two below 600px (one only below
240px), then three through six with a target desktop minimum of 220px plus gap.
Gaps are 12px/18px. Tune `columnCount` and the gap in `feedLayout.ts`.
ResizeObserver updates are debounced 80ms, with a visible-card anchor to reduce
position jumps on rotation. List cards are centered and at most 470px wide.

`visiblePositions` binary-searches each ordered column to render only the viewport
plus two screens (minimum 800px) in each direction. One keyboard-focused card may
remain mounted outside the window. A passive scroll listener coalesces events into
one requestAnimationFrame; resize and visibility restoration also refresh the
window. There is no idle animation-frame polling. Layout reads/state updates happen
only at half-viewport boundaries or height changes. Memoized positioned cards keep
unchanged buffered subtrees from rendering again when that window moves. Hidden
documents do not schedule frames; listeners/frames are cleaned up on unmount.
This avoids per-artwork observers and scanning every loaded item on each frame.
Loaded data/position arrays still grow with pages; DOM size depends on viewport,
not total items. Query caches expire after five minutes without observers.

On mobile, scroll-driven header progress belongs to a small header wrapper rather
than HomePage. Its transform/opacity track the gesture directly without restarting
a CSS transition on each frame; search controls and gallery do not rerender for
header movement. The existing 160px hide/reveal distance and focus/overlay locks
are preserved.

## Images and states

The backend stores `{url,width,height,dominantColor,sizes:[{w,url}]}` once before
publication. Static images get WebP variants up to 236/474/736/1080px without
upscaling. Animated GIF/WebP use the original to preserve animation. Actual
aspect ratios are intentionally not clamped/cropped, honoring the project's
natural-height artwork requirement. Very tall works therefore remain tall.

`LazyImage` uses responsive srcSet/sizes, async decoding, lazy loading, and an
eager/high-priority first pair. Save-Data/2G selects lower-resolution variants;
reduced-motion disables fades/spinner animation. Color placeholders and failures
occupy the same precomputed box, with title alt text and keyboard-visible focus.
Initial skeletons, loading-more, retry, empty, end, aria-busy and polite loaded
counts are included in English and Arabic.

Legacy/missing metadata uses a fixed square placeholder without late reflow.
Deploy the backend migration and finish its resumable media backfill before the
frontend for accurate proportions on existing posts. Original media is retained.

## Verification and limits

`npm test` runs the existing foundation suite plus Vitest/Testing Library
behavior tests. `npm run build` type-checks and creates the production bundle.
Coverage includes same-page deduplication, locks, retry, abort/stale responses,
cache restoration, repeated cursors, sentinel cleanup, responsive media,
shortest-column placement and bounded rendering with 10,000 records.

Real-browser checks cover append stability, hundreds of loaded cards, retry,
desktop/mobile/RTL, details, navigation back, and Enter-only search.
These verify geometry and bounded rendering, not a certified 60fps on a physical
mid-range phone or a field-measured CLS budget. Backend media metadata protects
against image-induced layout shifts; actual device performance remains dependent
on image decoding, network and hardware. No video autoplay is part of this scope.
