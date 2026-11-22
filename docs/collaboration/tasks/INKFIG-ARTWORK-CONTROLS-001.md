# INKFIG-ARTWORK-CONTROLS-001

Owner/integration decision-maker: user of this session; agent /root, 2026-11-22.
Independent branch fix/artwork-controls-history-and-overlay from8ea0bff.
Issue URL unavailable: no authenticated issue-writing tool; public issue list empty.
Previous popup tasks published/complete; preserve their media/detail/voting changes.

Acceptance: icon-only unframed saves in every artwork viewer; padded Back/report
hover targets; normal-weight card creator/like text without size changes; pointer
across clickable exhibition cards; browser Back closes gallery/leaderboard popup
without leaving the exhibition; notification/find-user layers isolate the background.
Scope: shared artwork viewer/styles, exhibition navigation/card, sidebar portal,
regression tests and relevant memory. No API/schema/auth/dependency changes.
No migration required. Backend authorization/rating rules remain authoritative.
No manual deploy/migration/production mutations authorized; standing verified main
push triggers existing frontend test/build/Cloudflare deployment.
Status: implemented after all three clean repositories pulled and relevant memory read.
Shared modal/page bookmarks are icon-only and unframed, with labels/pressed states.
Back/report padding widened; card creator/likes weight400 with sizes retained.
Exhibition gallery/leaderboard/submission history retains same URL and restores on
Forward; profile links replace the preview entry without a Back/navigation race.
Sidebar panels portal to body, retaining dismiss-only/focus/scroll/closing semantics.
Checks:123 Node/source +414 Vitest/38 files; strict TS/Vite/SEO build/diff passed.
Browser synthetic fixtures1440 English/light,1180 Arabic/dark and390 phone checked
44px unframed saves (including hover), weight400, pointer cursor, backdrop unchanged
on hover, body portal and blocked sidebar; native browser Back retained gallery DOM.
No browser exceptions or production mutations. This is not physical-device certification.
Initial portal-container selectors and obsolete local-state source check updated to
assert the new body portal/history scope; no failed tests bypassed. Existing bundle
size/jsdom notices remain. Prior popup sizing/divider/voting behavior preserved.
Source subject: Refine artwork controls, popup history and slider isolation.
Publication: standing-authorized branch push/fast-forward main, existing frontend
test/build/Cloudflare workflow; exact hash/push/conflicts/deployment in final handoff.
Next: publish after upstream review; owner visual review after deployment.
Rollback: revert focused source commit, preserving log history and later work.
