# Frontend domain vocabulary
Updated: 2026-11-15. Backend DTOs/schema own persistence/invariants;
[API overview](API_OVERVIEW.md) links authoritative sources.

- Session: user identity/role/permission metadata in AuthContext; secret JWTs stay HttpOnly.
- Work/artwork/post: same published owned creative item; do not introduce a second post model.
- Work type/category: seeded system type selected on upload; distinct from proposed semantic tags.
- Feed card: lightweight work/creator/media/reaction flags; not all single-work metadata.
- ImageMedia: original URL, dimensions/dominant color and responsive variant sizes.
- Like and save: independent user states and caches; saved collection is not a public vote.
- Related artwork: image-embedding similarity to opened work, not learned user preference.
- Search rank: query-specific backend rank, not permanent work rank or rating.
- Public/own profile: identity plus posts/followers/following/aggregate received likes.
- Exhibition: schedule/participation window, banner, management and public gallery.
- Submission: event membership with pending/approved/rejected status; not a copy of work.
- Withdrawal: membership removal/request; must not delete original artwork.
- Participation block: event-specific restriction, not global account suspension.
- Rating: score1..5 per exhibition/work/voter; can_rate/reason comes from backend.
- Leaderboard: eligible counted-vote ranking within one event/category, distinct from search.
- Notification: persisted inbox item; toasts and WebSocket invalidations are presentations/signals.
- Report: moderation record; reported target and reporter actions have different scope.
- Search history: user-scoped recency and explicit selected account; not interest-learning consent.
- Featured detail block: measured content reserved inside recommendation masonry.
  Ordinary home masonry has separate geometry; CSS screen pixels != original image resolution.
- Temporary phone background route: inert preserved page behind artwork, not a second live feed.

## Invariants UI must respect
- Viewer may browse public content but cannot mutate; backend validates every operation.
- Do not send a client actor ID to replace server identity or trust page/referrer for auth.
- Preserve type/owner/filter/cursor/viewer scope when querying or invalidating caches.
- New work minimum200px width AND300px height; neither a total-area nor portrait-only rule.
- Only eligible event members/voters; approval is separate from uploading a public profile work.
- Do not merge rating averages between exhibitions or treat reported/blocked as deleted.
- Avoid per-card requests, destructive client cleanup or unapproved new schema assumptions.
- Tags/personalized multi-interest models remain future design, not current data contracts.
