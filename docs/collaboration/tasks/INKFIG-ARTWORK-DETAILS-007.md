# INKFIG-ARTWORK-DETAILS-007

2026-11-25. Integration owner: session user; agent /root.
fix/artwork-menu-metadata from04855fc; all three clean/pulled main ff-only.
No authenticated issue writer/issue URL claimed. Prior source is published; latest
deployment workflows were blocked before starting by GitHub account billing lock.

Approved: home-style avatar menu/search+avatar hover, light Back hover; hide missing
description, localized relative date below beside report/owner actions, equal
report/edit/delete hover. Preserve current frames/fitting/header dimensions/history.
Implemented ArtworkHeader uses existing SmoothDetails/home classes, identity link,
theme/language/logout. Native details stays through close animation; outside gestures
use existing dismiss-only helper. Search icon/padding focus input. Sidebar panels
also dim/inactivate artwork header. Metadata updated in page and shared modal;
relativeTime/full timestamp title, whitespace descriptions omitted, management row
contains report/moderator/owner controls and date. Guards/callback/close timing retained.
Back faint12% highlight; owner controls have report-style stable hover.

Scope: ArtworkHeader/ArtworkPage/ArtworkDetailModal, scoped CSS, focused tests,
memory/discovery guide/handoff/log. No API/backend/auth/schema/dependency changes.
No migration required. Preserve partner styling and existing related/home geometry.

Checks:125 source +439 Vitest/40 files =564; strict TS/Vite/SEO/diff passed.
Final3 header tests rerun after search-icon focus parity change; build repeated.
New assertions cover menu identity/preferences/logout without navigation, search
focus/results/account scope, blank descriptions and relative date/report placement.
Native Edge actual-component/inert fixtures:1440 en other/own,390 ar dark and
native exhibition popup. Menu open/Escape without navigation, avatar/Back hover,
equal edit/delete background, omitted descriptions and date/action row passed;
no browser exceptions. Fixture corrected to focus summary before keyboard Escape,
matching user input (programmatic click alone does not move keyboard focus).
Browser/server closed. Existing bundle/jsdom notices retained. No physical-device,
live mutation or actual sign-out certification; unit delegates to existing signOut.

Publish subject: Unify artwork profile menu and simplify post metadata.
Fetch/rebase unpublished work, branch push, standing-authorized ff main merge/push.
Existing frontend CI only; do not bypass billing failure/manual deploy. Actual hash,
conflicts/publication/deployment checked/reported after execution. Revert this focused
commit for rollback, preserving fitting work, partner changes and append-only logs.
