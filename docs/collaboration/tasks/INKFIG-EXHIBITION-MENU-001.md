# INKFIG-EXHIBITION-MENU-001

Owner/integration owner: a7mad.ishaq; agent /root a7mad-menu-2026-11-17.
Status: implemented and verified; publication next. Independent fix/exhibition-admin-menu from aec3933.
Issue-writing unavailable; public issues checked for overlap; prior task complete.
Objective: admin/system-admin edit/delete in trailing toolbar options dropdown;
other toolbar links, supervisor edit rights and delete confirmation unchanged.
Acceptance: opposite end in LTR/RTL; close outside/Escape/selection; keyboard support;
no action duplication or permission expansion. Frontend toolbar/CSS/tests/memory/log.
No migration required; no backend/API/schema/auth changes.
Implementation: menu gated by existing onDelete callback from admin/system-admin;
supervisor inline edit retained. Logical trailing alignment, translated accessible
label, initial focus/arrow/Home/End, Escape restore/outside/tab/selection dismissal.
Focus stable trigger before delete opens to preserve confirmation cancellation restore.
Checks: full121 Node +402 Vitest passed; build passed. Added menu regression afterward,
targeted41 exhibition tests passed (including new test). No active public issues.
Next: review/fetch/integrate, authorized main push triggers existing frontend deploy.
No browser/device visual certification; bridges unavailable in prior tasks.
