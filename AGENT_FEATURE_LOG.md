# Agent Feature Log

This file is the repository's running implementation history for agent-assisted work.

## Working rule

- Read this file before making any change in this repository.
- After completing work, add a dated entry describing what changed and how it was verified.
- State whether a database migration is required and name it when applicable.
- Keep entries concise, factual, and limited to this repository.

## Entries

### 2026-09-28 - Establish the React and Vite frontend foundation

- Added a strict TypeScript React application built with Vite, React Router page routing, and Lucide React icons.
- Added shared API request handling with separate user/main API base URLs, an authentication context, protected routes, permission helpers, and Arabic/English localization with automatic RTL/LTR document direction.
- Added a responsive application shell, mobile drawer, login foundation, dashboard placeholder, and shared Shadow-inspired CSS tokens for dark surfaces, subtle borders, orange actions, compact controls, and restrained status colors.
- Documented the frontend folder boundaries and prohibited unapproved UI/state libraries.
- Verification: 2 Node tests passed and the TypeScript/Vite production build passed. Automated checks cover responsive and RTL CSS markers; live browser visual inspection was unavailable in this session and remains required when feature UI is implemented.
- Migration required: No.

### 2026-09-28 - Document the InkFig product vision

- Added `README.md` with the project's university context, art-community purpose, planned discovery and interaction features, AI-assisted image search, teacher event moderation workflow, and access-control direction.
- Clarified that this repository provides the web experience for InkFig's authorized users.
- Verification: reviewed the rendered Markdown structure and ran Git's whitespace validation.
- Migration required: No.

### 2026-09-27 - Initialize agent feature log

- Added this repository-level feature log and established the read-before-work and update-after-work convention.
- Verification: confirmed the file exists in the repository.
- Migration required: No.

## 2026-09-28 - Standardize agent feature log requirements

### Request

Require every repository to use a root `AGENT_FEATURE_LOG.md`, read it fully before each ticket, preserve its history, and append every completed ticket using the prescribed structured sections.

### Changes

- Renamed the existing root feature log to the exact uppercase filename while preserving all previous entries unchanged.
- Adopted the required entry format for this and all future tickets.
- Intentionally left application behavior, authorization, APIs, database configuration, and dependencies unchanged.

### Repositories

- `delivery-main-system`: standardized the root feature-log filename and adopted the structured ticket record.
- `delivery-user-system`: standardized the root feature-log filename and adopted the structured ticket record.
- `delivery-user-FE`: standardized the root feature-log filename and adopted the structured ticket record.

### Files

- `AGENT_FEATURE_LOG.md`: renamed from `agent_feature_log.md` and appended this structured entry.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No permissions or role access changed.
- No organization or domain scope changed.
- Backend authorization behavior is unchanged.

### Frontend

- No routes, navigation, forms, tables, dialogs, filters, responsive behavior, localization, loading states, empty states, or error handling changed.

### Verification

- `[passed] git status --short` - confirmed the case-only rename is tracked.
- `[passed] git diff --check`
- `[not run] application tests and builds` - documentation-only filename and log-format change.

### Deployment

No special deployment steps.

### Git

- Branch: `main`
- Commit: `2e58cc5`
- Push: `successful`

### Notes

Historical entries retain their original format; the required structured format applies from this entry onward.

## 2026-09-29 - Align local folders with renamed repositories

### Request

Rename the local repository folders to match the new InkFig GitHub repository names.

### Changes

- Renamed the local folder from `delivery-user-FE` to `inkfig-user-FE`.
- Updated `origin` from the legacy redirected repository URL to the canonical `inkfig-user-FE` GitHub URL.
- Removed only the empty old folder remnant left by the Windows move operation.
- Intentionally left application code, configuration values, dependencies, and runtime behavior unchanged.

### Repositories

- `inkfig-main-system`: renamed its local folder and updated its canonical `origin` URL.
- `inkfig-user-system`: renamed its local folder and updated its canonical `origin` URL.
- `inkfig-user-FE`: renamed its local folder and updated its canonical `origin` URL.

### Files

- `AGENT_FEATURE_LOG.md`: recorded the local folder and remote URL alignment.
- No application files changed.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No permissions, roles, authorization checks, or access scopes changed.
- Backend authorization behavior is unchanged.

### Frontend

- No routes, navigation, forms, tables, dialogs, filters, responsive behavior, localization, loading states, empty states, or error handling changed.

### Verification

- `[passed] git status --short --branch` - repository remained clean after the move.
- `[passed] git remote get-url origin` - canonical InkFig remote URL is configured.
- `[passed] git ls-remote --exit-code origin refs/heads/main` - renamed GitHub repository is reachable.
- `[passed] workspace directory inspection` - only the three new repository folder names remain.
- `[not run] application tests and builds` - no application files changed.

### Deployment

- Update local scripts or external deployment jobs that still reference the old `delivery-user-FE` folder or repository URL.
- No migrations must run before deployment.

### Git

- Branch: `main`
- Commit: `3e8bfdd`
- Push: `successful`

### Notes

The old GitHub URL redirected successfully, but the canonical URL is now configured directly.
## 2026-09-29 - Deploy the frontend from GitHub Actions

### Request

Automatically test, build, and deploy the frontend to Cloudflare whenever changes are pushed to the `main` branch, alongside the existing backend deployment workflows.

### Changes

- Added a GitHub Actions workflow triggered by pushes to `main` and manual dispatches.
- Added deterministic dependency installation, frontend tests, strict TypeScript/Vite build, Cloudflare Worker deployment, and a production URL health check.
- Built the frontend with the production user and main API base URLs.
- Added Wrangler static-assets configuration for the existing `inkfig-user-fe` Worker.
- Enabled single-page-application fallback so React Router paths resolve to `index.html`.
- Serialized production deployments to prevent overlapping Worker updates.
- Documented the required Cloudflare account ID and scoped API-token secrets.
- Left application routes, UI behavior, authentication state, localization, and backend contracts unchanged.

### Repositories

- `inkfig-user-FE`: added automatic Cloudflare Worker deployment.
- `inkfig-user-system`: already contains its AWS deployment workflow; no changes in this ticket.
- `inkfig-main-system`: already contains its AWS deployment workflow; no changes in this ticket.

### Files

- `.github/workflows/deploy.yml`: tests, builds, deploys, and health-checks the production frontend.
- `wrangler.jsonc`: configures the `inkfig-user-fe` Worker static assets and SPA fallback.
- `README.md`: documents production API URLs and Cloudflare GitHub secrets.
- `AGENT_FEATURE_LOG.md`: recorded this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- The workflow receives read-only repository contents and GitHub deployment-write permission.
- Cloudflare access is limited by the scope of `CLOUDFLARE_API_TOKEN`; it should grant only the Workers edit access required for the InkFig account.
- No application permissions, roles, or backend authorization changed.

### Frontend

- Builds with `VITE_USER_API_BASE_URL=https://user-api.inkfig-hu.com/api/v1`.
- Builds with `VITE_MAIN_API_BASE_URL=https://main-api.inkfig-hu.com/api/v1`.
- Deploys `dist/` to the existing `inkfig-user-fe` Worker on every push to `main`.
- Preserves all existing routes, navigation, responsive behavior, localization, loading states, empty states, and error handling.

### Verification

- `[passed] npm test` — 2 tests passed.
- `[passed] npm run build` — strict TypeScript and Vite production build succeeded.
- `[passed] Python YAML parse of .github/workflows/deploy.yml`
- `[passed] npx --yes wrangler@4 deploy --dry-run` — 4 static asset files accepted.
- `[passed] git diff --check`
- `[not run] GitHub Actions production deployment` — requires Cloudflare secrets in the GitHub production environment.

### Deployment

- Configure the GitHub `production` environment with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Keep `inkfig-hu.com` associated with the existing `inkfig-user-fe` Worker.
- After setup, every push to `main` deploys the production frontend automatically.
- No migration is required.

### Git

- Branch: `main`
- Commit: `f02331f`
- Push: `successful`

### Notes

The initial workflow run will fail at Cloudflare authentication until both required secrets are configured. Cloudflare Worker static assets and SPA fallback follow the current Wrangler configuration model.
## 2026-09-29 - Review and map the current project foundation

### Request

Read the InkFig repositories and establish an accurate understanding of the product, service boundaries, implementation status, and deployment model before future feature work.

### Changes

- Reviewed the product documentation, architecture rules, routing, providers, session scaffold, localization, permission helpers, HTTP client, shared styling, tests, and deployment workflow.
- Confirmed the frontend is a React 19 and strict TypeScript Vite application with Arabic-first localized routes, RTL/LTR handling, a responsive shell, and separate user/main API base URLs.
- Confirmed the current login is intentionally inactive and the dashboard is a foundation placeholder; production feature screens and live backend integration are not yet implemented.
- Intentionally left application behavior and configuration unchanged.

### Repositories

- `inkfig-user-FE`: reviewed and documented the current frontend baseline.
- `inkfig-user-system`: reviewed alongside the client to verify identity-service ownership.
- `inkfig-main-system`: reviewed alongside the client to verify business-service ownership.

### Files

- `AGENT_FEATURE_LOG.md`: recorded the project-understanding pass.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

No permissions, role visibility, authorization behavior, or access scopes changed.

### Frontend

No runtime frontend changes.

### Verification

- `[passed] repository source, architecture, configuration, tests, and deployment files reviewed`
- `[passed] git diff --check`
- `[not run] application tests and builds` - documentation-only change.

### Deployment

No deployment changes or special steps.

### Git

- Branch: `main`
- Commit and push: performed after verification.

### Notes

This entry records understanding only; it does not claim that planned product screens or integrations are already implemented.

## 2026-09-30 - Apply the InkFig project logo

### Request

Use the supplied `finalLogo.svg` as the InkFig project's frontend logo.

### Changes

- Added the supplied SVG unchanged as the frontend's canonical InkFig logo asset.
- Replaced the temporary Lucide palette marks on the login page and application sidebar with the InkFig logo.
- Added the InkFig logo as the browser SVG favicon.
- Added responsive sizing for the login and sidebar logo placements.

### Repositories

- `inkfig-user-FE`: added and integrated the project logo.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/assets/inkfig-logo.svg`: canonical copy of the supplied logo.
- `src/features/auth/LoginPage.tsx`: displays the logo on the login card.
- `src/features/layout/AppShell.tsx`: displays the logo in the application sidebar.
- `src/styles.css`: sizes the logo for both placements.
- `index.html`: uses the logo as the browser favicon.
- `tests/foundation.test.mjs`: verifies the branding integrations remain present.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No permissions, authentication behavior, role visibility, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The supplied logo now appears on the login page and in the authenticated sidebar.
- The browser uses the same SVG as its favicon.
- Routes, forms, navigation behavior, localization, RTL/LTR handling, responsive navigation, loading states, empty states, and error handling are unchanged.

### Verification

- `[passed] npm test` - 3 tests passed.
- `[passed] npm run build` - strict TypeScript checks and the Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - the browser automation surface was unavailable; the built output includes the optimized SVG asset.

### Deployment

- Merge the feature branch into `main` to trigger the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `feature/use-project-logo`
- Commit: this ticket's focused commit.
- Push: feature branch pushed to `origin` for pull-request review.

### Notes

The source SVG was treated only as a user-provided visual asset; it contained no project instructions.

## 2026-09-30 - Derive the website theme from the InkFig logo

### Request

Design the website colors and theme around the official InkFig logo palette.

### Changes

- Replaced the unrelated orange and neutral theme tokens with the logo's deep olive, leaf green, light olive, warm cream, and fig burgundy colors.
- Added semantic brand tokens so future screens can reuse the approved palette consistently.
- Updated page, sidebar, topbar, navigation, status, empty-state, form, button, focus, and hover treatments to use the new palette.
- Added restrained olive and fig background glows to the login experience without changing its content or behavior.
- Added source-level checks for the canonical logo-derived theme colors.

### Repositories

- `inkfig-user-FE`: implemented the logo-derived visual theme.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: defines and applies the logo-derived theme.
- `tests/foundation.test.mjs`: verifies the canonical brand colors remain present.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No permissions, authentication behavior, role visibility, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The existing login, navigation shell, dashboard, forms, buttons, badges, and empty states now use the InkFig logo palette.
- Routes, content, localization, RTL/LTR behavior, responsive navigation, authentication state, and error handling are unchanged.

### Verification

- `[passed] npm test` - 3 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - the in-app browser was unavailable in this session.

### Deployment

- Merge the feature branch into `main` to trigger the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `feature/logo-derived-theme`
- Commit: this ticket's focused commit.
- Push: feature branch pushed to `origin` for pull-request review.

### Notes

The palette is derived directly from the canonical SVG values: deep olive `#39431c`, leaf green `#617d2b`, light olives `#a9b65f` and `#c5c970`, warm cream `#eee7bd`, and fig burgundy `#982824`.

## 2026-09-30 - Add the first-visit signup experience

### Request

Give first-time visitors clear login and signup choices and provide a required registration form for Hebron University accounts.

### Changes

- Added a localized welcome screen with sign-in and sign-up choices.
- Added a controlled signup form for email, full name, phone, gender, birth date, password, and password confirmation.
- Added immediate university-email and password-confirmation checks while keeping the backend authoritative.
- Added API loading, duplicate-email, generic-error, and success states.
- Integrated the newly merged canonical InkFig logo into both new public screens while resolving the rebase conflicts without removing the other agent's branding work.
- Intentionally left the existing inactive login submission, authenticated shell, permissions, and dashboard unchanged.

### Repositories

- `inkfig-user-FE`: added public entry/signup routes, form, API contract, localization, styling, and tests.
- `inkfig-user-system`: implements the matching backend API and database migration in its own repository.

### Files

- `src/features/auth/AuthLandingPage.tsx`: presents login/signup choices.
- `src/features/auth/SignupPage.tsx`: implements the complete required signup form and UI states.
- `src/features/auth/registrationApi.ts`: defines and calls the registration API contract.
- `src/app/AppRouter.tsx`: adds welcome/signup routes and sends unknown first visits to welcome.
- `src/features/auth/LoginPage.tsx`: links existing users to signup and preserves canonical branding.
- `src/i18n/resources.ts`: adds Arabic and English registration strings.
- `src/styles.css`: adds responsive form, status, and action styles while preserving logo styles.
- `tests/foundation.test.mjs`: verifies routes, fields, API path, email pattern, and existing branding.

### API

- `POST /api/v1/auth/signup`: sends required profile and credential fields to the user backend and consumes the created profile response; handles `409` as duplicate email and other failures as temporary registration errors.

### Database

- Migration: `20260930_001_create_user_profiles.sql` in `inkfig-user-system`.
- No migration exists in this frontend repository.

### Permissions and scope

- Welcome and signup routes are public to unauthenticated visitors.
- No role or permission is granted by the client.
- Hebron email validation and account creation are revalidated and enforced by the backend.

### Frontend

- Added `/:language/welcome` and `/:language/signup`; existing `/:language/login` now links to signup.
- Added required accessible controls, mobile-safe layout, RTL/LTR support, Arabic/English localization, submit loading state, success panel, and error messages.
- Unknown routes now open `/ar/welcome`; authenticated visitors to public auth screens continue to the dashboard.

### Verification

- `[passed] npm test` - 4 tests passed after rebasing and preserving the project-logo changes.
- `[passed] npm run build` - strict TypeScript and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - automated tests and production build passed; interactive browser inspection remains optional follow-up.
- `[not run] live production registration` - requires backend migration/deployment after merge.

### Deployment

- Deploy `inkfig-user-system` first or together with this frontend so `/api/v1/auth/signup` is available.
- Merge to `main` to trigger the existing Cloudflare frontend workflow.
- No new frontend environment variables or Cloudflare configuration are required.

### Git

- Branch: `feature/user-signup`
- Commit: `51b71f7`
- Push: `successful`

### Notes

The branch was rebased onto the latest `origin/main`; conflicts in login, shared CSS, foundation tests, and the append-only feature log were resolved by preserving the canonical logo, logo-derived theme, and signup behavior.

## 2026-09-30 - Add logo-derived light and dark themes

### Request

Add light and dark themes whose colors are derived from the official InkFig logo.

### Changes

- Added a theme provider that selects the saved preference, falls back to the operating-system color-scheme preference, updates the root document theme, and persists manual changes.
- Added an accessible sun/moon theme toggle to every public authentication screen and the authenticated application header.
- Split the existing logo-derived design tokens into coordinated light and dark palettes using cream, deep olive, leaf green, light olive, and fig burgundy.
- Converted backgrounds, surfaces, navigation states, forms, status panels, errors, focus treatments, and shadows to semantic theme tokens.
- Added source-level regression coverage for both palettes, provider wiring, persistence, OS preference detection, and localized toggle labels.

### Repositories

- `inkfig-user-FE`: added the application theme system and theme-aware styling.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/theme/ThemeProvider.tsx`: owns theme selection, persistence, and document state.
- `src/theme/ThemeToggle.tsx`: provides the accessible localized theme control.
- `src/app/AppProviders.tsx`: installs the theme provider for all routes.
- `src/features/auth/AuthLandingPage.tsx`: exposes the theme toggle on the welcome screen.
- `src/features/auth/LoginPage.tsx`: exposes the theme toggle on login.
- `src/features/auth/SignupPage.tsx`: exposes the theme toggle on signup.
- `src/features/layout/AppShell.tsx`: exposes the theme toggle in the authenticated header.
- `src/i18n/resources.ts`: localizes light/dark theme actions in Arabic and English.
- `src/styles.css`: defines and applies the logo-derived light and dark theme tokens.
- `tests/foundation.test.mjs`: verifies theme integration and canonical colors.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The first visit follows the operating-system light/dark preference unless a saved InkFig preference exists.
- Theme changes persist locally under `inkfig.theme` and apply across public and authenticated routes.
- Both themes use colors derived from the official logo; fig burgundy remains reserved for restrained accents and errors.
- Routes, forms, API behavior, localization direction, navigation, loading states, success states, and error handling are otherwise unchanged.

### Verification

- `[passed] npm test` - 5 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - the in-app browser surface was unavailable in this environment.

### Deployment

- Merge the feature branch into `main` to trigger the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `feature/light-dark-logo-themes`
- Commit: this ticket's focused commit.
- Push: feature branch pushed to `origin` for pull-request review.

### Notes

The theme keeps the existing semantic token architecture so future screens inherit both palettes without page-specific color duplication.

## 2026-09-30 - Use dark authentication cards in the light theme

### Request

Keep the light-theme page background unchanged while making the login and signup forms use the dark-theme form colors.

### Changes

- Changed the light theme's authentication-card background and shadow to match the dark theme.
- Scoped the complete dark surface palette to authentication cards so text, inputs, borders, buttons, success panels, and error messages retain appropriate contrast.
- Applied the shared card treatment to the welcome, login, and signup screens without changing their content or behavior.
- Added a regression test for the dark authentication-card background, text, and input colors.

### Repositories

- `inkfig-user-FE`: adjusted authentication-card styling and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: keeps the light page background and applies dark-theme styling within authentication cards.
- `tests/foundation.test.mjs`: verifies authentication cards remain dark in the light theme.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The light theme retains its warm cream page background.
- Welcome, login, and signup cards now use the same dark form surface and control colors as the dark theme.
- Theme persistence, theme switching, routes, forms, API behavior, localization, RTL/LTR behavior, loading states, success states, and error handling are unchanged.

### Verification

- `[passed] npm test` - 6 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - the in-app browser surface was unavailable in this environment.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The dark palette is scoped to `.auth-card`, so the surrounding light-theme background and non-authenticated page chrome remain light.

## 2026-09-30 - Harmonize light-theme authentication cards

### Request

Make the light-theme login and signup cards compatible with the page background using a creative, attractive color treatment.

### Changes

- Replaced the dark light-theme card with a warm cream-to-pale-olive gradient derived from the InkFig logo.
- Added a restrained deep-olive, leaf-green, and fig-burgundy accent line across the top of each authentication card.
- Added layered olive and fig shadows to separate the card from the cream background without creating a harsh dark block.
- Restored coordinated light-theme text, input, border, button, success, and error colors inside authentication cards.
- Preserved the original dark card palette when dark theme is active.
- Updated regression coverage for the harmonious light card and retained dark-theme override.

### Repositories

- `inkfig-user-FE`: redesigned authentication-card styling and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: defines the refined light authentication-card treatment and dark-theme override.
- `tests/foundation.test.mjs`: verifies both card palettes and the logo-colored accent.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Welcome, login, and signup cards now blend naturally with the light cream background while retaining clear visual hierarchy and readable form controls.
- Dark-theme cards keep their existing dark surface and high-contrast colors.
- Theme persistence, theme switching, routes, forms, API behavior, localization, RTL/LTR behavior, responsive behavior, loading states, success states, and error handling are unchanged.

### Verification

- `[passed] npm test` - 6 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - the in-app browser surface was unavailable in this environment.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

All new visual colors are tints or direct values from the official InkFig olive, cream, and fig palette.

## 2026-09-30 - Require ten-digit signup phone numbers

### Request

Keep the required Hebron email formats and require the signup phone number to contain exactly 10 digits.

### Changes

- Added immediate exact 10-digit phone validation before the signup API request.
- Restricted the phone control to numeric input with matching minimum/maximum lengths and HTML pattern validation.
- Added localized Arabic and English phone hints and validation errors.
- Preserved the existing student/staff email validation, authentication-card styling, themes, responsive layout, and signup workflow.

### Repositories

- `inkfig-user-FE`: mirrors and explains the 10-digit phone contract.
- `inkfig-user-system`: enforces the same rule authoritatively.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/SignupPage.tsx`: validates and constrains the phone input.
- `src/i18n/resources.ts`: localizes phone guidance and validation feedback.
- `tests/foundation.test.mjs`: verifies the exact 10-digit client rule remains present.

### API

- `POST /api/v1/auth/signup`: the existing `phone_number` request field must contain exactly 10 digits; no field names or response fields changed.

### Database

No migration required. Database persistence changes are not needed for this frontend validation update.

### Permissions and scope

- Signup remains public and grants no permission or role.
- The frontend check is convenience only; the user backend revalidates the phone and organization email rules.
- No role visibility or data scope changed.

### Frontend

- The signup phone field now uses numeric input, exactly 10 characters, a 10-digit pattern, localized guidance, and an explicit pre-request error.
- Routes, navigation, themes, RTL/LTR behavior, loading, success, duplicate-email, and general error states are unchanged.

### Verification

- `[passed] npm test` - 6 tests passed.
- `[passed] npm run build` - strict TypeScript and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live production signup` - deployment occurs through the main-branch workflows after push.

### Deployment

- Deploy `inkfig-user-system` first, then deploy this frontend.
- Push to `main` triggers the existing Cloudflare deployment workflow.
- No environment-variable or Cloudflare configuration change is required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

Phone validation confirms format and digit count only; it does not verify ownership of the number.

## 2026-09-30 - Soften the light-theme login card

### Request

Keep the login form rectangle visually consistent with the dark-theme card while adapting it for the light theme through softer color and opacity.

### Changes

- Scoped a dedicated login-card treatment to the login page without changing the welcome or signup cards.
- Gave the light-theme login card a translucent deep-olive gradient based on the dark palette instead of copying the dark colors exactly.
- Added softened olive and fig shadows, a subtle translucent border, a light inset highlight, and backdrop blur.
- Coordinated the card's cream text, muted copy, semi-transparent fields, borders, and button colors for readable contrast.
- Explicitly restored the existing card background and shadow in dark mode so its appearance remains unchanged.
- Added regression coverage for the login-only class, translucent light palette, control background, and dark-theme override.

### Repositories

- inkfig-user-FE: adjusted the light-theme login card and its source-level tests.
- inkfig-user-system: no changes required.
- inkfig-main-system: no changes required.

### Files

- src/features/auth/LoginPage.tsx: identifies the login card for page-specific styling.
- src/styles.css: defines the softened light login card and preserves the dark version.
- tests/foundation.test.mjs: verifies the scoped light and dark card behavior.
- AGENT_FEATURE_LOG.md: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- In light mode, only the login form rectangle now resembles a faded, translucent version of the dark card.
- In dark mode, the login card retains the existing dark-theme treatment.
- Welcome and signup cards, page backgrounds, routes, form behavior, localization, RTL/LTR behavior, responsive behavior, and theme persistence are unchanged.

### Verification

- [passed] npm test - 7 tests passed.
- [passed] npm run build - strict TypeScript checks and Vite production build succeeded.
- [passed] git diff --check
- [failed] initial npm test - the newly written test contained stripped regular-expression escapes; it was replaced with stable exact source checks and then passed.
- [not run] live browser visual inspection - the in-app browser was unavailable in this session.

### Deployment

- Pushing main triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: main
- Commit: this ticket's focused commit.
- Push: pushed directly to origin/main after synchronization.

### Notes

Opacity is applied to background, border, shadow, and input colors rather than the whole card, so text and controls remain crisp and accessible.

## 2026-09-30 - Add signup email verification screen

### Request

After signup, ask the user for the emailed verification code and allow the account to proceed only when the backend accepts it.

### Changes

- Signup now redirects to email verification instead of reporting immediate account creation.
- Added a six-digit verification form with prefilled/editable email, one-time-code autocomplete, loading, success, invalid, expired, and attempt-limit states.
- Added resend behavior with a backend-provided cooldown and replacement-code handling.
- Preserved existing authentication visuals, responsive behavior, themes, and Hebron email/phone validation.

### Repositories

- `inkfig-user-FE`: added the verification route, API client operations, localized screen, styling, and regression coverage.
- `inkfig-user-system`: added the authoritative verification APIs and account activation workflow.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/SignupPage.tsx`: redirects successful signup to verification with response metadata.
- `src/features/auth/VerifyEmailPage.tsx`: implements code verification, resend cooldown, success, and errors.
- `src/features/auth/registrationApi.ts`: adds verification and resend contracts and requests.
- `src/app/AppRouter.tsx`: adds `/:language/verify-email`.
- `src/i18n/resources.ts`: adds Arabic and English verification copy.
- `src/styles.css`: adds compact six-digit code styling.
- `tests/foundation.test.mjs`: verifies the route, endpoints, code constraint, and cooldown.

### API

- `POST /api/v1/auth/signup`: consumes the new pending-verification response fields.
- `POST /api/v1/auth/verify-email`: sends `email` and six-digit `code` and handles success, invalid, expired, and attempt-limit responses.
- `POST /api/v1/auth/resend-verification`: sends `email` and consumes the returned resend cooldown.

### Database

- Migration: `20260930_002_add_email_verification.sql` in `inkfig-user-system`; it must run before this frontend is exposed.

### Permissions and scope

- Verification pages are public and grant no role or permission.
- The frontend mirrors format checks for usability; the user backend authoritatively enforces identity, code, expiry, attempts, and account activation.
- No company, event, artwork, teacher, or administrative scope changed.

### Frontend

- Added localized route `/:language/verify-email` with responsive RTL/LTR layout, theme toggle, loading, error, success, resend-disabled, and cooldown states.
- Email remains editable so refresh/direct navigation can recover without storing it in persistent browser storage.
- Successful verification offers navigation to the existing localized login page.

### Verification

- `[passed] npm test` - 8 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser/API verification` - backend deployment and a real university mailbox are required.

### Deployment

- Deploy `inkfig-user-system` and its migration first, then deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No new frontend environment variables are required; the existing user API base URL is unchanged.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

The email is passed through transient router state and remains editable; it is not written to local storage or placed in the URL.

## 2026-09-30 - Connect login to InkFig-owned authentication

### Request

Stop relying on Supabase Auth and use the InkFig user backend for login, JWT sessions, and logout.

### Changes

- Enabled the existing login form and connected it to the InkFig `/auth/login` endpoint.
- Stores the returned InkFig access token, refresh token, expiry, and user summary in the existing authentication context.
- Added loading, invalid-credential, and unverified-account feedback in Arabic and English.
- Logout now asks the backend to revoke the refresh token and always clears the local session.
- Preserved authentication-card visuals, routing, themes, RTL/LTR behavior, and responsive navigation.

### Repositories

- `inkfig-user-FE`: implements the InkFig login/logout client flow.
- `inkfig-user-system`: owns password hashing, users, JWTs, refresh-token rotation, and revocation.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/authenticationApi.ts`: calls InkFig login and logout endpoints.
- `src/features/auth/LoginPage.tsx`: submits credentials and creates the returned session.
- `src/features/auth/AuthContext.tsx`: revokes the refresh token during logout.
- `src/shared/types.ts`: adds refresh-token and expiry session fields.
- `src/i18n/resources.ts`: adds Arabic and English authentication feedback.
- `tests/foundation.test.mjs`: verifies login/logout backend integration.

### API

- `POST /api/v1/auth/login`: sends `email` and `password` and consumes the InkFig token/user response.
- `POST /api/v1/auth/logout`: sends `refresh_token` for backend revocation.

### Database

- Migration: `20260930_003_move_authentication_to_inkfig.sql` in `inkfig-user-system`; it must run before this frontend is deployed.

### Permissions and scope

- Login and logout are public authentication operations.
- The client does not grant permissions; it stores only permissions returned by the backend.
- Future protected API authorization remains backend-enforced using InkFig JWT validation and database roles/scopes.

### Frontend

- Login now has controlled required email/password fields, submitting state, localized errors, and dashboard navigation after success.
- Logout is resilient: local state is cleared even when remote revocation cannot be reached.
- Existing welcome, signup, verification, theme, responsive, and localization behavior remains unchanged.

### Verification

- `[passed] npm test` - 9 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] production login` - backend migration/deployment must complete first.

### Deployment

- Deploy `inkfig-user-system` and migration 003 first, then deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No new frontend environment variables are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

The current session storage follows the existing local-storage architecture. Moving the refresh token to a backend-set HttpOnly cookie is recommended as a future browser-hardening improvement.

## 2026-09-30 - Keep the InkFig brand name untranslated

### Request

Display the project name exactly as `InkFig` in both Arabic and English modes instead of translating or transliterating it.

### Changes

- Replaced the Arabic transliteration of the standalone application name with the canonical `InkFig` spelling.
- Kept `InkFig` unchanged inside the otherwise translated Arabic welcome phrase.
- Added regression coverage requiring both locale resources to use the exact capitalization and prohibiting the prior Arabic transliteration.

### Repositories

- `inkfig-user-FE`: corrected brand-name localization and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/i18n/resources.ts`: uses the canonical `InkFig` name in both locales.
- `tests/foundation.test.mjs`: verifies the brand remains untranslated in all locale resources.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Arabic and English modes now display the brand as `InkFig` everywhere the shared application-name translation is used.
- Surrounding Arabic and English interface copy remains localized.
- Routes, forms, themes, responsive behavior, RTL/LTR behavior, authentication flows, loading states, and errors are unchanged.

### Verification

- `[passed] npm test` - 10 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The canonical brand spelling is case-sensitive: `InkFig`.

## 2026-09-30 - Preserve InkFig capitalization on authentication pages

### Request

Make the visible brand label on sign-in and sign-up pages display exactly as `InkFig`.

### Changes

- Identified that the shared eyebrow style uppercased the already-correct `InkFig` translation at render time.
- Added a brand-specific class that disables text transformation while retaining the existing eyebrow color and emphasis.
- Applied the class to welcome, login, signup, and email-verification brand labels for consistent authentication branding.
- Extended regression coverage to require the brand class and its case-preserving CSS rule.

### Repositories

- `inkfig-user-FE`: corrected rendered brand capitalization and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/AuthLandingPage.tsx`: preserves canonical brand capitalization.
- `src/features/auth/LoginPage.tsx`: preserves canonical brand capitalization.
- `src/features/auth/SignupPage.tsx`: preserves canonical brand capitalization.
- `src/features/auth/VerifyEmailPage.tsx`: preserves canonical brand capitalization.
- `src/styles.css`: adds the scoped case-preserving brand rule.
- `tests/foundation.test.mjs`: verifies authentication pages and CSS retain `InkFig` casing.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Authentication pages now render `InkFig` exactly, rather than visually transforming it to `INKFIG`.
- Other eyebrow labels may continue using uppercase styling.
- Localization, RTL/LTR behavior, themes, routes, forms, authentication flows, loading states, and errors are unchanged.

### Verification

- `[passed] deployed-bundle inspection` - production localization already contained `InkFig`; deployed CSS revealed the uppercase transformation.
- `[passed] npm test` - 10 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The translation value was correct; the visible capitalization defect came solely from CSS `text-transform: uppercase`.
