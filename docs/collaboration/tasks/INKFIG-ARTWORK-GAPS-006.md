# INKFIG-ARTWORK-GAPS-006

2026-11-25. Integration owner: session user; agent /root.
fix/four-side-image-gaps from042a61d; all three clean and main pulled ff-only.
No authenticated issue writer/issue URL claimed. Previous wide-frame implementation
pushed042a61d but workflow45559637005 blocked before starting by GitHub billing lock.

Approved: enlarge ONLY images with blank space on all four sides, removing side
gaps while preserving proportional scale. Non-qualifying images retain baseline.
Implemented baseline-axis gap check (>2px total each axis) before enlargement;
qualifying images fill width, centered clipping if height exceeds frame. Conditional
max-height override preserves ratio. Eligibility recomputed from baseline on resize,
preventing fit/enlarge oscillation. Original-image expansion and adaptive frame sizes,
header spacing, Back, gap blur, videos and other images unchanged.
No API/backend/auth/data/dependency changes. No migration required.

Scope: ArtworkPageMedia, fitting tests and relevant memory/discovery guide/log.
Verification:125 source +436 Vitest/40 files full run, final25 media tests include
one additional resize-stability case =>562 distinct checks (437 Vitest total).
Strict TS/Vite/SEO and whitespace passed. Cases cover eligible small wide/square,
one-axis/no gaps, tolerance boundary and resize losing eligibility without oscillation.
Headless Edge actual component/inert data:1440 en small-wide qualifies403.75x269.33,
normal wide unchanged403.75x227.25, Arabic tall unchanged102.25x818;390 ar small-wide
qualifies360x240. Centering/no page overflow verified; no browser exceptions.
Helpers closed. No physical-device/live mutation certification; existing notices retained.

Publish subject: Fill image side gaps only when all four sides are blank.
Fetch/rebase unpublished work, push branch, standing-authorized ff main merge/push.
Existing frontend CI only; do not bypass billing lock or run manual deployment.
Exact hash/conflicts/push/deployment outcome reported after execution. Isolated rollback
preserves adaptive-wide work, partner changes and append-only feature-log history.
