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
- 2026-11-10 detail discovery supersedes earlier fixed viewer/card layout description.
  Keep natural proportions/no upscaling; phone image-height locking and background-route
  restoration preserve scrolling. [Current design](../artwork-discovery-layout.md).
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
