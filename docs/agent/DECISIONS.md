# Frontend decisions
Updated: 2026-11-15. Read current source before relying on historical UI descriptions.

- React19 + strict TS + Vite + React Router + Lucide + existing TanStack Query.
  Shared CSS/components; no unapproved UI/state framework. [Architecture](../ARCHITECTURE.md).
- InkFig olive/leaf/cream/fig tokens in styles.css supersede original orange/Shadow prose.
  Light/dark and English default/Arabic RTL retained; no invented dashboards.
- AuthContext/session helpers own frontend identity; requestJson uses credentials:include,
  coalesces refresh/retries and leaves JWT credentials in HttpOnly cookies.
- API clients separate user/main services; backend is final authority.
  [HTTP helper](../../src/api/httpClient.ts), [router](../../src/app/AppRouter.tsx).
- Ordinary home uses proportional masonry cards and bounded virtualization. Detail page's
  optional featured block, measured masonry and expanded column count are distinct.
- Owner-approved2026-11-24 consistent frames supersede image-dependent/wide stacking
  from2026-11-10, while preserving its masonry/zoom-responsive recommendations.
  Latest owner rollback restores dd31376 sizing: portrait height fit, landscapes/
  squares shrink-only contain, decorative gap blur; no forced side-gap enlargement.
  Transparent Back overlays the image corner without reserving a row. Retain
  scroll chaining and phone pixel locking. [Current design](../artwork-discovery-layout.md).
- Owner2026-11-25 supersedes uniform wide-card height: measure wide image/details,
  keep two columns, bound height420–680px and viewport; long metadata scrolls.
  Portrait/default heights unchanged. Phone wide-media height follows width/aspect,
  not toolbar height. Header control sizes/gutters follow the home design.
- Owner2026-11-25 permits proportional width enlargement only when unchanged baseline
  fitting leaves >2px aggregate gaps on BOTH axes (four sides). Derive eligibility
  from baseline on every resize, not current enlarged output; others retain sizing.
- Artwork headers reuse home profile-menu classes/SmoothDetails/preferences/logout;
  outside gestures dismiss without activating the artwork. Date uses existing
  localized relativeTime beside management buttons; full timestamp stays in title.
  Hide whitespace/empty description sections. Report/edit/delete retain permission guards.
- Expanded images use a screen-fitting native popup without a toolbar/size toggle.
  Same-URL history makes Back dismiss it first; close/outside/Escape animate and
  preserve focus/parent. Compact exhibition tags remain per-event links.
- Related ranking comes from main backend, not client popularity/category sorting.
  No new Voyage request when opening a work; do not add N+1 card calls.
- New work minimum200px wide AND300px tall, including boundary; client preflight plus
  authoritative publish check. [Validator](../../src/features/works/workImageDimensions.ts).
- @ account suggestions require selection to filter works to that user. Separate Find users
  panel searches names without @. Existing live searches debounce500ms.
- Profile Posts/Saved/Likes and public follow/counters are implemented, not placeholders.
- Exhibitions include separate submission/review records, popup rating and read-only
  leaderboard. Vote eligibility is backend-owned; gallery-only controls are presentation.
- Notifications are persistent inbox + WebSocket signals; toasts do not mark read.
  Notifications route still a placeholder; panel is the actual implemented surface.
- Sidebar sliders portal to body, isolating their dim/blur backdrop from page button
  hover rules. Exhibition popup history uses React Router state, not patched native
  history/listeners; preserve gallery DOM/cache and viewer/exhibition scope.
- SEO build provides four localized discovery URLs and brand schema, not full SSR or
  guaranteed ranking. About InkFig disclosure removed at owner request, metadata retained.
  [Indexing](../search-indexing.md); Search Console diagnosis remains pending.
- Personal preference ranking, automatic tags and predefined tag taxonomy are proposals,
  not shipped algorithms. Do not document them as implemented.
- 2026-11-15 workflow: independent clones/direct-main/published handoffs and bounded
  current files supersede whole historical-log rereads. Existing log remains append-only.
