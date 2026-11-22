# INKFIG-LEADERBOARD-VOTE-001

Human/integration owner a7mad.ishaq; agent /root a7mad-leaderboard-vote-2026-11-22.
Branch feature/leaderboard-popup-rating in independent frontend/backend checkouts.
Objective: rate from leaderboard artwork popup using existing eligibility and mutations.
Acceptance: load viewer-specific rating safely; submit/change/remove votes; refresh
rankings; preserve closed/owner/organizer/blocked restrictions and page filters.
Scope: rating read endpoint/contracts/tests; popup/leaderboard/cache/tests; memory/log.
GET /exhibitions/{exhibition_id}/works/{work_id}/rating returns existing RatingState.
No migration required. Backend deploy first, then frontend. Integration owner above.
Issue URL unavailable (no authenticated issue writer). Public frontend issues empty.
No known active overlapping task; previous popup fit completed.
Status: frontend complete: leaderboard supplies exhibition/voting context, popup
reads viewer eligibility with loading/error/retry, existing rating form handles writes.
Successful mutations update viewer cache and invalidate server leaderboard ordering.
Checks:121 Node +407 Vitest passed; strict TS/Vite/SEO build and diff checks passed.
Updated source assertion for new loading guard; initial source assertion failed before
that update. Added integration tests for preselected vote/update/refetch and read errors.
Backend15f56a3 workflow45029353802 succeeded (pytest/mypy/SAM/deploy/health/backfill).
Frontend87e3f8f5c6d7a7c90c305de0622cf374087e33ce pushed main without conflicts;
workflow45029562134 succeeded (tests/build/Cloudflare deploy/production verification).
Backend deployed first. Local backend Python absent; CI verification passed.
Read-only live anonymous rating GET returned200/private no-store/signed_out.
No production votes changed. Next: owner authenticated interaction review;
implementation complete. Revert focused source commits for rollback.
Live interaction not tested; browser bridge unavailable earlier in session.
Standing verified main publication authorized; no manual deployment/data writes.
