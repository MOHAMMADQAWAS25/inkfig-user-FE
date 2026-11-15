# InkFig agent instructions
Current: 2026-11-15. This file is policy, not task history.

## Purpose and map
InkFig is a Hebron University art-community graduation project.
This repo is the React web frontend.
See [all three repos and contracts](docs/collaboration/RELATED_REPOS.md).
[Architecture](docs/ARCHITECTURE.md) and source contracts are authoritative for implementation.

## Start / recover
Read docs/agent/PROJECT_STATE.md and the active docs/collaboration/tasks/<id>.md.
Read relevant DECISIONS, SCREENS, API_OVERVIEW, DOMAIN_MODEL and USER_FLOWS.
Inspect Git status/history and current issues/claims; fetch and synchronize safely.
Use relevant feature-log entries for historical evidence; do not repeatedly load its full history.
The owner's 2026-11-15 bounded-memory instructions supersede the earlier full-log-read rule.
On a known compaction report last confirmed state/next action; do not invent detection.
Details: [workflow](docs/collaboration/WORKFLOW.md).

## Architecture / code
React 19 + strict TypeScript + Vite, React Router, Lucide React, TanStack Query.
Reuse AuthContext, api/httpClient, permissions, i18n and shared CSS.
English default; Arabic RTL/English LTR and both themes supported.
Use InkFig olive/cream/fig tokens, not obsolete orange/other-project rules.
Do not add Tailwind, MUI, Bootstrap, styled-components, Redux or another state/UI library
without approval. Preserve existing libraries already installed and reuse feature components.
Backend authorization is authoritative; a hidden UI control is not security.
Inspect actual source before changing a permission, schema, endpoint or transition.
No runtime changes belong to documentation setup.

## Collaboration / Git
Three humans/agents require independent checkouts. Never manipulate another checkout.
Use GitHub Issues plus per-task handoffs; identify the integration owner before shared changes.
Claims are not locks; coordinate overlapping auth/schema/routes/tokens/config before editing.
Standing owner policy permits direct-main verified routine commits/pushes, not new PR gates.
Preserve staged/unstaged/untracked work; stage only explicit task files.
Fetch before push; rebase only unpublished commits; no reset --hard, clean or force-push.
Resolve conflicts by intent, rerun affected checks; no published-history rewriting.

## Verification / operations
Run npm test and npm run build; threads/maxWorkers overrides may help local worker startup.
For SAM/config changes also validate/build as documented; check docs links/diff for docs-only work.
Never weaken assertions. Compare unchanged baseline before calling a failure pre-existing.
State implementation, tests, push, deployment and live verification separately.
Main pushes normally auto-deploy; backend workflows run migrations and main media backfill.
Manual deploy/migration, destructive work, production writes and public releases need explicit approval.
Do not read/copy secrets into output or docs; never commit .env, tokens or private records.
Protect existing local config/untracked files; do not assume they are disposable.
The setup's docs-only [skip ci] exception avoids production operations; not for hiding code failures.

## Finish
Keep six memory files concise/current (target <=150 lines); checkpoint the active task.
Append AGENT_FEATURE_LOG.md for actual changes only, using Request/Changes/Repositories/Files/
API/Database/Permissions and scope/Frontend/Verification/Deployment/Git/Notes sections.
Never alter prior log history. No migration means explicitly "No migration required".
Publish checkpoints rather than relying on private chats, stashes or unsaved memory.
