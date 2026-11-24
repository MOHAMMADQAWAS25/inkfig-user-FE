# INKFIG-ARTWORK-FIT-002

2026-11-24. Owner/integration decision-maker: session user; agent /root.
Branch fix/artwork-fit-lightbox from fca8273; all three clean repos pulled ff-only.
No authenticated issue writer; no issue URL claimed. Prior frame task complete.

Approved: enlarge portraits to remove vertical gaps, preserve wide-image fitting;
color/blur only unused space; replace original-size/Fit toolbar with screen-fit
popup, inset close, strong background blur, smooth open/close/outside dismissal;
fix hovered-card scrolling and retain search/profile while viewing artwork.

Implemented: height-fitted centered portrait, with side clipping only where its
aspect ratio exceeds the column; complete image remains available in expansion.
Landscape/square fitting unchanged. Measure untransformed client dimensions, not
temporary origin-animation bounds. Decorative background only if actual gaps.
Native fit-only popup retains same-URL Back/Forward, focus, nested locks, image
protection, failure state and reduced motion; retains closing DOM for180ms.
Details allow scroll chaining. Search/profile header in page/exhibition dialog;
existing home keyword and selected-artist query contracts reused, no API changes.

Files: ArtworkPageMedia, ArtworkImageExpand, new ArtworkHeader, ArtworkPage,
ExhibitionArtworkPopup, scoped CSS, focused media/header/lightbox tests, memory/log.
No backend/auth/schema/dependency changes. No migration required.

Verification:125 source checks +430 Vitest/40 files, strict TS/Vite/SEO build and
diff whitespace. Existing suite428 plus new header2 verified separately locally;
CI runs all together. Header tests cover keyword results/profile and @ account scope.
Native Edge/inert fixture13 viewport/theme/language/image cases cover stable frames,
portrait height fitting, unchanged landscapes, balanced gaps, no page overflow,
long metadata, nested Back/gallery DOM and phone height-only changes.
Extra native wheel test confirms page scrolling at details end; fit-only popup,
18px backdrop blur/80% dim, outside dismissal and header visibility checked.
Screenshots reviewed; browser/server closed. No physical-device/live mutation claim.
Initial tests exposed incomplete session fixture and a wrong exact-fit gap expectation;
corrected safe name fallback and expectation. Browser caught transformed-bound
measurement during origin animation; fixed using clientWidth/clientHeight.

Publish: focused commit "Refine portrait fitting and screen-fit artwork popup".
Fetch/rebase unpublished branch, push branch, fast-forward merge/push main under
standing owner authorization. Existing CI auto-tests/builds/deploys Cloudflare;
no manual deploy/production mutation. Exact hash/deployment reported after execution.
Rollback: revert this focused commit, preserve logs and reconcile later work.
Upstream6b7e2b4 includes completed6808da2 My Submissions spacing/divider. Rebase
conflicts were limited to feature-log append and current objective: retained both
log entries verbatim, current task objective plus completed partner handoff.
No source conflicts; partner marker/scoped stylesheet untouched. Reverify combined tree.
Combined-tree verification completed:125 source +430 Vitest/40 files in one full
run, strict TS/Vite/SEO build and diff whitespace passed. Ready for publication.
