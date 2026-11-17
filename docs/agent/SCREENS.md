# Current frontend screen inventory
Updated: 2026-11-15. Routes: [AppRouter](../../src/app/AppRouter.tsx).
All language-prefixed routes use en/ar; English is the fallback.

| Route / surface | Source and current status |
| --- | --- |
| /:language | HomePage: public masonry, categories, search/history, account mentions |
| /:language/artwork/:workId | ArtworkPage: measured featured detail + related masonry, natural media, actions |
| /:language/login | LoginPage: password visibility, session/error and reset entry |
| /:language/signup | SignupPage: required fields, university email/phone rules, avatar preview |
| /:language/verify-email | VerifyEmailPage: code, expiry, resend/cooldown/hour block |
| /:language/reset-password | PasswordResetPage: request -> verify -> new password |
| /:language/upload | UploadWorkPage: type loading/retry, file/links, dimension preflight, exhibition context |
| /:language/profile | ProfilePage: own Posts/Saved/Likes; editing and exhibition assignment |
| /:language/profile/:userId | Public profile: works/follow/counters/follower lists |
| /:language/settings | SettingsPage: profile/avatar/remove, password/recovery, backup email/account status |
| /:language/exhibition | ExhibitionsPage: Current/Upcoming/Past groups and pagination |
| /:language/exhibition/:exhibitionId | Details/banner/countdown/actions + approved gallery after start |
| /:language/exhibition/:exhibitionId/submissions | Personal filtered records, reasons, withdrawal/request |
| /:language/exhibition/:exhibitionId/review | Manager filtered records and decisions/blocks |
| /:language/exhibition/:exhibitionId/leaderboard | Public counted-vote rankings/category filter/pages |
| /:language/admin/users | Permission-gated directory, role/activity/query and mutations |
| /:language/admin/reports | Permission-gated queue, filtered counts/popup/actions/reporter restriction |
| /:language/notifications | FeaturePlaceholderPage, NOT a finished standalone notification page |
| Sidebar Find users | Implemented live/debounced name search, pagination, profile navigation |
| Notification panel | Implemented inbox/count/read-on-open, WebSocket recovery and toasts |
| Exhibition artwork popup | Existing local popup with image/details/rating controls; not profile redirect |

## Important shared states
- Exhibition gallery popup: artwork only physically left; organized full details,
  actions/voting/share on right with independent desktop scroll. Mobile stacks;
  origin zoom retained and leaderboard presentation unchanged.
- Gallery popup media uses larger contain bounds; selected stars replace redundant
  numeric personal score, and absent links omit their adjacent divider.
- Leaderboard uses a centered bounded-width panel with internal scrolling and
  pagination; toolbar/title/filter stay stationary, category changes reset list scroll.
- Exhibition artwork cards omit description/date/details CTA and redundant personal
  numeric score; image/title still open the popup, which retains full details.
- Anonymous read-only/public views versus authenticated actions; backend enforces real access.
- Light/dark, RTL/LTR, reduced motion, keyboard focus and mobile navigation must be retained.
- Upload type loading/error/empty/retry distinct; videos remain preview-only publishing.
- Media unavailable/loading; legacy missing dimensions detected from actual image.
- Async queries isolate viewer/filter/route scope and discard stale responses.
- Detail route on phone can preserve inert background/scroll; direct links still work.
- Badges, rating states, notification counters and profile collections are separate caches.
- Current responsive discovery design: [guide](../artwork-discovery-layout.md).
- No approved UI for generated tags/personalized preference setup yet.
- Home scroll performance, physical Safari/iOS and live Google ranking remain unverified,
  not implied by prior synthetic-layout tests or successful compilation.
