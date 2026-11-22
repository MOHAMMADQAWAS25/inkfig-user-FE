# Frontend API overview
[HTTP helper](../../src/api/httpClient.ts) is the shared request boundary.
Environment names only: VITE_USER_API_BASE_URL, VITE_MAIN_API_BASE_URL.
Configured production hosts: user-api.inkfig-hu.com/api/v1 and main-api.inkfig-hu.com/api/v1.
Never place backend secrets in VITE_ variables.

## Authoritative services
- [User contracts](../../../inkfig-user-system/docs/agent/API_OVERVIEW.md),
  [routes/DTOs](../../../inkfig-user-system/src/interface/api).
- [Main contracts](../../../inkfig-main-system/docs/agent/API_OVERVIEW.md),
  [routes/DTOs](../../../inkfig-main-system/src/interface/api).
- App feature API wrappers consume these; mock fixtures are not authoritative schemas.
- requestJson sends credentials:include, coalesces refresh on authorized401 paths
  then retries; AuthContext owns session metadata, not JS JWT storage.

## Main clients
- features/works/worksApi.ts: types/feed/search/profile collections, get/upload/publish,
  edit/delete/moderator delete and like/save. Upload validates decoded dimensions first.
- features/works/relatedArtworksApi.ts and useRelatedArtworks.ts: backend-ranked pages,
  query caching, dedup and excludes current work; no client rerank by likes.
- features/exhibitions/exhibitionApi.ts: listing, eligibility, submissions, management,
  bans/banners/withdrawals with server pagination/scope.
- features/exhibitions/exhibitionRatingsApi.ts: per-exhibition strict1..5 vote state,
  backend can_rate/unavailable_reason; cache update scope remains exhibition-specific.
- features/exhibitions/exhibitionRatingTypes.ts: frontend consumer types, not DB authority.
- Features expose lightweight badges/summaries without N+1 detail fetch per card.
- Runtime optional DTO fields must stay backwards-compatible during rolling deploy.

## User clients
- features/auth: signup/code/resend, login/logout/session and password recovery.
- features/profile/profileApi.ts: profiles/follow lists/search and avatar lifecycle.
- features/settings: profile/password/account/backup-email UI uses existing user API.
- features/reports/reportsApi.ts: protected queue/filter/eligibility/restriction/actions.
- features/notifications/notificationApi.ts: inbox/count/read/socket ticket.
- Search history is per-account; selected artist is separate from free text.
- Server-side report/user filters and total counts documented in
  [server pagination](../server-filtered-pagination.md).

## Live and failure semantics
Leaderboard popup reads GET /exhibitions/{id}/works/{workId}/rating from main API
for session-specific RatingState; cached by viewer/exhibition/work, private no-store.
Existing PUT/DELETE votes trigger server leaderboard refetch (all category variants).

User WebSocket ticket -> API Gateway connect -> invalidation -> protected REST refresh.
Signals include reports.changed, exhibitions.changed and notifications.changed.
Coalesce bursts, preserve loaded rows, cancel stale scopes, recover on reconnect/open.
Do not mark notifications read merely for toasts. Do not trust hidden UI as authorization.
Maintain loading/empty/error/retry and preserve401/403/404/409/422/429/503 meaning.
Health/build/push success does not prove contracts are deployed or user flows work live.
