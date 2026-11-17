# INKFIG-LEADERBOARD-TOOLBAR-001

Owner/integration: a7mad.ishaq; agent /root a7mad-lb-toolbar-2026-11-17.
Independent fix/leaderboard-toolbar fromf594885. Status: implemented/tested.
Objective: leaderboard toolbar ONLY Back Exhibition and gold Leaderboard;
full exhibition gallery toolbar unchanged. Preserve filtering/pages/popups/permissions.
Scope: shared toolbar conditional/test/current memory/log. No migration required.
No API/backend/auth/dependency changes. Public issue overlap checked; issue-writing
unavailable. Prior toolbar task implemented; its pipeline status rechecked separately.
Next: implement, npm test/build, review/fetch/integrate and authorized main push/CI.
Implementation: extra toolbar children gated out only for existing backToGallery
leaderboard context. Full gallery/admin order preserved.
Checks:121 Node +404 Vitest passed; production build completing. No live/device check.
Prior workflow44098410908 failed Cloudflare publishing (tests/build passed), so its
source publication is not proof of live deployment. New workflow tracked separately.
