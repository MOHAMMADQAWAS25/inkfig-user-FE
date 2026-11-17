# INKFIG-EXHIBITION-EXPAND-001

Human/integration owner: a7mad.ishaq. Agent: /root, a7mad-expand-2026-11-17.
Status: implemented; final verification running. Branch feature/exhibition-expanded-card; independent checkout
agent-exhibition-expanded-card from92cd10d. No open public issues; authenticated
issue-writing unavailable. Prior tasks complete; unpublished overlaps unknown.
Objective: gallery popup resembles expanded card with contained image, full details,
existing authorized actions/voting and origin-based zoom/reduced-motion fallback.
Scope: card/gallery/popup, optional shared-modal presentation, scoped CSS/tests/memory.
Preserve leaderboard popup and home/profile pages, scroll/pages, native dialog focus,
Escape/outside dismissal and backend permissions. No migration required/API change.
Approval: explicit implementation and standing verified routine main push.
Implementation: optional DOMRect flows card->gallery state->popup->shared modal;
WAAPI open/reverse close with reduced-motion/unavailable fallback and cancellation.
Gallery-only CSS matches card surfaces/border/radius/category/media split; mobile
stacks, full description/date/links retained, existing Like/Save/Report/voting intact.
Copy/share reuses artwork-page URL behavior; existing popup exposes no owner
edit/delete callbacks, so no new destructive flow added. Leaderboard variant unchanged.
Checks: final121 Node +402 Vitest passed; strict production build passed. Added
animation test and updated scoped footer assertion. Browser/device checks not performed.
Next: finish tests/build, review diff, fetch/integrate and publish; CI auto-deploys.
