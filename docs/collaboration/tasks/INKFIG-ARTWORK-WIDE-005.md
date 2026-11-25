# INKFIG-ARTWORK-WIDE-005

2026-11-25. Integration owner: session user; agent /root.
fix/responsive-wide-artwork from031dfce; all three clean/pulled main ff-only.
No authenticated issue writer/issue URL claimed. Prior sizing rollback complete.

Approved: shorten wide-image cards to reduce vertical blank space, retain tall
card height/two-column details; home-sized search/profile and tighter aligned gutters.
Implemented shared media marks only landscape images, measures image width and
details child layout offsets (not opening-animation transforms), bounds desktop
height420–680px and existing viewport maximum. Metadata stays scrollable. Phone
wide-media height follows image width/aspect with small padding; stable portrait/
phone pixel limits retained. Overrides clean up on source change/unmount.
Header uses home52px search/34px avatar desktop; mobile32px avatar retained.
Shared20px desktop gutter aligns header/artwork/recommendations; less empty outer
space and matched vertical rhythm. Popup header/backdrop bounds adjusted together.

Scope: ArtworkPageMedia, scoped page/viewer CSS, focused sizing tests, memory/log.
No API/backend/auth/schema/dependency changes. No migration required.
Preserve transparent Back, prior scale-up rollback, fit-only popup, ratings/history,
partner My Submissions styling and ordinary home-feed geometry.

Checks:558 total (125 source +433 Vitest/40 files), strict TS/Vite/SEO/diff passed;
targeted21 media tests/build rerun after border allowance correction. New tests
exercise short/normal/long metadata bounds and cleanup on portrait navigation.
Native Edge actual-component/inert fixtures13 viewport/image/theme/language cases
passed centered fitting/no overflow, two columns, long metadata, nested Back and
phone height-only stability. Additional1440/1920/390 checks: wide820->576/545px,
portrait820px unchanged; phone wide777.6 vs portrait972.6px. Home markup/style
reference measured search52/avatar34 exactly matching artwork header desktop.
Short standard details have no accidental2px scrollbar after border allowance.
Screenshots reviewed; browser/server closed. No physical-device/live mutation claim.
Existing non-blocking bundle/jsdom notices remain.

Publication subject: Adapt wide artwork height and align discovery header spacing.
Fetch/rebase unpublished branch, push, standing-authorized ff main merge/push.
Existing frontend main tests/build/Cloudflare/health only; no manual release/data write.
Actual hash/conflicts/push/deployment reported after execution. Revert focused commit
for rollback while retaining append-only log history and later/partner work.
