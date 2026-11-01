# Exhibition artwork popup

Only public exhibition gallery artwork cards use popup triggers (image, title,
View details, and non-interactive card content). Rating inputs/forms are excluded
from opening. Homepage/search/related/profile links still use dedicated artwork
routes. Exhibition overview cards still open their exhibition normally.

ExhibitionsPage scopes popup state by exhibition/viewer and clears it on scope
change. Stable callback avoids rerendering all memoized cards on popup open/close.
ExhibitionArtworkPopup portals a native dialog to body, uses shared page-scroll
locking, restores opener focus and queries fresh full work by viewer/work key with
AbortSignal. Loading, missing/unavailable work and retry remain in the popup.
Escape, X and outside clicks close it; no navigation/history entry or gallery page
reset is introduced. Refresh does not restore popup state. Native dialog provides
background inertness/focus containment, including desktop.

Existing ArtworkDetailModal renders inside the native container using optional
containedInDialog mode. Its default standalone behavior is unchanged. The parent
owns scroll/focus; child avoids duplicate dialog semantics and duplicate manual
body locks. Existing image protection, responsive media, themes and Arabic remain.
Permission-gated like/save/report behavior is reused. Like/save mutations are
guarded, followed by a confirmed refetch/cache update; optional interactionBusy
disables controls without hiding Save. Other modal consumers default to previous
behavior. No new moderation/edit/delete permission is introduced.

Gallery voting remains on cards and now also appears below the popup image using
the same exhibition-scoped eligibility and mutation/cache flow. Other artwork
routes remain read-only for exhibition ratings. Closing keeps loaded pages, current ratings
and existing scroll position; backend ratings/authorization/API/schema unchanged.

Branch `fix/exhibition-artwork-popup`, baseline
`02f45fd82d9704dee4363bfbcf959d14efc324d2`. Revert only the ticket commit titled
`Open exhibition artworks in an in-place details popup` and redeploy frontend to
restore gallery navigation to artwork pages. No database/data rollback needed;
preserve rating votes, earlier feature-log entries and unrelated work.

Tests exercise actual components with native dialog APIs mocked in jsdom. They
verify one dialog, portal/URL/scroll/focus, loading cancellation, retry/dismissal,
popup rating synchronization, permissions, image protection, gallery continuation and Arabic.
These are not real-browser pixel/focus-trap or physical-device certification.
