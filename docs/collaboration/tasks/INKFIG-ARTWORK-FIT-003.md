# INKFIG-ARTWORK-FIT-003

2026-11-24. Integration owner: session user; agent /root.
Branch fix/artwork-overlay-back from dd31376; all three repos clean/pulled ff-only.
No authenticated issue writer; no issue URL claimed. Prior fit/lightbox work complete.

Approved: Back at reference red mark inside image top-left; remove separate Back
row to lift card/recommendations; scale images with side gaps to fill their section.
Implemented:44px icon-only Back with localized label/focus/contrast, absolute overlay
inside featured card. Loading/error Back retained. Loaded feed moves up56px desktop.
Image scale is at least frame-width fit, preserving prior full-height portrait rule;
center overflow and remove max-height clamp to prevent distortion. Videos unchanged.
Wide images already spanning width retain fitting; vertical gaps still blur.
Complete image remains available in the unchanged screen-fit expanded popup.

Scope: ArtworkPage, ArtworkPageMedia, scoped CSS, relevant tests/memory/log.
No API/backend/auth/schema/dependency changes. No migration required.
Keep prior My Submissions partner styling, history, popup and ordinary home geometry.

Checks:555 full-suite checks (125 source +430 Vitest/40 files), targeted media/page
rerun after final height clamp assertion, strict TS/Vite/SEO build/diff whitespace.
Headless Edge actual components/inert fixtures across13 viewport/theme/language/
image cases verify proportional fit/centering, no horizontal overflow, fixed boxes,
phone toolbar stability, nested popup Back/gallery DOM. Screenshots reviewed.
Native original size is unchanged; visible cropped previews intentionally fill gaps.
No physical-device/live authenticated mutation certification. Existing notices retained.

Publication: "Move artwork Back into image and fill side gaps"; fetch/rebase only
unpublished work, push branch, ff merge/push main under standing authorization.
Main triggers existing frontend tests/build/Cloudflare/health; no manual deployment.
Report exact hash and actual push/merge/conflict/deployment after execution.
Rollback: revert only this focused commit, preserving log history and later work.
