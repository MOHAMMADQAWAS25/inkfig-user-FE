# Frontend user flows
Updated: 2026-11-15. [Screens](SCREENS.md), [API](API_OVERVIEW.md).

## First visit and account entry
- Root falls back to English home; anonymous users browse public art/exhibitions.
- Signup -> pending email-code page -> verification -> login; all required-field and
  resend/expiry/attempt/hour limits remain backend-owned.
- Login sets session metadata from user API cookies; shared refresh handles eligible401.
- Forgot password -> request/code/reset; settings also keeps current-password path.
- First login may offer optional backup email; settings handles profile/avatar/remove/status.

## Discovery
- Home filters/categories/cursor; text uses backend semantic rank.
- Typing @ opens account suggestions; selection scopes artwork search. Selected account
  alone returns that account's works; unselected plain text is not a trusted account ID.
- Find users sidebar supports live debounced name search without @ and paginated results.
- Open card -> dedicated artwork route/related masonry. Phone keeps eligible background
  route inert and restores previous scroll on Back; direct links remain standalone.
- Consistent frames use restored portrait-height fitting/shrink-only landscapes;
  remaining gaps retain decorative blur. Forced side-gap enlargement was undone.
  Transparent Back stays inside the image corner, no separate row above loaded feed.
- Wide-image frames shorten around image/details; portraits retain their baseline.
  Long details stay scrollable; phone wide media shortens without toolbar resizing.
  Home-sized search/profile and shared gutters use more available page width.
- Full-size icon shows the complete image fitted to screen, no toolbar/size toggle.
  Outside/close/Escape/Back animate dismissal while retaining the card/gallery.
- Artwork page and exhibition popup show search/profile access. Details scroll
  internally then chain to the surrounding scroll area rather than trapping input.
- Likes/saves/follow/edit/report/moderator delete update relevant caches with rollback on failure.

## Upload and profile
- Select file/type/title/optional links; type loading/error/empty are separate states.
- Image decode validates width>=200 AND height>=300 before backend draft/storage request.
- Successful publish returns home or submits to exhibition; membership retry must not republish.
- Profile Posts/Saved/Likes share card behavior; public counters/follower dialogs are separate.
- Profile artwork menu can assign an owned published work to an eligible exhibition.
- Video preview is not video publication; art type labels do not change supported MIME types.

## Exhibitions
- Current/Upcoming/Past listing; detail banner/schedule/countdown and authorized action bar.
- Before start, public works remain hidden; participation also requires backend-open window.
- My submissions show status/rejection/withdrawal state and backend-filtered pages.
- Review managers use same-page preview, review reasons, blocks and approved-withdrawal decisions.
- Approved public gallery may open exhibition-specific popup with eligibility-gated rating controls.
- Gallery/leaderboard/submission previews push scoped same-page history; Back closes
  the artwork, another Back follows normal navigation, and Forward restores it.
  Profile links replace the preview entry so they do not race a second Back action.
- Rating summaries/cache scope remain per event/work; leaderboard filters category before page.
- No-vote, closed, blocked, own/organizer and unauthorized states retain explanatory UI.

## Administration and live updates
- users.read -> server-filtered users; reports.manage -> server-filtered report queue/popup.
- Actor/reporter/target IDs and restrictions must not be confused.
- Socket-ticket REST -> WebSocket -> invalidation -> protected REST, with reconnect fallback.
- Notification panel marks read on open; toast queue shows at most five latest, one-minute
  lifetime under existing implementation; save actions do not notify.
- Dedicated notifications route is still placeholder, not equivalent to the panel.

## Failure/recovery
Keep loading/empty/error/retry distinct; cancel stale query/route/viewer responses.
401 refresh differs from403 permission,409 conflict,422 validation,429 limit,503 provider.
No prototype/fixture is live integration. Search Console and physical-device gaps remain
explicit in PROJECT_STATE; never claim universal deployment correctness from a build.
