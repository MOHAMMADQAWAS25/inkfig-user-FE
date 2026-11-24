# INKFIG-ARTWORK-FRAME-001

2026-11-24. Integration owner: user of this session; agent /root.
Branch fix/consistent-artwork-viewer from b56d5b0, after all three clean repos pulled.
No authenticated issue-writing tool; public issue list empty, no issue URL claimed.
Earlier artwork-control/popup tasks complete; preserve their history/ratings/actions.

Approved: consistent responsive opened-card box; desktop image/details side by side
for every aspect ratio; no unnecessary shrinking/upscaling/cropping; centered contain
with balanced blank space, especially above/below wide images. Compact clickable
multi-exhibition tags and rating summaries; original-size image viewer with return
to the same card. Long metadata scrolls inside rather than enlarging the desktop box.
Phone stacks with stable media frame; both languages/themes, permissions and browser
Back, related masonry, notification isolation and existing controls retained.

Scope: page/shared-modal media/layout, compact exhibition badges, original viewer,
translations, focused tests and relevant memory/log. No API/auth/schema/dependency
changes. No migration required. No manual deploy/migration or production writes.
Standing verified main push triggers existing frontend CI/Cloudflare deployment.
Status: implemented and verified. Desktop page/shared popups use the same responsive
height contract and fixed column split. Mobile image/details heights are captured
until width changes. Media preserves intrinsic size or downscales only enough to fit.
Compact deduplicated event tags keep each link/year/rating. Original viewer has
actual pixels/Fit, native modal focus and nested scroll locking, same-URL Back/Forward.
Source areas: ArtworkPage/Media, ArtworkDetailModal/ArtworkMedia, WorkExhibitionBadge,
new ArtworkImageExpand/artworkViewer.css, localization, focused tests and memory/log.
No backend/API/auth/schema/dependency changes. No migration required.
Checks:125 Node/source +422 Vitest/39 files, strict TS/Vite/SEO build/diff passed.
Old stack/free-height assertions were updated to the approved fixed-frame contract;
three old matchMedia mocks gained browser-standard event-listener methods because
shared media now uses the existing responsive hook. No failed assertions bypassed.
Headless Edge/inert data:13 viewport/image cases across1440/1180/820/768/390 widths,
English/light and Arabic/dark/light. Centered exact-fit scaling,200x300 original kept
200x300, same box height across shapes and20-tag/long-description scroll, no horizontal
overflow; native original actual3840x2160/Fit/close, nested browser Back preserved
parent then gallery DOM. Phone120px height changes left image/card sizes unchanged.
No browser exceptions; screenshots reviewed; browser/server closed. Not physical
iOS/Safari or production mutation certification. Existing bundle/jsdom notices remain.
Commit subject: Standardize artwork frames and add original image viewer.
Next: publish focused source commit after upstream check; inspect automatic deployment,
report exact hash/status in handoff, then owner visual review. Revert focused source
commit for rollback while preserving logs/later work; previousb56d5b0 fixes retained.
