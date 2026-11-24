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
- My Submissions popup has scoped16px detail spacing, compact status/reason sections,
  and a theme-colored divider below existing Related Links; review screens unchanged.
- Exhibition listing Create button uses centered inline-flex icon/text, consistent
  gap/padding/rounded corners; existing role guard and theme colors retained.
- Reports Type column centers its header and vertically stacked icon/label without
  changing table widths; responsive horizontal table scrolling remains unchanged.
- Reports Status column centers its header and badges with middle row alignment;
  widths, badge design/colors and other columns remain unchanged.
- Inline exhibition create/edit uses reference-style banner preview/change-image left,
  name/description5000 counter/date-time pairs right, Save/Cancel below; mobile stacks.
- Desktop editor shares grid rows: preview name-input top to final participation
  input bottom; banner/date hints align below. No fixed preview height on desktop.
- Exhibition toolbar: Back, gold Leaderboard, authorized Review, My submissions,
  Participate; admin options remain trailing. Supervisor edit retained separately.
- Leaderboard toolbar is limited to Back Exhibition and gold Leaderboard only.
- Leaderboard artwork popup uses exhibition details/voting controls. Viewer rating
  and eligibility load on open; successful submit/change/remove refetches rankings.
- Leaderboard back arrow: Exhibition -> current gallery; gallery back arrow:
  Exhibitions -> list. Arabic uses المعرض / المعارض respectively.
- Admin/system-admin exhibition toolbar places Edit/Delete inside trailing options;
  supervisor edit remains available; original deletion confirmation retained.
- Exhibition gallery popup: artwork only physically left; organized full details,
  actions/voting/share on right with independent desktop scroll. Mobile stacks;
  origin zoom retained and leaderboard presentation unchanged.
- Opened artwork page/popups use consistent responsive frame dimensions, centered
  height-fitted portraits/shrink-only landscapes, and scrollable details.
  Desktop/tablet wide images retain side-by-side details; phone regions stack and
  freeze pixel sizing until width changes. This supersedes image-dependent frames.
- Full-size icon opens a fit-only native image popup with inset close, strong blur,
  outside dismissal and reduced-motion-aware transitions. Back retains the same card.
- Image-color blur is decorative and gap-only; excess image cropping is centered.
  Back is transparent (also on hover) inside the image corner; no separate row.
  Artwork page/exhibition popup retain search/profile header access; details chain scrolling.
- Viewer exhibition memberships are compact clickable name/year tags with small
  per-event rating summaries, supporting multiple/long entries without growing the box.
- Popup right column uses a consistent16px rhythm, grouped exhibition/rating panels,
  aligned44px-minimum action buttons, wrapped text/links and stable scroll gutter.
- Gallery popup media uses larger contain bounds; selected stars replace redundant
  numeric personal score. Description keeps a theme-colored bottom divider even
  without related links; actions omit their extra top divider in that state.
- All artwork viewers show save as an icon-only, unframed44px-wide accessible toggle;
  saved state/labels remain available to assistive technology. Back/report targets
  have wider padding. Card creator/count text uses regular weight without shrinking.
- Exhibition gallery/leaderboard/submission previews use scoped same-URL history:
  browser Back closes the preview before leaving its page; Forward restores it.
  Clickable exhibition-card areas inherit pointer cursors; rating/profile controls retained.
- Notification/find-user panels portal outside page containers so artwork hover
  rules cannot affect their backdrop; the blurred background stays inactive.
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
