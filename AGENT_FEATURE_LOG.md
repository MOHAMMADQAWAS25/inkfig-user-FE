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

## 2026-09-30 - Add the forgot-password recovery flow

### Request

Add a login-page path that sends a verification code, verifies the code, and lets the user reset their password.

### Changes

- Added a localized three-stage recovery page for email, six-digit code, and new-password entry.
- Added a login-page forgot-password link and a public localized route.
- Keeps the opaque reset token only in component memory and validates matching passwords before submission.
- Added loading, success, invalid-code, expired-code, excessive-attempt, delivery-failure, and expired-session states.
- Existing login, signup, verification, dashboard, theme, and navigation behavior was intentionally left unchanged.

### Repositories

- `inkfig-user-FE`: added the password-reset interface and backend client.
- `inkfig-user-system`: provides the password-reset API and database migration; its changes are recorded in that repository.

### Files

- `src/features/auth/PasswordResetPage.tsx`: implements the staged responsive recovery experience.
- `src/features/auth/passwordResetApi.ts`: calls the three reset endpoints.
- `src/features/auth/LoginPage.tsx`: adds the forgot-password link.
- `src/app/AppRouter.tsx`: adds `/:language/reset-password`.
- `src/i18n/resources.ts`: adds English and Arabic recovery text.
- `src/styles.css`: styles the recovery link with RTL support.
- `tests/foundation.test.mjs`: verifies route, API paths, code format, and password confirmation.

### API

- `POST /api/v1/auth/password-reset/request`: sends the normalized email and consumes the neutral response.
- `POST /api/v1/auth/password-reset/verify`: sends email and six-digit code and holds the returned reset token in memory.
- `POST /api/v1/auth/password-reset/confirm`: sends email, reset token, new password, and confirmation.

### Database

- Migration: `20260930_004_add_password_reset.sql` in `inkfig-user-system`.
- The backend migration must run before this frontend is deployed; this repository has no database changes.

### Permissions and scope

- The recovery route is public and grants no application permissions.
- The frontend does not determine account eligibility or authorize the reset; all authorization and validation are enforced by the backend.

### Frontend

- Adds `/:language/reset-password`, reachable from the login form.
- Uses existing shared authentication card, inputs, buttons, logo, theme, responsive layout, and RTL/LTR behavior.
- Supports Arabic and English and provides loading, success, and error feedback for every stage.

### Verification

- `[passed] npm test` - 11 tests passed after rebasing the latest brand-name checks.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-system` and migration 004 first, then deploy `inkfig-user-FE` using its existing Cloudflare workflow.
- No frontend environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

Refreshing the browser during code verification or password entry intentionally clears the in-memory reset token; the user can request a new code and restart safely.

## 2026-09-30 - Add authentication background artwork

### Request

Use the supplied high-resolution artwork as the background on the sign-in and sign-up pages.

### Changes

- Added the supplied 1536-by-1024 PNG as a source-controlled frontend asset without reducing its resolution.
- Applied the artwork only to the login and signup layouts with centered, non-repeating `cover` rendering for responsive screens.
- Added separate light- and dark-theme overlays to preserve form readability while allowing the artwork to remain visible.
- Added regression coverage for both page hooks, responsive image sizing, and the dark-theme treatment.

### Repositories

- `inkfig-user-FE`: added the image asset, page styling hooks, responsive background styling, and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/assets/auth-background.png`: stores the supplied background artwork at its original resolution.
- `src/features/auth/LoginPage.tsx`: enables the artwork on the sign-in layout.
- `src/features/auth/SignupPage.tsx`: enables the artwork on the sign-up layout.
- `src/styles.css`: defines responsive image positioning and theme-specific readability overlays.
- `tests/foundation.test.mjs`: verifies the background integration.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Sign-in and sign-up now share the supplied full-screen background artwork.
- The original image resolution is preserved, while `background-size: cover` adapts it across viewport sizes.
- Light and dark themes retain distinct overlays and readable authentication cards.
- Other routes, forms, localization, RTL/LTR behavior, and authentication workflows are unchanged.

### Verification

- `[passed] npm test` - 11 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[failed] initial sandboxed npm run build` - Windows sandbox denied esbuild access above the workspace; the identical build passed with the required filesystem permission.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The artwork remains a PNG to preserve the exact supplied image quality.

## 2026-09-30 - Refresh authentication artwork and logo composition

### Request

Replace the sign-in and sign-up background with the newly supplied artwork and position the InkFig logo beautifully above the artwork's `INK YOUR WORLD` headline.

### Changes

- Replaced the previous authentication background with the supplied 1672-by-941 wide PNG at its original resolution.
- Repositioned desktop authentication cards on the right so the artwork headline remains visible on the left.
- Added a responsive scene logo above the artwork headline with proportional sizing and a restrained shadow.
- Kept a single visible logo by hiding the card logo on wide screens and restoring it when the scene composition is hidden on narrower screens.
- Refined light- and dark-theme overlays to preserve artwork detail and form contrast.
- Extended regression coverage for the scene logo and responsive fallback.

### Repositories

- `inkfig-user-FE`: replaced the asset and updated authentication layout, styling, and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/assets/auth-background.png`: contains the new supplied artwork at its original resolution.
- `src/features/auth/LoginPage.tsx`: adds the desktop scene logo to sign-in.
- `src/features/auth/SignupPage.tsx`: adds the desktop scene logo to sign-up.
- `src/styles.css`: positions the logo and cards and defines the responsive fallback and theme overlays.
- `tests/foundation.test.mjs`: verifies the logo composition and responsive behavior.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Wide screens display the InkFig logo above the background's `INK YOUR WORLD` headline while the form sits on the right.
- Screens up to 1050 pixels center the form and display the logo inside the card to prevent cropping or overlap.
- Both theme modes keep the same responsive artwork with tailored overlays.
- Authentication behavior, localization, RTL/LTR behavior, routes, and validation remain unchanged.

### Verification

- `[passed] npm test` - 12 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] source image inspection` - installed asset is 1672 by 941 pixels.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface was available to the computer-use session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The desktop composition intentionally uses the physical left side because the headline is embedded in the raster artwork and does not move in RTL mode.

## 2026-09-30 - Add theme-specific authentication backgrounds

### Request

Use the supplied light artwork in light mode, the supplied dark artwork in dark mode, and keep sign-in and sign-up forms on the physical right in both Arabic and English.

### Changes

- Replaced the shared authentication artwork with separate original-resolution light and dark PNG assets.
- Assigned the light asset to the default theme and the dark asset only to the dark-theme override.
- Replaced direction-aware end alignment with physical right alignment using an automatic left margin and zero right margin.
- Retained centered forms on screens up to 1050 pixels so mobile content remains usable.
- Updated regression coverage for both asset assignments and direction-independent right positioning.
- Removed the superseded single background asset after both theme-specific replacements were installed.

### Repositories

- `inkfig-user-FE`: added theme-specific images and updated authentication styling and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/assets/auth-background-light.png`: stores the supplied 1671-by-941 light-theme artwork.
- `src/assets/auth-background-dark.png`: stores the supplied 1671-by-941 dark-theme artwork.
- `src/assets/auth-background.png`: removed because it was superseded by the two theme-specific assets.
- `src/styles.css`: maps each image to its theme and physically aligns desktop forms to the right.
- `tests/foundation.test.mjs`: verifies theme mapping and physical-right alignment.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Sign-in and sign-up use the light artwork in light mode and dark artwork in dark mode.
- Desktop forms stay on the physical right in both LTR English and RTL Arabic modes.
- Narrow screens continue centering the forms for readability.
- Authentication behavior, validation, routing, and localization remain unchanged.

### Verification

- `[passed] source image inspection` - both supplied assets are 1671 by 941 pixels.
- `[passed] npm test` - 12 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded with both image assets emitted.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The desktop positioning deliberately uses physical `margin-left` and `margin-right` values so RTL direction cannot move the form away from the requested right side.

## 2026-09-30 - Keep authentication artwork fixed behind scrollable forms

### Request

Move the InkFig logo above the sign-in and sign-up forms, show the full background image without page scrolling, and confine scrolling to the form.

### Changes

- Replaced the logo's artwork-overlay position with a dedicated logo row directly above each form card.
- Added right-side form-column containers for login and signup while preserving physical-right placement in Arabic and English.
- Locked photo-backed authentication pages to the viewport and disabled page-level overflow.
- Changed both background layers to `contain` sizing so the complete source artwork is visible without cropping.
- Fixed the background attachment and centered each non-repeating theme image.
- Limited vertical overflow to the form card itself, keeping the logo and background stationary while long signup content scrolls.
- Updated regression coverage for the new form columns, logo placement, full-image sizing, viewport lock, and form-only scrolling.

### Repositories

- `inkfig-user-FE`: updated login/signup markup, authentication styling, and regression tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/LoginPage.tsx`: groups the logo above the sign-in card.
- `src/features/auth/SignupPage.tsx`: groups the logo above the sign-up card.
- `src/styles.css`: fixes the full background to the viewport and confines overflow to form cards.
- `tests/foundation.test.mjs`: verifies the layout and scrolling contract.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The InkFig logo appears immediately above the form instead of over the background artwork.
- The light/dark artwork remains fixed, fully visible, centered, and free of page-level scrolling.
- Long forms scroll inside their card while the logo and page background remain stationary.
- The form column remains physically right-aligned on desktop in Arabic and English and centered on narrow screens.

### Verification

- `[passed] npm test` - 12 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The complete image is prioritized over filling every possible viewport dimension, so unusually shaped screens may show theme-colored letterboxing rather than crop the artwork.

## 2026-09-30 - Restore full-page authentication backgrounds

### Request

Make the authentication pictures fill the page as before while remaining fixed, and remove the logos from sign-in and sign-up.

### Changes

- Restored `cover` sizing for both theme-specific background images so they fill the complete viewport without letterboxing.
- Preserved fixed background attachment, viewport locking, and page-level overflow prevention.
- Removed the logo elements and unused logo imports from login and signup.
- Simplified each form column to a single scrollable card row after removing the logo row.
- Updated regression coverage to require full-page cover rendering and prohibit authentication-page logos.

### Repositories

- `inkfig-user-FE`: corrected background sizing, removed authentication logos, and updated tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/LoginPage.tsx`: removes the sign-in logo.
- `src/features/auth/SignupPage.tsx`: removes the sign-up logo.
- `src/styles.css`: restores cover rendering and simplifies the logo-free form column.
- `tests/foundation.test.mjs`: verifies cover sizing and absence of authentication-page logos.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Light and dark backgrounds once again fill the complete page using centered cover rendering.
- The background and page remain fixed while overflow stays inside the form card.
- Sign-in and sign-up no longer display the InkFig logo.
- Desktop forms remain physically right-aligned in Arabic and English; narrow screens remain centered.

### Verification

- `[passed] npm test` - 12 tests passed after updating the obsolete logo expectation.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[failed] initial npm test` - the pre-existing branding test still required a login-page logo; the assertion was updated to match the requested removal and the suite then passed.
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

`cover` fills the viewport and may crop a small amount at extreme aspect ratios; this restores the requested full-page appearance without background scrolling.

## 2026-09-30 - Match signup styling to sign-in

### Request

Make every sign-up form color and field treatment exactly match sign-in, style the authentication theme icon like the sign-in form, and leave page backgrounds unchanged.

### Changes

- Applied the sign-in card's light-theme border, translucent olive gradient, shadow, text, muted text, field, button, status, and error tokens to signup through one shared selector.
- Applied the same shared dark-theme card override to login and signup.
- Styled the authentication theme-toggle button with the sign-in form surface, border, shadow, text color, and blur in light mode.
- Matched the authentication theme-toggle button to the sign-in card's shared background, border, shadow, and text in dark mode.
- Added regression coverage requiring signup and the authentication theme toggle to remain coupled to sign-in styling.
- Intentionally did not modify either authentication page background image, sizing, position, attachment, overlay, or scrolling behavior.

### Repositories

- `inkfig-user-FE`: unified authentication form and theme-toggle styling and updated tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: shares sign-in styling with signup and the authentication theme toggle.
- `tests/foundation.test.mjs`: verifies the shared light/dark form and toggle treatment.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Sign-in and sign-up now have exactly the same visual palette for cards, text, fields, borders, buttons, and feedback states.
- The light/dark icon on authentication pages visually matches the sign-in card surface in each theme.
- Authentication page backgrounds and scrolling behavior are unchanged.
- Form dimensions, content, validation, localization, RTL/LTR behavior, and submission workflows remain unchanged.

### Verification

- `[passed] npm test` - 13 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The page-background declarations were intentionally left untouched to keep this ticket scoped only to form and authentication-toggle styling.

## 2026-09-30 - Correct authentication language-control placement

### Request

Place the Arabic control at the bottom-right in English mode, place the English control at the bottom-left in Arabic mode, and remove outer shadows from sign-in and sign-up frames.

### Changes

- Added physical right alignment for the language control on English login and signup cards.
- Added an explicit RTL override that physically aligns the language control left in Arabic mode.
- Removed both outward drop-shadow layers from light-theme login and signup cards while retaining the subtle inset highlight.
- Removed the dark-theme card's outward shared shadow and retained only its subtle inset highlight.
- Added regression coverage for both language directions and both theme shadow treatments.
- Intentionally left authentication backgrounds, form colors, fields, dimensions, and scrolling behavior unchanged.

### Repositories

- `inkfig-user-FE`: adjusted authentication card alignment and shadow styling and updated tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: physically positions language controls and removes outer card shadows.
- `tests/foundation.test.mjs`: verifies English/Arabic placement and inset-only card shadows.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- English mode displays the Arabic control at the form's bottom-right.
- Arabic mode displays the English control at the form's bottom-left.
- Sign-in and sign-up cards no longer cast shadows outside their frames in light or dark mode.
- Page backgrounds, card palette, fields, content, validation, routes, and form-only scrolling remain unchanged.

### Verification

- `[passed] npm test` - 14 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

Physical margins are used deliberately so the requested screen side is stable rather than being reversed automatically by writing direction.

## 2026-09-30 - Add in-form logos and themed scrollbars

### Request

Place the logo at the top center inside sign-in and sign-up forms and make the form scrollbar compatible with the light and dark card palettes.

### Changes

- Restored the InkFig SVG import on login and signup and placed the logo as the first element inside each card.
- Reused the existing responsive `auth-logo` dimensions and automatic inline margins for centered placement.
- Added thin, stable-gutter scrollbar styling scoped only to authentication form cards.
- Added rounded WebKit scrollbar tracks, thumbs, and hover states for Chromium/Safari alongside standards-based Firefox colors.
- Defined light-card scrollbar colors using the pale leaf accent over the translucent dark-olive form surface.
- Defined dark-card scrollbar colors using deep leaf green with a brighter olive hover state over a darker track.
- Updated regression coverage for in-card placement, centering, theme variables, and browser scrollbar styling.

### Repositories

- `inkfig-user-FE`: added in-card logos, themed scrollbar styling, and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/LoginPage.tsx`: adds the centered logo inside the sign-in card.
- `src/features/auth/SignupPage.tsx`: adds the centered logo inside the sign-up card.
- `src/styles.css`: adds theme-compatible form scrollbar styling.
- `tests/foundation.test.mjs`: verifies logo placement and scrollbar themes.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Both authentication cards display the InkFig logo centered at their top.
- Form scrollbars now coordinate with the light and dark form colors across modern browser engines.
- Page backgrounds, card placement, form-only scrolling, language-control placement, fields, and authentication behavior remain unchanged.

### Verification

- `[passed] npm test` - 15 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

Scrollbar styling is card-scoped, so scrollbars elsewhere in the application are unaffected.

## 2026-09-30 - Remove redundant authentication brand label

### Request

Remove the standalone `InkFig` word above the welcome/create-account heading in sign-in and sign-up for Arabic and English.

### Changes

- Removed the standalone localized brand paragraph from the login card.
- Removed the standalone localized brand paragraph from the signup card.
- Kept the centered InkFig logo and its accessible `InkFig` alternative text unchanged.
- Updated localization regression coverage to prohibit the removed label on login/signup while retaining the canonical brand-label behavior on other authentication screens.

### Repositories

- `inkfig-user-FE`: removed the two redundant labels and updated tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/auth/LoginPage.tsx`: removes the standalone word above the welcome heading.
- `src/features/auth/SignupPage.tsx`: removes the standalone word above the create-account heading.
- `tests/foundation.test.mjs`: verifies the text is absent from both cards.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Login now flows directly from the centered logo to the welcome heading.
- Signup now flows directly from the centered logo to the create-account heading.
- The result is identical in Arabic and English because the removed element used the shared locale key.
- Backgrounds, card styling, scrollbars, language controls, fields, and workflows remain unchanged.

### Verification

- `[passed] npm test` - 15 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The brand remains visible through the logo; only the duplicated standalone text label was removed.

## 2026-09-30 - Reduce the sign-in logo height

### Request

Slightly reduce only the sign-in logo until the compact login card no longer requires a scrollbar.

### Changes

- Added a login-specific logo size override that reduces its maximum width from 210 pixels to 180 pixels and its proportional width from 62% to 54%.
- Preserved the original signup logo size.
- Left the shared form scrollbar available for genuinely constrained viewport heights.
- Added regression coverage for the login-specific logo size.

### Repositories

- `inkfig-user-FE`: adjusted the sign-in logo size and test coverage.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: adds the scoped login-logo dimensions.
- `tests/foundation.test.mjs`: verifies the smaller sign-in logo remains intentional.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The sign-in logo is slightly smaller so the standard login card fits without vertical overflow.
- Signup logo sizing, form styling, themed scrollbars, backgrounds, and workflows remain unchanged.
- On unusually short viewports, the existing form-only overflow remains available to prevent clipped controls.

### Verification

- `[passed] npm test` - 15 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, database, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The change is scoped to `.login-card .auth-logo`, so other application and authentication logos are unaffected.

## 2026-09-30 - Show the hourly email-code limit

### Request

Explain when a user has requested five codes and prevent another registration or password-reset code request for one hour.

### Changes

- Consumes backend resend delay and hourly-lock metadata in both email-code flows.
- Shows a localized security message after the fifth code and disables resend during the one-hour countdown.
- Password reset now resends directly from the code screen instead of returning to email entry.
- Handles a backend 429 on registration by displaying the hourly-limit message.
- Existing code verification, password selection, authentication visuals, background, themes, and responsive behavior were intentionally left unchanged.

### Repositories

- `inkfig-user-FE`: added hourly-lock feedback and countdown behavior.
- `inkfig-user-system`: authoritatively enforces the limit and persists its state.

### Files

- `src/features/auth/PasswordResetPage.tsx`: adds direct resend, countdown, and lock feedback.
- `src/features/auth/VerifyEmailPage.tsx`: consumes lock state and formats longer countdowns.
- `src/features/auth/SignupPage.tsx`: transfers initial lock metadata and handles 429.
- `src/features/auth/passwordResetApi.ts`, `src/features/auth/registrationApi.ts`: add response fields.
- `src/i18n/resources.ts`: adds English and Arabic hourly-limit text.
- `tests/foundation.test.mjs`: verifies both flows expose the backend-enforced limit.

### API

- `POST /api/v1/auth/signup`: consumes `hourly_limit_reached` and `resend_after_seconds`.
- `POST /api/v1/auth/resend-verification`: consumes the same limiter fields and handles 429.
- `POST /api/v1/auth/password-reset/request`: consumes neutral limiter metadata for the reset countdown.

### Database

- Migration: `20260930_005_add_email_code_rate_limits.sql` in `inkfig-user-system`.
- No database changes exist in this frontend repository.

### Permissions and scope

- Public registration and reset routes remain unauthenticated.
- The frontend only displays backend decisions; it does not authorize sends or enforce the security limit.
- Backend validation remains authoritative.

### Frontend

- Both code pages show that five codes were requested and another cannot be sent for one hour.
- Resend buttons remain disabled while the server-provided countdown is active.
- Countdown labels use seconds below one minute and rounded minutes for longer waits.
- Loading, error, RTL/LTR, Arabic/English, and mobile behavior are preserved.

### Verification

- `[passed] npm test` - 16 tests passed after final synchronization.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded after final synchronization.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-system` and migration 005 first, then deploy `inkfig-user-FE`.
- No frontend environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

The displayed countdown is a usability aid; refreshing the browser can clear it, but the backend lock remains effective and returns the limit again on the next request.

## 2026-09-30 - Center and animate authentication forms

### Request

Center login and signup, arrange signup fields side by side in a rectangular card, animate login/signup navigation, and smooth the light/dark background change.

### Changes

- Centered login and signup cards at every desktop width instead of pinning them to the right.
- Expanded signup to an 820px rectangular card with a balanced two-column field grid on desktop and one column on mobile.
- Kept email, validation feedback, and the submit action full width for clear hierarchy.
- Added opposite-direction, RTL-aware entrance transitions when React Router switches between login and signup without reloading the page.
- Rebuilt the authentication background as light and dark pseudo-layers that crossfade during theme changes.
- Added focused input lift, button hover/press feedback, and coordinated card/control color transitions.
- Extended reduced-motion handling to disable animations for users who request it.
- Existing form fields, validation, authentication requests, routes, backgrounds, language behavior, and responsive scrolling were intentionally left unchanged.

### Repositories

- `inkfig-user-FE`: updated authentication layout, motion, and regression coverage.

### Files

- `src/features/auth/LoginPage.tsx`: marks login for the start-side entrance transition.
- `src/features/auth/SignupPage.tsx`: marks signup for the end-side transition and two-column grid.
- `src/styles.css`: centers cards, defines responsive columns, crossfades themes, and adds accessible motion.
- `tests/foundation.test.mjs`: verifies centering, grid behavior, animation, crossfade, mobile fallback, and reduced-motion support.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No permissions, roles, authentication decisions, or data scopes changed.
- Backend authorization remains authoritative.

### Frontend

- `/:language/login` remains a distinct route but switches within the SPA without a full page reload.
- `/:language/signup` remains a distinct route and enters from the opposite side of login.
- Signup uses two columns above 760px and one column at or below 760px.
- Light/dark artwork crossfades over 560ms; card and control colors transition with it.
- Animations reverse appropriately for RTL and are effectively disabled under `prefers-reduced-motion`.

### Verification

- `[passed] npm test` - 17 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - browser-control tooling was unavailable in this session.

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, secret, or environment-variable change is required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

Login and signup keep separate shareable URLs, while React Router navigation avoids a document reload and the mounted destination card supplies the transition.

## 2026-09-30 - Polish authentication inputs and reset transition

### Request

Remove signup hints, align field sizes, modernize date and password controls, add placeholders, improve backgrounds, show phone conflicts, and animate the reset-password page.

### Changes

- Removed the visible email-format and ten-digit helper lines while retaining frontend and backend validation.
- Added the requested phone and two-format university-email placeholders.
- Added accessible show/hide buttons to login, signup, and reset password fields.
- Replaced the plain date control presentation with a calendar-icon field that opens the native accessible picker.
- Aligned signup labels and controls to consistent rows so full name matches neighboring fields.
- Added a field-specific localized phone conflict message.
- Added higher-detail light and dark authentication artwork generated from the existing compositions without replacing the originals.
- Added the authentication background and RTL-aware entrance transition to password reset.
- Existing routes, authentication behavior, validation rules, and responsive single-column fallback were intentionally unchanged.

### Repositories

- `inkfig-user-FE`: updated authentication components, styling, assets, localization, and tests.
- `inkfig-user-system`: enforces phone uniqueness and records its backend work separately.

### Files

- `src/features/auth/PasswordField.tsx`: reusable accessible password visibility control.
- `src/features/auth/DateOfBirthField.tsx`: modern native date-picker control.
- `src/features/auth/LoginPage.tsx`: uses the visibility control.
- `src/features/auth/SignupPage.tsx`: updates controls, placeholders, hints, and conflict handling.
- `src/features/auth/PasswordResetPage.tsx`: adds transition/background and password controls.
- `src/styles.css`: aligns inputs and styles icon-bearing fields and HD backgrounds.
- `src/i18n/resources.ts`: adds English and Arabic accessibility/conflict strings.
- `src/assets/auth-background-light-hd.png`, `src/assets/auth-background-dark-hd.png`: enhanced authentication backgrounds.
- `tests/foundation.test.mjs`: covers the new controls, assets, placeholders, and reset motion.

### API

- Consumes the existing `POST /api/v1/auth/signup` 409 response and distinguishes phone conflicts from email conflicts.

### Database

- Migration: `20260930_006_add_unique_phone_number.sql` in `inkfig-user-system`.
- No database changes in this repository.

### Permissions and scope

- Public login, signup, and password recovery permissions are unchanged.
- Email and phone uniqueness are enforced by the backend/database, not trusted to the frontend.

### Frontend

- `/:language/login`: adds password visibility.
- `/:language/signup`: adds aligned modern controls, placeholders, password visibility, and phone conflict feedback.
- `/:language/reset-password`: adds the shared artwork, entrance transition, email placeholder, and password visibility.
- Controls retain RTL/LTR, mobile responsiveness, keyboard labels, reduced-motion support, loading, and error states.

### Verification

- `[passed] npm test` - 18 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - browser-control tooling was unavailable.

### Deployment

- Deploy `inkfig-user-FE` after the user backend deployment succeeds.
- No environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

The native date picker is retained beneath the custom presentation for browser accessibility and mobile date selection.

## 2026-10-01 - Simplify email fields and widen sign-in

### Request

Remove the email placeholders from signup and password reset, and make the sign-in form rectangular.

### Changes

- Removed the university-email placeholder from signup.
- Removed the university-email placeholder from the password-reset email stage.
- Expanded the centered sign-in form from 440px to a 600px desktop width for a wider rectangular presentation.
- Preserved the existing full-width mobile behavior, email validation, field labels, transitions, backgrounds, and authentication workflows.

### Repositories

- `inkfig-user-FE`: updated authentication fields, sign-in sizing, and regression coverage.

### Files

- `src/features/auth/SignupPage.tsx`: removes the email placeholder.
- `src/features/auth/PasswordResetPage.tsx`: removes the email placeholder.
- `src/styles.css`: widens the sign-in form container.
- `tests/foundation.test.mjs`: verifies both placeholder removals and the new width.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No permissions, roles, authentication rules, or access scopes changed.
- Backend authorization and validation remain authoritative.

### Frontend

- `/:language/signup` and `/:language/reset-password` retain labeled email fields without placeholder text.
- `/:language/login` uses a centered 600px rectangle on larger screens and remains fluid on narrow screens.
- RTL/LTR, mobile responsiveness, loading, error, theme, and reduced-motion behavior are unchanged.

### Verification

- `[passed] npm test` - 18 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No migration or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

None

## 2026-10-01 - Add the public artwork home page

### Request

Make the root InkFig experience a professional public landing page that displays user artworks to registered users and visitors, using a distinct logo-colored background without drawings.

### Changes

- Added a public, localized gallery home page with brand header, hero, discovery filters, responsive masonry-style artwork cards, artist/type metadata, and visible like counts.
- Routes the bare site and unknown URLs to the Arabic public home rather than the authentication welcome screen.
- Shows sign-in/signup actions to visitors and a dashboard action to authenticated users.
- Added a generated abstract canvas background using the InkFig cream, olive, and burgundy palette with no drawings or decorative subjects.
- Uses non-interactive showcase cards until work, type, preference, and like APIs are specified; no fake backend behavior was introduced.
- Existing authentication routes, protected dashboard, permissions, and backend authorization were intentionally unchanged.

### Repositories

- `inkfig-user-FE`: added the public home experience, artwork presentation, localization, background asset, routing, and tests.

### Files

- `src/features/home/HomePage.tsx`: implements the public gallery and visitor/authenticated navigation states.
- `src/assets/gallery-ivory-background.png`: abstract logo-palette canvas background without drawings.
- `src/app/AppRouter.tsx`: makes `/:language` public and redirects unknown first visits to `/ar`.
- `src/i18n/resources.ts`: adds Arabic and English home-page strings.
- `src/styles.css`: adds responsive Gallery Ivory layout, cards, filters, dark-mode treatment, and mobile behavior.
- `tests/foundation.test.mjs`: verifies public routing, gallery structure, responsiveness, asset use, and localization.

### API

No API changes. Artwork cards currently use local showcase data because work-feed APIs have not yet been defined.

### Database

No migration required. Work types, posts, preferences, and likes remain for later backend/database tickets.

### Permissions and scope

- The public home and displayed showcase content require no authentication.
- Visitors receive browse-only presentation; no like mutation is exposed.
- Authenticated users can navigate to their protected dashboard.
- Future upload and like permissions must be validated by the backend.

### Frontend

- `/:language` is the public home route and the default site experience.
- The header adapts to visitor or authenticated session state.
- The gallery uses three responsive masonry columns, reducing to two and then one on smaller screens.
- Arabic/English, RTL/LTR, dark mode, mobile navigation, reduced motion, and semantic labels are supported.

### Verification

- `[passed] npm test` - 19 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - browser-control tooling was unavailable in this session.

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, secret, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

The generated workspace asset used the built-in image-generation workflow with a texture-only prompt and explicit prohibition on drawings, objects, text, logos, or scenery. Replace showcase data with the real preference feed after its API and work-type model are agreed.

## 2026-10-01 - Remove unrequested dashboard and welcome pages

### Request

Keep only the public home and previously requested authentication pages, removing the dashboard and obsolete welcome page.

### Changes

- Removed the dashboard route, page, application shell, sidebar navigation, and protected-route wrapper.
- Removed the old welcome route and page because home is now the public entry point.
- Removed dashboard/welcome navigation references and obsolete localization keys.
- Authenticated visitors to login, signup, verification, or password reset now return to home.
- Replaced the authenticated dashboard action on home with the user's name and a logout action.
- Updated documentation and tests to reflect the intentionally limited route set.
- Home, login, signup, email verification, and password reset behavior were otherwise unchanged.

### Repositories

- `inkfig-user-FE`: removed unrequested pages and their supporting frontend code.

### Files

- `src/app/AppRouter.tsx`: removes welcome, dashboard, shell, and guard routes.
- `src/features/auth/AuthLandingPage.tsx`: deleted.
- `src/features/auth/RequireAuth.tsx`: deleted.
- `src/features/dashboard/DashboardPage.tsx`: deleted.
- `src/features/layout/AppShell.tsx`: deleted.
- `src/features/home/HomePage.tsx`: replaces the dashboard link with identity/logout controls.
- `src/features/auth/LoginPage.tsx`, `SignupPage.tsx`, `VerifyEmailPage.tsx`, `PasswordResetPage.tsx`: redirect authenticated users home.
- `src/i18n/resources.ts`: removes unused dashboard and shell strings.
- `src/styles.css`: styles the authenticated home identity/logout state.
- `README.md`, `tests/foundation.test.mjs`: document and verify the remaining pages.

### API

No API changes. Existing login and logout endpoints remain in use.

### Database

No migration required.

### Permissions and scope

- No backend permissions or roles changed.
- Authentication remains backend-validated.
- The public home remains accessible to visitors; authenticated session state only changes the home header controls.

### Frontend

- Remaining routes: `/:language`, `/:language/login`, `/:language/signup`, `/:language/verify-email`, and `/:language/reset-password`.
- Removed routes: `/:language/welcome` and `/:language/dashboard`.
- Unknown URLs continue redirecting to `/ar`.

### Verification

- `[passed] npm test` - 19 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] removed-reference scan` - no runtime dashboard/welcome/shell/guard references remain.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No migration or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

Role-aware pages can be introduced later only when their requirements are explicitly defined.

## 2026-10-01 - Make English the default language

### Request

Use English as the default language when visitors open InkFig without an explicit supported locale.

### Changes

- Changed the unknown/bare-path redirect from `/ar` to `/en`.
- Changed localization fallback behavior to English unless the URL explicitly starts with `/ar`.
- Preserved Arabic routes, the language switcher, RTL behavior, and all translated content.

### Repositories

- `inkfig-user-FE`: updated routing and localization defaults.

### Files

- `src/app/AppRouter.tsx`: redirects first visits and unknown paths to `/en`.
- `src/i18n/I18nProvider.tsx`: uses English as the fallback locale.
- `tests/foundation.test.mjs`: verifies the English routing and provider defaults.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, permissions, roles, or access scopes changed.
- Backend authorization remains authoritative.

### Frontend

- `inkfig-hu.com` now resolves to `/en` by default.
- Explicit `/ar` URLs continue rendering Arabic in RTL.
- Explicit `/en` URLs render English in LTR.

### Verification

- `[passed] npm test` - 19 tests passed.
- `[passed] npm run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No migration or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit
- Push: `successful`

### Notes

None
## 2026-10-01 - Public artwork feed and upload interface

### Request

Connect the frontend to the new works backend so all visitors can see published user artwork and authenticated users can upload typed image works and interact through likes.

### Changes

- Replaced static home-page artwork data with the public backend feed, including loading, empty, and error states.
- Added authenticated like/unlike controls with optimistic UI rollback on request failure; visitors can view counts but cannot interact.
- Added a localized authenticated upload route and form for title, active work type, optional description, and supported image selection.
- Uploads image files directly to the backend-issued Supabase signed URL and publishes metadata only after the upload succeeds.
- Intentionally omitted hard-coded type filters because official system work types will be supplied later.

### Repositories

- `inkfig-user-FE`: added feed, upload, likes, localization, responsive styling, and tests.
- `inkfig-main-system`: provides the API and database changes in a separate repository change.

### Files

- `src/features/works/worksApi.ts`: implements feed, type, signed upload, publish, and like requests.
- `src/features/works/UploadWorkPage.tsx`: adds the authenticated artwork upload workflow.
- `src/features/home/HomePage.tsx`: renders live public artwork and like controls.
- `src/app/AppRouter.tsx`: adds `/:language/upload`.
- `src/i18n/resources.ts`: adds English and Arabic work-flow strings.
- `src/styles.css`: styles feed images, states, likes, and the responsive upload form.
- `tests/foundation.test.mjs`: verifies works routes, endpoints, upload protocol, authentication guard, and file types.

### API

- `GET /api/v1/works`: loads the public published-artwork feed and passes the access token when available for viewer-like state.
- `GET /api/v1/works/types`: loads active work types for the upload form.
- `POST /api/v1/works/uploads`: submits work metadata and receives a signed Supabase upload URL.
- `POST /api/v1/works/{work_id}/publish`: publishes the work after direct Storage upload succeeds.
- `PUT /api/v1/works/{work_id}/like`: likes a work for the authenticated user.
- `DELETE /api/v1/works/{work_id}/like`: removes the authenticated user's like.

### Database

- No migration required in this repository; `inkfig-main-system/migrations/20261001_001_create_works.sql` contains the required shared Supabase migration.

### Permissions and scope

- Everyone, including unregistered viewers, can view published artwork.
- Only authenticated users see the upload action and can access the upload form or operate likes.
- The frontend guard improves navigation, while ownership and authorization are validated by the backend.

### Frontend

- Added route `/:language/upload` with login redirection for unauthenticated visitors.
- Added localized form, disabled/busy state, upload error handling, and a no-types state until official types are seeded.
- Home cards use lazy-loaded real images, localized type names, artist names, like counts, and clear loading/empty/error states.
- Existing English-default routing, RTL/LTR behavior, themes, responsive navigation, and authentication pages remain unchanged.

### Verification

- `[passed] npm test — 20 tests passed`
- `[passed] npm run build — TypeScript checks and Vite production build completed`

### Deployment

- Deploy `inkfig-main-system` and run its migration before deploying `inkfig-user-FE`.
- No new frontend environment variables are required; the existing main API URL is used.

### Git

- Branch: `main`
- Commit: `bdb79e4`
- Push: `successful`

### Notes

The upload form remains intentionally unavailable when no active work types exist. Add the official types through a later database migration before enabling real uploads for users.

## 2026-10-01 - Select authentication artwork from Palestine local time

### Request

Use the matching light or dark full-screen artwork on sign-in, sign-up, and reset-password pages, defaulting the system theme according to the current time in Palestine while keeping the manual theme toggle.

### Changes

- Replaced the operating-system color-scheme default with a Palestine-time default using the IANA `Asia/Hebron` time zone, including its daylight-saving rules.
- Uses light mode from 06:00 through 17:59 Palestine time and dark mode from 18:00 through 05:59.
- Automatically rechecks Palestine time every minute while no manual preference exists, allowing an open authentication page to cross the day/night boundary.
- Preserved the existing manual light/dark toggle and its saved `inkfig.theme` preference; a manual choice overrides automatic time selection.
- Reused the existing paired HD artwork and crossfade, scoped to login, signup, and password-reset pages through their shared authentication background class.

### Repositories

- `inkfig-user-FE`: updated theme selection and regression coverage.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/theme/ThemeProvider.tsx`: selects and synchronizes the automatic theme using Palestine local time while preserving manual preferences.
- `tests/foundation.test.mjs`: verifies the Palestine time zone, light/dark boundaries, periodic synchronization, and removal of the OS color-scheme default.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, role, permission, or data-scope behavior changed.
- Backend authorization remains authoritative.

### Frontend

- Login, signup, and reset-password default to the daytime or nighttime artwork that matches Palestine local time.
- The theme button immediately switches both the UI palette and artwork and saves the user's choice.
- Other pages retain their existing backgrounds and continue to consume the shared theme normally.

### Verification

- `[passed] npm.cmd test` - 20 tests passed.
- `[passed] npm.cmd run build` - TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[passed] Playwright visual inspection` - at 22:19 Palestine time login defaulted to the night artwork; the theme toggle switched to the daytime artwork; signup and reset-password exposed the shared theme control and authentication layout.
- `[failed] initial npm invocation` - PowerShell execution policy blocked `npm.ps1`; verification was rerun with `npm.cmd`.
- `[failed] initial sandboxed test/dev-server runs` - Node worker and esbuild process creation returned `EPERM`; the same commands passed outside the sandbox.

### Deployment

- Push `inkfig-user-FE` directly to `main` to trigger the existing Cloudflare deployment workflow.
- No backend deployment, migration, secret, or environment-variable change is required.

### Notes

Automatic time selection applies only when the user has not saved a manual theme. Clearing the `inkfig.theme` browser storage value restores Palestine-time automatic behavior.

## 2026-10-02 - Fix sign-in language and theme controls at top right

### Request

Replace the sign-in page's text language switch with a button matching the theme control and keep both controls fixed at the top-right when either language or theme changes.

### Changes

- Added a reusable icon-only language toggle using the Lucide Languages icon and the existing localization provider.
- Placed the language and theme toggles together in one sign-in control group.
- Removed the old language text button from the bottom of the login card.
- Changed authentication control positioning from direction-aware logical offsets to physical top and right offsets.
- Forced stable left-to-right ordering inside the two-button group so switching between English and Arabic cannot swap or move the controls.
- Reused the established theme-toggle visual treatment for the language button in both light and dark themes.
- Added localized accessible labels and regression coverage for control wiring, styling, and positioning.

### Repositories

- inkfig-user-FE: added the sign-in language control and stable top-right control group.
- inkfig-user-system: no changes required.
- inkfig-main-system: no changes required.

### Files

- src/i18n/LanguageToggle.tsx: implements the localized icon language toggle.
- src/features/auth/LoginPage.tsx: groups language and theme controls and removes the old text switch.
- src/i18n/resources.ts: adds English and Arabic accessible action labels.
- src/styles.css: fixes the control group to the physical top-right and preserves stable ordering.
- tests/foundation.test.mjs: verifies integration and positional invariants.
- AGENT_FEATURE_LOG.md: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, role, permission, or data-scope behavior changed.
- Backend authorization remains authoritative.

### Frontend

- The sign-in page now shows matching language and theme icon buttons at the top-right.
- Switching Arabic/English changes content direction without moving or reordering the controls.
- Switching light/dark theme changes their palette without changing their position.
- Login submission, validation, routing, responsive layout, background artwork, and other pages are unchanged.

### Verification

- [passed] npm.cmd test - 21 tests passed.
- [passed] npm.cmd run build - TypeScript checks and Vite production build succeeded.
- [passed] git diff --check
- [failed] initial npm.cmd test - an existing selector assertion expected an ungrouped theme style; the language toggle now reuses the existing theme-toggle class and the full rerun passed.
- [failed] initial npm.cmd run build - the LanguageToggle import was missing; it was added and the full rerun passed.
- [not run] live browser visual inspection - the in-app browser was unavailable in this session.

### Deployment

- Pushing main triggers the existing Cloudflare frontend deployment workflow.
- No backend deployment, migration, secret, or environment-variable change is required.

### Git

- Branch: main
- Commit: this ticket's focused commit.
- Push: pushed directly to origin/main after synchronization.

### Notes

Physical top/right positioning is intentional here; logical inline-end positioning would move the controls when the document switches to RTL.

## 2026-10-02 - Extend fixed authentication controls to signup and password reset

### Request

Apply the sign-in page's fixed language and theme controls to signup and forgot-password, and remove the standalone InkFig word below the forgot-password logo.

### Changes

- Replaced the signup page's bottom text language switch with the shared icon language toggle beside the theme toggle.
- Replaced the password-reset page's bottom text language switch with the same fixed control pair.
- Kept both control pairs anchored at the physical top-right through language and theme changes by reusing the established authentication control group.
- Removed the standalone InkFig brand-name line between the password-reset logo and heading while retaining the logo and accessible alt text.
- Added regression coverage for both page integrations and the removed password-reset brand label.

### Repositories

- inkfig-user-FE: updated signup and password-reset presentation.
- inkfig-user-system: no changes required.
- inkfig-main-system: no changes required.

### Files

- src/features/auth/SignupPage.tsx: uses the fixed language/theme control pair and removes the old text language switch.
- src/features/auth/PasswordResetPage.tsx: uses the fixed language/theme control pair and removes the redundant InkFig label and old text switch.
- tests/foundation.test.mjs: verifies both control integrations and label removal.
- AGENT_FEATURE_LOG.md: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, role, permission, or data-scope behavior changed.
- Backend authorization remains authoritative.

### Frontend

- Signup and password reset now match sign-in with fixed language and theme icon buttons at the top-right.
- Switching Arabic/English or light/dark mode does not move the controls.
- Password reset no longer shows a separate InkFig word beneath the logo.
- Form behavior, validation, routing, responsive layout, and background artwork are unchanged.

### Verification

- [passed] npm.cmd test - 22 tests passed.
- [passed] npm.cmd run build - TypeScript checks and Vite production build succeeded.
- [passed] git diff --check
- [not run] live browser visual inspection - the in-app browser was unavailable in this session.

### Deployment

- Pushing main triggers the existing Cloudflare frontend deployment workflow.
- No backend deployment, migration, secret, or environment-variable change is required.

### Git

- Branch: main
- Commit: this ticket's focused commit.
- Push: pushed directly to origin/main after synchronization.

### Notes

The shared controls reuse the existing sign-in implementation and styles; no new theme or localization behavior was introduced.

## 2026-10-04 - Add homepage artwork-category filters

### Request

Create Digital Art, Hand Art, Video, Audio, Animation, Games, Interactive, and VR/AR categories and place them on the homepage as navigation filters.

### Changes

- Added a canonical eight-category configuration with stable backend codes.
- Added an accessible filter group below the homepage collection heading, including an All Works option.
- Added active-state styling, `aria-pressed` state, and horizontal overflow for narrow screens.
- Reloads the public feed from the backend whenever the selected category changes.
- Added English and Arabic labels for all requested categories and removed obsolete placeholder categories.
- Added dark-theme filter styling consistent with the existing gallery palette.
- Extended the works client with an encoded optional `type_code` query parameter.
- Added regression coverage for every canonical category, localized keys, accessibility state, API query construction, and dark styling.

### Repositories

- `inkfig-user-FE`: adds the localized functional homepage filter.
- `inkfig-main-system`: seeds the categories and authoritatively filters published works.
- `inkfig-user-system`: no changes required.

### Files

- `src/features/home/HomePage.tsx`: renders and controls the category filter.
- `src/features/works/worksApi.ts`: sends the optional encoded type code.
- `src/i18n/resources.ts`: localizes all eight categories in English and Arabic.
- `src/styles.css`: styles filter controls in light, dark, desktop, and narrow layouts.
- `tests/foundation.test.mjs`: verifies the complete category-filter contract.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

- Calls `GET /api/v1/works?type_code=<canonical-code>` when a category is selected.
- Calls the existing unfiltered `GET /api/v1/works` endpoint for All Works.
- Response handling and authentication headers remain unchanged.

### Database

- Paired backend migration: `20261004_001_seed_work_categories.sql` in `inkfig-main-system`.
- No frontend migration is required.

### Permissions and scope

- Category filters are public navigation controls and grant no permissions.
- The backend remains authoritative for publication visibility and category filtering.
- Like operations still require an authenticated session.

### Frontend

- Homepage visitors can navigate between All Works, Digital Art, Hand Art, Video, Audio, Animation, Games, Interactive, and VR/AR.
- Labels follow the current Arabic/English locale and the active category is exposed visually and through `aria-pressed`.
- Existing gallery cards, uploads, likes, themes, responsive behavior, and RTL layout are preserved.

### Verification

- `[passed] npm test` - 23 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[failed] initial npm test` - an older assertion required a literal `/works` URL; it was updated for the optional encoded query and the full suite then passed.
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Deploy `inkfig-main-system` and run migration `20261004_001_seed_work_categories.sql` first.
- Deploy this frontend second through the existing Cloudflare workflow.
- No new frontend environment variables are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

Filters request fresh backend results instead of filtering only the currently loaded page, so navigation remains correct as the gallery grows.

## 2026-10-04 - Match homepage theme icon to navbar

### Request

Make the homepage dark-mode icon background compatible with the navbar background.

### Changes

- Matched the homepage theme-toggle background to the navbar's translucent cream surface in light mode.
- Matched its border and moon color to the navbar's olive palette.
- Matched the same control to the navbar's deep translucent surface, border, and light icon color in dark mode.
- Added restrained theme-specific hover surfaces without affecting navbar layout.
- Scoped every rule to `.gallery-header .theme-toggle`, leaving authentication and other theme controls unchanged.
- Added regression coverage for the exact light and dark navbar surface values.

### Repositories

- `inkfig-user-FE`: updated homepage navbar theme-toggle styling and tests.
- `inkfig-main-system`: no changes required.
- `inkfig-user-system`: no changes required.

### Files

- `src/styles.css`: coordinates the homepage theme icon with both navbar themes.
- `tests/foundation.test.mjs`: verifies the navbar-matching surfaces.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The homepage moon button now blends with the light navbar instead of appearing as a separate white block.
- In dark mode, the sun button blends with the dark navbar.
- Homepage content, category filters, gallery cards, authentication controls, and responsive behavior remain unchanged.

### Verification

- `[passed] npm test` - 24 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No backend, database, environment-variable, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pushed directly to `origin/main` after synchronization.

### Notes

The control intentionally reuses the navbar's exact alpha-blended background values in each theme for visual continuity.
## 2026-10-04 - Prevent zero-byte artwork upload requests

### Request

Fix artwork upload requests that reached the backend with `file_size: 0` and received a 422 greater-than validation error.

### Changes

- Added client-side validation for empty/unavailable files, the existing 10 MiB maximum, and supported JPEG, PNG, WebP, and GIF MIME types.
- Prevents invalid files from reaching the upload-preparation API and clears the rejected file input so the user can select another image.
- Added localized English and Arabic messages explaining empty/unavailable, oversized, unsupported, and missing image selections.
- Retained the backend's authoritative positive-size, MIME-type, and maximum-size validation unchanged.

### Repositories

- `inkfig-user-FE`: added artwork-file validation, localized feedback, and regression coverage.

### Files

- `src/features/works/worksApi.ts`: defines shared upload limits and validates the file before requesting a signed upload URL.
- `src/features/works/UploadWorkPage.tsx`: validates on selection and submission and displays the appropriate localized message.
- `src/i18n/resources.ts`: adds English and Arabic file-validation messages.
- `tests/foundation.test.mjs`: verifies empty-size, maximum-size, MIME-type, input-reset, and message wiring.

### API

- `POST /api/v1/works/uploads`: request contract is unchanged; the frontend no longer sends requests with `file_size <= 0`, files larger than 10 MiB, or unsupported image MIME types.

### Database

- No migration required.

### Permissions and scope

- Uploading still requires an authenticated user.
- Client-side validation improves feedback; the backend remains authoritative for authentication, ownership, type, and file validation.

### Frontend

- Invalid image selections are rejected immediately with specific localized feedback.
- A zero-byte or unavailable cloud-placeholder file instructs the user to download it locally and select it again.
- Valid upload navigation, signed Storage upload, publication, themes, RTL/LTR behavior, and responsive layout remain unchanged.

### Verification

- `[passed] npm.cmd test — 24 tests passed`
- `[passed] npm.cmd run build — TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare GitHub Actions workflow.
- No backend deployment, migration, secret, or environment-variable change is required.

### Git

- Branch: `main`
- Commit: `cfc74c9`
- Push: `successful`

### Notes

The reported response proves the browser supplied a zero-byte `File`; accepting it in the backend would create an invalid empty Storage object, so the positive-size database/API constraint remains in place.
## 2026-10-04 - Add optional links to artwork uploads

### Request

Add an optional link field to work uploads and safely expose the link on published artwork.

### Changes

- Added an optional complete HTTP/HTTPS link field to the upload form.
- Sends the normalized link or `null` with upload metadata and validates the scheme before making an API request.
- Displays attached links on public artwork cards in a new tab with `noopener noreferrer` protection.
- Added English and Arabic labels, instructions, and invalid-link feedback.
- Intentionally does not perform destination health requests because browser CORS and server-side SSRF concerns make synchronous checks unsafe and unreliable.

### Repositories

- `inkfig-user-FE`: added link input, validation, API mapping, feed rendering, localization, styling, and tests.
- `inkfig-main-system`: persists and validates the link in a paired change.

### Files

- `src/features/works/UploadWorkPage.tsx`: adds the optional link field and validation feedback.
- `src/features/works/worksApi.ts`: validates, sends, and types nullable work links.
- `src/features/home/HomePage.tsx`: renders safe external links on work cards.
- `src/i18n/resources.ts`: localizes link UI and validation.
- `src/styles.css`: styles work-card links.
- `tests/foundation.test.mjs`: verifies URL schemes, request mapping, input, and safe link attributes.

### API

- `POST /api/v1/works/uploads`: sends optional `external_url` as a full HTTP/HTTPS URL or `null`.
- `GET /api/v1/works`: consumes nullable `external_url` on feed items.

### Database

- No migration in this repository. Paired migration: `inkfig-main-system/migrations/20261004_002_add_work_external_url.sql`.

### Permissions and scope

- Uploads remain restricted to authenticated users; links become public only with published works.
- Frontend validation improves feedback while backend validation remains authoritative.

### Frontend

- Upload form includes an optional URL control with a complete-address hint.
- Invalid or unsafe schemes are rejected before upload.
- Published work links open in a separate tab without granting opener access.
- Existing image validation, upload flow, localization, responsive behavior, and likes remain unchanged.

### Verification

- `[passed] npm.cmd test — 24 tests passed`
- `[passed] npm.cmd run build — TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-main-system` and its migration before deploying `inkfig-user-FE`.
- No frontend environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `f58d5ca`
- Push: `successful`

### Notes

Live availability is not guaranteed by syntactic validation; destination sites can become unavailable at any time.
## 2026-10-04 - Support multiple artwork links

### Request

Allow multiple safe optional links on each uploaded work.

### Changes

- Added dynamic add/remove controls for up to 10 links with optional labels.
- Rejects incomplete, non-HTTP/HTTPS, duplicate, or excessive links before upload.
- Renders all published links safely in new tabs with `noopener noreferrer` and responsive styling.

### Repositories

- `inkfig-user-FE`: multi-link form, request mapping, feed rendering, localization, styling, and tests.
- `inkfig-main-system`: paired persistence and migration.

### Files

- `src/features/works/UploadWorkPage.tsx`: dynamic link rows.
- `src/features/works/worksApi.ts`: validates and sends link arrays.
- `src/features/home/HomePage.tsx`: renders ordered links.
- `src/i18n/resources.ts`, `src/styles.css`, `tests/foundation.test.mjs`: localized responsive UI and coverage.

### API

- `POST /api/v1/works/uploads`: sends up to 10 `{url,label}` links.
- `GET /api/v1/works`: consumes the ordered `links` array.

### Database

- No frontend migration; paired backend migration is `20261004_003_create_work_links.sql`.

### Permissions and scope

- Upload remains authenticated; published links are public; backend validation is authoritative.

### Frontend

- Users can add/remove up to 10 labeled links; mobile rows stack responsively and links open safely.

### Verification

- `[passed] npm.cmd test — 24 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy backend first, then frontend. No environment changes.

### Git

- Branch: `main`
- Commit: `e22cfcd`
- Push: `successful`

### Notes

No live destination health check is performed because availability is transient and arbitrary server requests require dedicated SSRF defenses.

## 2026-10-04 - Add artwork detail popup

### Request

Open a polished popup card when a visitor selects an artwork image and show the work's full public information.

### Changes

- Added an artwork detail modal containing the full image, title, artist, localized type, description, localized upload date and time, like count/state, and every related link.
- Kept likes synchronized between the gallery card and the popup through the existing authenticated like workflow.
- Added close-button, backdrop, and Escape-key dismissal, background scroll locking, initial close-button focus, reduced-motion support, RTL layout, dark theme, and responsive mobile presentation.
- Kept the existing public feed, upload behavior, API contract, and authorization rules unchanged.

### Repositories

- `inkfig-user-FE`: added the artwork detail interaction and presentation.

### Files

- `src/features/home/ArtworkDetailModal.tsx`: added the accessible detail modal.
- `src/features/home/HomePage.tsx`: opens the modal from an artwork image and shares live work state.
- `src/i18n/resources.ts`: added English and Arabic detail-view messages.
- `src/styles.css`: added responsive, themed popup styling and motion.
- `tests/foundation.test.mjs`: added detail-popup regression coverage.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Artwork details remain publicly visible to guests and authenticated users.
- Only authenticated users can like or unlike a work; the backend continues to validate authorization.
- No role, ownership, or data scope changed.

### Frontend

- Selecting an artwork image opens a localized modal with all public metadata already returned by the feed.
- The modal supports desktop and mobile layouts, RTL/LTR, light/dark themes, loading-independent local rendering, safe external links, keyboard dismissal, and reduced motion.
- Empty descriptions use a localized fallback and the links section is omitted when no links exist.

### Verification

- `[passed] npm.cmd test — 25 tests passed`
- `[passed] npm.cmd run build — TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`
- `[not run] browser interaction test — automated source, accessibility-contract, and production-build checks cover this frontend-only change`

### Deployment

- Deploy `inkfig-user-FE`.
- No migration, environment-variable, backend, or ordering changes are required.

### Git

- Branch: `main`
- Commit: `7be7e31`
- Push: `successful`

### Notes

The modal displays all public work fields intended for visitors; internal identifiers and storage metadata remain hidden from the UI.

## 2026-10-04 - Add user profile page

### Request

Add a profile page that shows each authenticated user their own posts and a section named Likes containing works they liked.

### Changes

- Added a protected localized profile page with user identity, Posts, and Likes sections.
- Added responsive artwork grids, counts, empty states, loading and error states, mobile navigation, RTL, and dark-theme styling.
- Linked the user's name in the homepage navigation to their profile.
- Reused the artwork detail popup and existing optimistic like workflow; unliked works leave the Likes collection.
- Kept signup, login, uploads, public gallery, and other navigation unchanged.

### Repositories

- `inkfig-user-FE`: added the profile route, API calls, UI, localization, styles, and tests.
- `inkfig-main-system`: provides backend-scoped posts and likes feeds.

### Files

- `src/features/profile/ProfilePage.tsx`: added the protected profile experience.
- `src/features/works/worksApi.ts`: added current-user posts and liked-work requests.
- `src/app/AppRouter.tsx`: added `/:language/profile`.
- `src/features/home/HomePage.tsx`: linked the authenticated user's name to the profile.
- `src/i18n/resources.ts`, `src/styles.css`, `tests/foundation.test.mjs`: localization, responsive presentation, and regression coverage.

### API

- `GET /api/v1/works/me`: loads the authenticated user's published posts.
- `GET /api/v1/works/likes`: loads published works liked by the authenticated user.
- Both requests send the current access token and handle loading or request failure without exposing stale data.

### Database

No migration required.

### Permissions and scope

- The profile route redirects guests to the localized sign-in page.
- Posts and likes are scoped from the authenticated token by the backend, not a client-provided user ID.
- Like changes remain backend-authorized.

### Frontend

- Added `/:language/profile`, linked from the homepage user name.
- Shows profile identity, Posts and Likes collections, counts, empty states, error/loading feedback, detail dialogs, and responsive mobile layouts.
- Supports English, Arabic, RTL/LTR, light/dark themes, and existing safe external links.

### Verification

- `[passed] npm.cmd test — 26 tests passed`
- `[passed] npm.cmd run build — TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-main-system` first, then deploy `inkfig-user-FE`.
- No migration or frontend environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `9d98b42`
- Push: `successful`

### Notes

The initial UI displays the latest 50 items in each collection; load-more controls can consume the existing cursor in a later ticket.

## 2026-10-04 - Convert profile collections to navigation tabs

### Request

Present Posts and Likes as profile navigation instead of vertically stacked sections.

### Changes

- Replaced the stacked Posts and Likes collections with a tab-style profile navigation bar.
- Displays only the selected collection and keeps each collection's item count in its navigation tab.
- Added accessible tab roles, selected state, panel relationships, responsive equal-width mobile tabs, subtle panel transitions, dark theme, RTL behavior, and reduced-motion handling.
- Kept profile loading, errors, empty states, artwork details, and like behavior unchanged.

### Repositories

- `inkfig-user-FE`: changed the profile collection presentation to tabbed navigation.

### Files

- `src/features/profile/ProfilePage.tsx`: added active-tab state and accessible tab panels.
- `src/i18n/resources.ts`: added the localized profile-navigation label.
- `src/styles.css`: added responsive themed tab navigation and panel motion.
- `tests/foundation.test.mjs`: verifies the tab navigation contract.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Profile access remains limited to authenticated users.
- Backend ownership and liked-work scope remain authoritative and unchanged.

### Frontend

- Posts is selected by default.
- Selecting Posts or Likes switches the visible collection without navigating away or reloading data.
- Loading, error, empty, mobile, RTL/LTR, dark-theme, and reduced-motion states remain supported.

### Verification

- `[passed] npm.cmd test — 26 tests passed`
- `[passed] npm.cmd run build — TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, environment-variable, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: `0723dce`
- Push: `successful`

### Notes

Both collections are loaded together when the profile opens so switching tabs is immediate.
## 2026-10-04 - Feature the Ink your world homepage hero

### Request

Replace the homepage phrase "Art lives where ideas are shared" with "Ink your world" and give it a catchy, noticeable presentation suited to the InkFig theme.

### Changes

- Replaced the previous homepage headline with a three-line "INK / YOUR / WORLD" typographic lockup.
- Styled the first line as a strong solid wordmark, the middle line with a burgundy outline, and the final line in InkFig olive for a clear visual rhythm tied to the brand palette.
- Added a subtle shadow, condensed display typography, fluid sizing, mobile scaling, and coordinated light/dark-theme colors.
- Added a natural three-line Arabic adaptation while preserving a localized accessible headline for assistive technology.
- Added regression coverage for the new headline structure, localization, and signature colors.

### Repositories

- inkfig-user-FE: updated the localized homepage hero and regression coverage.
- inkfig-main-system: no changes required.
- inkfig-user-system: no changes required.

### Files

- src/features/home/HomePage.tsx: renders the accessible three-line hero lockup.
- src/i18n/resources.ts: replaces the old headline and adds English and Arabic line translations.
- src/styles.css: adds responsive brand-themed typography for light, dark, LTR, and RTL modes.
- tests/foundation.test.mjs: verifies the hero structure, copy, and visual tokens.
- AGENT_FEATURE_LOG.md: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, role, permission, ownership, or data scope changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The homepage now opens with a bold, stacked "INK YOUR WORLD" statement.
- English uses the requested phrase; Arabic uses the localized "ارسم عالمك بالحبر" treatment.
- The lockup scales fluidly across desktop and mobile and adapts to both themes.
- Gallery content, navigation, category filters, artwork interactions, uploads, and profile behavior are unchanged.

### Verification

- [passed] npm.cmd test - 27 tests passed.
- [passed] npm.cmd run build - strict TypeScript checks and Vite production build succeeded.
- [passed] git diff --check
- [not run] live browser visual inspection - the in-app browser was unavailable in this session.

### Deployment

- Pushing main triggers the existing Cloudflare frontend deployment workflow.
- No backend deployment, migration, environment-variable, or deployment-order change is required.

### Git

- Branch: main
- Commit: this ticket's focused commit.
- Push: pushed directly to origin/main after synchronization.

### Notes

The outlined middle line deliberately uses the logo's burgundy accent while the final line uses the established gallery olive, making the message distinctive without introducing off-brand colors.

## 2026-10-04 - Redesign the homepage header

### Request

Replace the homepage text-heavy header with an icon-first design: use the shared language icon, add an Instagram-style create button, add a themed search bar, move account actions into a profile menu, and remove Discover, About InkFig, and the standalone logout button.

### Changes

- Replaced the homepage text language switch with the shared localized Languages icon used by authentication pages.
- Removed the Discover and About InkFig header links.
- Added a responsive search bar that filters the currently loaded gallery by artwork title, artist, description, and localized category.
- Replaced the Upload Work text link with a circular plus icon and retained an accessible label and tooltip.
- Added an initial-based profile avatar because the current authenticated session contract does not include a profile-image URL.
- Added a profile menu with user identity, View Profile, Upload Work, appearance/language controls, and Log out.
- Removed the standalone header logout control while retaining the existing backend logout behavior inside the profile menu.
- Added responsive two-row mobile layout, RTL-aware menu positioning, dark-theme styling, focus treatments, and localized empty-search feedback.
- Added regression coverage for structure, functionality, localization, icon controls, and mobile positioning.

### Repositories

- inkfig-user-FE: redesigned the homepage header, added gallery search behavior, localization, styles, and tests.
- inkfig-main-system: no changes required.
- inkfig-user-system: no changes required.

### Files

- src/features/home/HomePage.tsx: implements search, icon controls, the profile/avatar menu, and simplified navigation.
- src/i18n/resources.ts: adds English and Arabic search and profile-menu labels.
- src/styles.css: styles the responsive light/dark/RTL header, search field, create control, avatar, and menu.
- tests/foundation.test.mjs: verifies the new header contract.
- AGENT_FEATURE_LOG.md: records this ticket.

### API

No API changes. Search filters the currently loaded category results in the browser.

### Database

No migration required.

### Permissions and scope

- Profile and upload links preserve their existing authenticated-route behavior.
- Logout continues to invalidate the local session and calls the existing backend logout endpoint.
- No authentication, authorization, role, permission, ownership, or data-scope rule changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- The sticky header now contains the InkFig logo, centered search, language/theme icons, a plus create control, and a profile avatar menu for signed-in users.
- Guests continue to receive Sign in and Sign up actions.
- Search updates gallery results immediately and shows a localized no-results state.
- On narrow screens the search occupies a full second row while primary controls remain visible.
- English positions account actions at the top-right; Arabic mirrors the layout and menu direction.

### Verification

- [passed] npm.cmd test - 28 tests passed.
- [passed] npm.cmd run build - strict TypeScript checks and Vite production build succeeded.
- [passed] git diff --check
- [failed] initial npm.cmd test - the existing theme-selector assertion and new mobile-placement assertion exposed two CSS selector/edit issues; both were corrected and the full suite passed.
- [not run] live browser visual inspection - the in-app browser was unavailable in this session.

### Deployment

- Pushing main triggers the existing Cloudflare frontend deployment workflow.
- No backend deployment, migration, environment-variable, or deployment-order change is required.

### Git

- Branch: main
- Commit: this ticket's focused commit.
- Push: pushed directly to origin/main after synchronization.

### Notes

A real profile photo can replace the initial avatar once the user/session API exposes an avatar URL; this ticket does not invent or persist profile-image data.

## 2026-10-05 - Use secure cookie sessions with automatic refresh

### Request

Stop storing authentication tokens in browser storage, use secure HTTP-only cookies, and keep sessions working after the 15-minute access token expires.

### Changes

- Removed access and refresh tokens from frontend types, login handling, localStorage, and API method parameters.
- All API requests include cookies without exposing their values to JavaScript.
- A main-API 401 triggers one shared refresh request and retries the original request once.
- Concurrent expired requests share one refresh operation; failure clears local session metadata.
- Legacy localStorage records are sanitized to retain only non-secret user metadata.
- Preserved the concurrently added homepage hero, search, and profile-menu changes during rebase.

### Repositories

- `inkfig-user-FE`: credentialed requests, automatic refresh, and token-free session state.
- `inkfig-user-system`: sets and rotates HTTP-only cookies.
- `inkfig-main-system`: validates the access cookie.

### Files

- `src/api/httpClient.ts`: credentials, single-flight refresh, retry, and expiry event.
- `src/features/auth/AuthContext.tsx`: token-free persisted metadata and expiry handling.
- `src/features/auth/authenticationApi.ts`, `LoginPage.tsx`, `src/shared/types.ts`: token-free session handling.
- Work, home, profile, upload, and like clients: removed bearer-token plumbing.
- `tests/foundation.test.mjs`: verifies cookie credentials, refresh, and absence of stored tokens.

### API

- Authentication responses contain token-free session metadata; cookies carry credentials.
- Main API requests retry once after successful `POST /api/v1/auth/refresh`.
- No token value is read or sent by frontend JavaScript.

### Database

No migration required.

### Permissions and scope

- Protected routes and actions remain backend-authorized.
- Cookies follow browser Domain, Path, Secure, HttpOnly, and SameSite rules.
- Failed refresh removes the local signed-in presentation.

### Frontend

- Sessions survive access-token expiry and browser reload while the 30-day refresh cookie is valid.
- Login, logout, upload, profile, likes, localization, responsive behavior, loading states, and errors remain supported.

### Verification

- `[passed] npm.cmd test — 27 tests passed before rebase; full suite rerun after conflict resolution`
- `[passed] npm.cmd run build before rebase; production build rerun after conflict resolution`
- `[passed] git diff --check`

### Deployment

- Deploy after both backends through the existing Cloudflare workflow.
- No frontend environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `8afb837`
- Push: `successful`

### Notes

Only non-secret profile metadata remains in localStorage; tokens are inaccessible to frontend JavaScript.

## 2026-10-05 - Display homepage cards as Pinterest-style pins

### Request

Change only the way homepage artwork cards are displayed so the gallery resembles Pinterest.

### Changes

- Changed the homepage to a denser five-column masonry-style pin layout while preserving each image's natural aspect ratio.
- Made cards image-first with rounded media, compact title, artist and category metadata, hover shading, and an overlaid like control.
- Added responsive three-column tablet, two-column mobile, and one-column very-narrow layouts.
- Kept search, category filters, API loading, popup details, links, authentication, uploads, and profile cards unchanged.

### Repositories

- `inkfig-user-FE`: updated homepage artwork-card presentation only.

### Files

- `src/features/home/HomePage.tsx`: changed pin card markup and overlay like placement.
- `src/styles.css`: added Pinterest-style masonry density, image-first surfaces, hover behavior, and responsive columns.
- `tests/foundation.test.mjs`: updated gallery presentation coverage while retaining safe-link checks in the detail popup.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Public artwork visibility and authenticated like permissions are unchanged.
- Backend authorization remains authoritative.

### Frontend

- Desktop displays up to five masonry columns, tablets three, mobile two, and very narrow screens one.
- Natural image dimensions create varied pin heights; complete details and links remain in the popup.
- Touch devices keep the like control visible because hover is unavailable.

### Verification

- `[passed] npm.cmd test — 29 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, environment-variable, or deployment-order changes are required.

### Git

- Branch: `main`
- Commit: `1f8bcc9`
- Push: `successful`

### Notes

This ticket changes only card presentation; data pagination and loading behavior were intentionally left unchanged.

## 2026-10-05 - Simplify homepage pin metadata

### Request

Show only the uploader, artwork type, and like count on homepage pins and remove the artwork name.

### Changes

- Removed the artwork title from homepage pin metadata.
- Kept the uploader name and localized artwork type below each image.
- Kept the like count visible over the image for authenticated users and guests.
- Left the complete artwork title, description, date, links, and likes available in the detail popup.

### Repositories

- `inkfig-user-FE`: simplified homepage pin content.

### Files

- `src/features/home/HomePage.tsx`: removed the title from pins while retaining uploader, type, and likes.
- `src/styles.css`: adjusted compact uploader styling and made like counts persistently visible.
- `tests/foundation.test.mjs`: verifies the requested metadata contract.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Guests can view like counts but cannot change likes.
- Authenticated like actions remain backend-authorized.

### Frontend

- Homepage pins show the image, uploader, type, and like count only.
- Search, filters, popup details, profile layout, loading, errors, localization, themes, and responsive behavior are unchanged.

### Verification

- `[passed] npm.cmd test — 29 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment changes are required.

### Git

- Branch: `main`
- Commit: `830fbcd`
- Push: `successful`

### Notes

None.

## 2026-10-05 - Add artwork tags and uploader hover overlay

### Request

Display each artwork type as a familiar tag and reveal the uploader name professionally when the user hovers over the artwork.

### Changes

- Added an always-visible pill-shaped tag over each artwork image for its localized type.
- Added a glass-style uploader overlay that fades and slides into view on hover or keyboard focus.
- Kept uploader information visible on touch-only devices, where hover is unavailable.
- Kept the like count visible and left artwork popup details and interactions unchanged.

### Repositories

- `inkfig-user-FE`: updated homepage artwork-card presentation.

### Files

- `src/features/home/HomePage.tsx`: added the localized type tag and uploader overlay to each pin.
- `src/styles.css`: styled the tag and accessible responsive uploader reveal effect.
- `tests/foundation.test.mjs`: added coverage for tag and hover-overlay markup and styling.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Guests and authenticated users can see artwork types, uploader names, and like counts.
- Only authenticated users can change likes; backend authorization remains authoritative.

### Frontend

- Homepage artwork types appear as compact rounded tags over their images.
- Uploader names appear on pointer hover and keyboard focus, with a permanent touch-device fallback.
- Existing localization, RTL/LTR placement, responsive masonry layout, loading, empty, and error states remain intact.

### Verification

- `[passed] npm.cmd test - 29 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No migrations, backend deployment, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `5530cda`
- Push: `successful`

### Notes

Touch devices show uploader names persistently because they do not provide a dependable hover interaction.
## 2026-10-05 - Add role-aware frontend access

### Request

Make the frontend follow InkFig roles and permissions and provide role/account controls for administrators.

### Changes

- Stores role and permissions in token-free session metadata.
- Guards upload and profile routes by permission.
- Prevents unauthorized like actions.
- Added a responsive user-administration page for role and account-status changes.
- Frontend checks improve navigation only; backend remains authoritative.

### Repositories

- `inkfig-user-FE`: added role-aware navigation, guards, and administration.
- `inkfig-user-system`: supplies sessions and administration APIs.
- `inkfig-main-system`: enforces work permissions.

### Files

- `src/features/admin/AdminUsersPage.tsx`: administration table and controls.
- `src/features/admin/administrationApi.ts`: account-management requests.
- `src/shared/types.ts`, auth context/API/login: preserve role and permissions.
- Upload, profile, and home features apply permission checks.
- `src/styles.css`: responsive administration layout.

### API

- Consumes `GET /api/v1/admin/users`.
- Consumes `PATCH /api/v1/admin/users/{user_id}/role`.
- Consumes `PATCH /api/v1/admin/users/{user_id}/status`.

### Database

No migration required in this repository; user-system migration 007 is required.

### Permissions and scope

- users.read guards the administration route.
- works.upload guards upload; profile.read_own guards profile; works.like guards likes.
- Backend validates every operation and role hierarchy.

### Frontend

- Added `/:language/admin/users`.
- Includes loading/error handling, responsive rows, role selection, ban/activate controls, and self-management prevention.
- Public homepage remains available to everyone.

### Verification

- `[passed] npm.cmd test - 29 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy after both backends and migration 007.
- No frontend environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `9b255d3`
- Push: `successful`

### Notes

Existing locally stored sessions without a role are discarded and require one new login.

## 2026-10-05 - Color-code artwork type tags

### Request

Give every artwork type a distinct, highly polished tag color so categories are easy to distinguish.

### Changes

- Added a curated eight-color palette for the canonical artwork categories.
- Upgraded tags with translucent gradients, coordinated borders and text, an accent marker, blur, and layered shadows.
- Added deterministic fallback coloring for future work types so the same type always receives the same tone.
- Kept the tag position, localized label, Pinterest card layout, uploader hover, and like count unchanged.

### Repositories

- `inkfig-user-FE`: added professional category-specific tag styling.

### Files

- `src/features/home/HomePage.tsx`: maps canonical and future work types to stable color tones.
- `src/styles.css`: defines the polished tag system and eight accessible palettes.
- `tests/foundation.test.mjs`: verifies tone selection and representative palette classes.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Tags remain public for guests and authenticated roles.
- No authorization or data scope changed; backend authorization remains authoritative.

### Frontend

- Digital art uses violet, hand art terracotta, video crimson, audio teal, animation amber, games blue, interactive emerald, and VR/AR magenta.
- English and Arabic labels, RTL/LTR placement, responsive behavior, and both themes are preserved.

### Verification

- `[passed] npm.cmd test - 29 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`
- `[not run] browser visual inspection - browser-control runtime unavailable in this session`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `091c8ca`
- Push: `successful`

### Notes

Future unknown types use a stable type-ID hash across the same curated palette rather than an arbitrary color.

## 2026-10-05 - Show artwork type tags on profiles

### Request

Show each artwork's colored type tag on profile cards.

### Changes

- Added the existing professional color-coded type tag to every card in both Posts and Likes.
- Displays the localized Arabic or English type name according to the active language.
- Positioned the tag over the image while preserving the title and like-count footer.
- Kept profile navigation, popup details, like behavior, permissions, and responsive grid unchanged.

### Repositories

- `inkfig-user-FE`: extended the type-tag presentation to profile artwork cards.

### Files

- `src/features/profile/ProfilePage.tsx`: renders localized, color-coded type tags in both collections.
- `src/styles.css`: establishes profile cards as the positioning context and preserves footer styling.
- `tests/foundation.test.mjs`: verifies profile type-tag rendering and tone selection.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Profile access still requires `profile.read_own`.
- Posts and likes remain scoped to the authenticated account by the backend.
- No authorization behavior changed.

### Frontend

- Profile Posts and Likes now show the same type colors used on homepage pins.
- RTL/LTR placement, localization, dark/light themes, loading, empty, and error states remain supported.

### Verification

- `[passed] npm.cmd test - 29 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `f327c96`
- Push: `successful`

### Notes

None.

## 2026-10-05 - Restore the earlier homepage card layout

### Request

Restore the previous homepage artwork-card layout after the gallery had been changed to a denser Pinterest-style arrangement, and provide a visual preview.

### Changes

- Restored the earlier responsive masonry column counts and spacing without reverting the current card content or styling.
- Desktop now uses three wider 300px-target columns with 22px gaps.
- Tablet widths use two 240px-target columns with 18px gaps.
- Mobile widths use one column.
- Preserved natural image proportions, colored artwork tags, uploader hover overlays, like counts, search, filters, and detail popups.

### Repositories

- `inkfig-user-FE`: changed homepage gallery layout and regression coverage.
- `inkfig-main-system`: no changes required.
- `inkfig-user-system`: no changes required.

### Files

- `src/styles.css`: restores the earlier three-, two-, and one-column responsive masonry layout.
- `tests/foundation.test.mjs`: verifies the restored desktop, tablet, and mobile column rules.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, role, permission, ownership, or data-scope behavior changed.
- Backend authorization remains authoritative.

### Frontend

- Homepage cards are larger and less dense: three columns on desktop, two on tablet, and one on mobile.
- Current card tags, hover behavior, likes, localization, RTL/LTR behavior, and themes remain unchanged.
- Profile-page card layout is unchanged.

### Verification

- `[passed] npm.cmd test` - 29 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[passed] Playwright visual inspection` - a browser-only mocked feed confirmed three wide masonry columns at desktop width; the mock did not modify source or production data.

### Deployment

- Push `inkfig-user-FE` directly to `main` to trigger the existing Cloudflare deployment workflow.
- No backend deployment, migration, secret, environment-variable, or deployment-order change is required.

### Notes

Only layout density was restored. The older bordered card design and title-heavy metadata were intentionally not reintroduced because the request was specifically about card layout.

## 2026-10-05 - Use four gallery columns and two on mobile

### Request

Display homepage artwork in four columns on desktop and two columns on mobile using a responsive best-practice implementation, while ensuring images are not stretched beyond their natural proportions.

### Changes

- Replaced preferred-width column shorthand with explicit masonry column counts so responsive behavior is deterministic.
- Uses four columns on large screens, three on medium screens, and two at tablet and mobile widths.
- Tightens column gaps progressively for smaller screens while retaining usable image widths.
- Preserved `width: 100%` with `height: auto` so every artwork keeps its source aspect ratio and card height follows the rendered image.
- Preserved tags, uploader overlays, like counts, search, filters, detail popups, localization, and themes.

### Repositories

- `inkfig-user-FE`: updated homepage masonry layout and regression coverage.
- `inkfig-main-system`: no changes required.
- `inkfig-user-system`: no changes required.

### Files

- `src/styles.css`: defines explicit four-, three-, and two-column responsive masonry counts and automatic image height.
- `tests/foundation.test.mjs`: verifies all column breakpoints and natural image sizing.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, role, permission, ownership, or data-scope behavior changed.
- Backend authorization remains authoritative.

### Frontend

- Desktop: four artwork columns.
- Medium screens: three artwork columns.
- Tablet and mobile: two artwork columns, including a 390px mobile viewport.
- Artwork images retain their natural aspect ratios with automatic rendered height; no fixed image height or cropping was introduced.
- Profile-page cards remain unchanged.

### Verification

- `[passed] npm.cmd test` - 29 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[passed] Playwright desktop verification` - computed `column-count` was 4 at 1440px; the sample image rendered proportionally at 326.982px × 420.399px.
- `[passed] Playwright mobile verification` - computed `column-count` was 2 at 390px; the same sample image rendered proportionally at 162.963px × 209.52px.

### Deployment

- Push `inkfig-user-FE` directly to `main` to trigger the existing Cloudflare deployment workflow.
- No backend deployment, migration, secret, environment-variable, or deployment-order change is required.

### Notes

CSS multi-column layout remains appropriate for the existing masonry reading order and variable image heights. Explicit column counts prevent width heuristics from unexpectedly reducing mobile to one column.

## 2026-10-05 - Close the profile menu on outside click

### Request

Close the navbar profile menu whenever the user clicks anywhere outside the open menu.

### Changes

- Added a typed React reference to the native profile-menu `details` element.
- Added a document-level `pointerdown` listener that closes the menu only when it is open and the event target is outside the menu.
- Preserved clicks inside the profile popover so links, language switching, theme switching, and logout remain usable.
- Added effect cleanup that removes the document listener when the homepage unmounts.
- Added regression coverage for the reference, containment check, close operation, and cleanup.

### Repositories

- `inkfig-user-FE`: adds outside-click behavior and test coverage.
- `inkfig-main-system`: no changes required.
- `inkfig-user-system`: no changes required.

### Files

- `src/features/home/HomePage.tsx`: detects outside pointer presses and closes the profile menu.
- `tests/foundation.test.mjs`: verifies the complete outside-click lifecycle.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No authentication, authorization, roles, permissions, or access scopes changed.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Clicking outside an open navbar profile menu closes it immediately.
- Clicking the profile avatar still uses the native `details` toggle behavior.
- Interacting inside the menu does not trigger the outside-close behavior.
- Menu styling, navigation, theme controls, localization, and responsive layout remain unchanged.

### Verification

- `[passed] npm test` - 30 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no browser surface is available in this session.

### Deployment

- Merge the dedicated branch through the normal pull-request workflow; the existing Cloudflare frontend deployment workflow runs after merge to `main`.
- No backend, migration, environment-variable, or deployment-order changes are required.

### Git

- Branch: `fix/profile-menu-outside-click`
- Commit: this ticket's focused commit.
- Push: dedicated branch pushed to `origin` after synchronization with the latest `origin/main`.

### Notes

`pointerdown` is used so mouse, touch, and pen interactions all close the menu consistently.

## 2026-10-05 - Add artwork bookmarks and Saved profile tab

### Request

Show registered users an Instagram-style save icon at the bottom-right of homepage cards on hover, turn it yellow after saving, and list saved artwork in a profile section like Likes.

### Changes

- Added an authenticated bookmark button to homepage artwork cards.
- Shows the button on hover or keyboard focus, keeps saved bookmarks visible, and exposes it on touch devices.
- Uses optimistic save/unsave updates with rollback when the backend request fails.
- Turns the active bookmark yellow and localizes save/remove accessible labels.
- Added a Saved profile tab with count, empty state, responsive artwork grid, and yellow bookmark markers.
- Loads saved works with Posts and Likes and keeps like-state updates synchronized across all profile collections.
- Hides the save control unless the current signed session has works.save.
- Added regression coverage for API mapping, permission gating, styling, localization, and profile integration.

### Repositories

- inkfig-user-FE: bookmark interaction, Saved tab, localization, styles, and tests.
- inkfig-main-system: paired persistence and save APIs.
- inkfig-user-system: paired works.save permission migration.

### Files

- src/features/home/HomePage.tsx: adds the authorized optimistic bookmark overlay.
- src/features/profile/ProfilePage.tsx: adds the Saved tab and collection.
- src/features/works/worksApi.ts: maps saved_by_me and save/saved-feed requests.
- src/i18n/resources.ts: adds English and Arabic save/profile labels.
- src/styles.css: adds hover, focus, touch, and yellow saved-state styling.
- tests/foundation.test.mjs: verifies the complete save UI contract.
- AGENT_FEATURE_LOG.md: records this ticket.

### API

- Consumes GET /api/v1/works/saves.
- Consumes PUT and DELETE /api/v1/works/{work_id}/save.
- Consumes saved_by_me on published-work responses.

### Database

No frontend migration. Paired migrations are inkfig-user-system/20261005_008_add_work_save_permission.sql and inkfig-main-system/20261005_004_create_work_saves.sql.

### Permissions and scope

- The bookmark renders only for authenticated sessions with works.save.
- Guests and viewer-only roles receive no save control.
- The backend remains authoritative for identity, permission, publication state, and saved-feed scope.

### Frontend

- Hovering or focusing a homepage card reveals the bookmark at its physical bottom-right.
- A saved bookmark stays visible and turns yellow.
- Touch layouts keep the bookmark visible without relying on hover.
- The profile adds a third Saved tab alongside Posts and Likes.
- English, Arabic, RTL/LTR, light/dark themes, and responsive layouts are preserved.

### Verification

- [passed] npm.cmd test - 30 tests passed.
- [passed] npm.cmd run build - strict TypeScript checks and Vite production build succeeded.
- [passed] git diff --check
- [not run] live browser visual inspection - the in-app browser was unavailable in this session.

### Deployment

- Deploy after user-system migration 008/user backend and main-system migration 004/main backend.
- Pushing main triggers the existing Cloudflare frontend deployment workflow.
- No frontend environment-variable change is required.

### Git

- Branch: main
- Commit: this ticket's focused commit.
- Push: pushed directly to origin/main after synchronization.

### Notes

The save control uses the existing cookie-authenticated request flow; no tokens are exposed to frontend code.

## 2026-10-05 - Redesign the gallery shell and card interactions

### Request

Simplify gallery cards, add hover-only social actions, introduce a fixed icon navigation rail, smooth gallery scrolling, a search-first header, Saved navigation, and future-feature templates.

### Changes

- Added a fixed, responsive, theme-aware left navigation rail with the InkFig logo and Home, Exhibition, Upload, Notifications, Saved, and Settings icons.
- Kept Upload connected to the existing publishing flow and linked Saved directly to the user's persisted saved collection.
- Added localized scaffold pages for Exhibition, Notifications, and Settings so each feature can be built independently later.
- Reduced the home header to a full-width rectangular search field and a top-right profile avatar; appearance, language, profile, and logout remain available from the avatar menu.
- Removed uploader and artwork-type overlays from gallery cards, hid like/save actions until hover or keyboard focus, preserved registered-user save authorization, and changed artwork hover cursors to pointers.
- Preserved the full artwork detail dialog on card activation and enabled smooth, reduced-motion-aware scrolling to the gallery.
- Extended the shared rail to Profile and Upload, and made profile tabs addressable through URL search parameters so Saved opens directly.

### Repositories

- `inkfig-user-FE`: implemented the application shell, card interactions, routes, localization, responsive styling, and regression coverage.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/navigation/AppSidebar.tsx`: shared fixed navigation rail.
- `src/features/navigation/FeaturePlaceholderPage.tsx`: localized future-feature scaffold.
- `src/features/home/HomePage.tsx`: simplified header and gallery card overlays.
- `src/features/profile/ProfilePage.tsx`: shared rail and Saved deep-link handling.
- `src/features/works/UploadWorkPage.tsx`: shared rail integration.
- `src/app/AppRouter.tsx`: Exhibition, Notifications, and Settings routes.
- `src/i18n/resources.ts`: localized navigation, placeholders, and concise search placeholder.
- `src/styles.css`: rail, hover, smooth-scroll, responsive, light, and dark styling.
- `tests/foundation.test.mjs`: regression checks for the new shell and interactions.
- `AGENT_FEATURE_LOG.md`: recorded this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Saved actions remain available only to authenticated users with `works.save`.
- Upload authorization and backend enforcement are unchanged.
- No roles, permissions, or backend authorization behavior changed.

### Frontend

- The navigation rail remains fixed while the home gallery scrolls and reserves content width at desktop and mobile sizes.
- The search placeholder is now only `Search` in English and `بحث` in Arabic.
- Artwork cards reveal like/save controls on hover or keyboard focus and open the existing complete detail dialog when selected.
- Smooth scrolling respects `prefers-reduced-motion`.

### Verification

- `[passed] npm test` - 34 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no in-app browser was attached to this workspace.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pending final synchronization and push.

### Notes

- Upload and Saved intentionally remain functional rather than becoming empty templates; Exhibition, Notifications, and Settings are the requested future-feature scaffolds.
## 2026-10-05 - Refine and mirror the gallery navigation shell

### Request

Slightly enlarge the rail logo and icons without widening the rail, equalize and increase their spacing, blend the header into the gallery, extend and sharpen the search field with a darker hover state, reduce and edge-align the avatar, and mirror the shell for Arabic.

### Changes

- Increased navigation icons from 22px to 24px and the rail logo from 44px to 48px while preserving the 78px desktop and 62px mobile rail widths.
- Increased and equalized the visual gaps from the logo through the Saved icon.
- Matched the sticky header surfaces to the gallery's light and dark background colors.
- Extended the search field toward the smaller corner avatar, reduced its radius, and added darker theme-aware hover surfaces.
- Reduced the avatar from 44px to 38px and removed physical edge padding so it sits at the outer corner.
- Added complete RTL shell mirroring: Arabic places the rail and separator on the right, shifts content to the right-side offset, and places the avatar and popover at the left edge.
- Preserved rail widths, routes, permissions, card behavior, and responsive gallery columns.

### Repositories

- `inkfig-user-FE`: refined the responsive and bidirectional gallery shell.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/navigation/AppSidebar.tsx`: slightly enlarged navigation icons.
- `src/styles.css`: refined sizing, spacing, header/search/avatar styling, and RTL physical positioning.
- `tests/foundation.test.mjs`: added regression coverage for the refined bidirectional shell.
- `AGENT_FEATURE_LOG.md`: recorded this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

No authentication, role, permission, ownership, or backend authorization behavior changed.

### Frontend

- English keeps the rail left and avatar right.
- Arabic moves the rail right and avatar left while retaining fixed-on-scroll navigation.
- Light and dark themes receive matching gallery/header surfaces and darker search hover feedback.

### Verification

- `[passed] npm test` - 35 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no in-app browser was attached to this workspace.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pending final synchronization and push.

### Notes

The navigation remains fixed vertically while scrolling; only its physical side changes with the document language.
## 2026-10-05 - Align the gallery header and edge scrollbar

### Request

Move scrolling to a Pinterest-style outer viewport scrollbar, restyle the Upload plus control, and make the smaller profile avatar align exactly with the artwork-card edge while resizing the search field.

### Changes

- Styled the root document scrollbar with theme-aware InkFig colors and a stable outer gutter, leaving the gallery itself free of nested scrolling.
- Added WebKit and standards-based scrollbar treatments for consistent browser-edge presentation in light and dark themes.
- Added a dedicated circular, filled Pinterest-inspired treatment for the Upload plus icon with hover and active states.
- Reduced the profile avatar to 34px on desktop and 32px on mobile.
- Aligned the avatar's outer edge to the gallery cards using the gallery's exact 32px desktop and 20px mobile effective gutters.
- Shortened the search field by the matching aligned avatar gutter while preserving English and Arabic mirroring.

### Repositories

- `inkfig-user-FE`: refined gallery scrolling, upload navigation, avatar sizing, and header alignment.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/navigation/AppSidebar.tsx`: marks the Upload route for dedicated icon styling.
- `src/styles.css`: adds root scrollbar styling, Upload control states, and precise header/avatar alignment.
- `tests/foundation.test.mjs`: verifies the viewport scrollbar, dedicated Upload control, and responsive card-edge alignment.
- `AGENT_FEATURE_LOG.md`: recorded this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

No authentication, role, permission, ownership, or backend authorization behavior changed.

### Frontend

- The browser viewport owns page scrolling; artwork modals retain their intentional internal overflow behavior.
- The avatar and artwork-card outer edges share the same visual guide in English and Arabic.
- The Upload icon remains routed to the existing authorized publishing flow.

### Verification

- `[passed] npm test` - 36 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no in-app browser was attached to this workspace.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pending final synchronization and push.

### Notes

The scrollbar remains at the browser edge rather than becoming a gallery-local scrolling surface.
## 2026-10-05 - Restore the plain Upload icon and center the avatar

### Request

Undo the most recent special Upload-button styling so it is a plain plus again, and center the profile avatar in the full area between the search field and the outer header edge.

### Changes

- Removed the dedicated filled, circular Upload class and all associated light, dark, hover, and active styling.
- Restored Upload to the same plain 24px plus-icon treatment and generic navigation states as the other rail items.
- Replaced edge-alignment positioning with a dedicated 72px profile-control column on desktop and 52px on mobile.
- Centered the compact avatar horizontally within that complete column between the search boundary and header edge.
- Mirrored the centered control column and header padding for Arabic.
- Preserved the viewport scrollbar, avatar size, search behavior, navigation routes, and upload authorization.

### Repositories

- `inkfig-user-FE`: restored the Upload icon and refined header avatar placement.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/navigation/AppSidebar.tsx`: removed the Upload-specific class marker.
- `src/styles.css`: removed Upload-specific styles and added the centered profile-control column.
- `tests/foundation.test.mjs`: updated Upload expectations and added avatar-column regression coverage.
- `AGENT_FEATURE_LOG.md`: recorded this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

No authentication, role, permission, ownership, or backend authorization behavior changed.

### Frontend

- Upload is once again represented by a plain plus icon.
- The avatar is centered between the search edge and header edge in English and Arabic.

### Verification

- `[passed] npm test` - 37 tests passed.
- `[passed] npm run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no in-app browser was attached to this workspace.

### Deployment

- Pushing `main` triggers the existing Cloudflare frontend deployment workflow.
- No environment-variable, backend, or database changes are required.

### Git

- Branch: `main`
- Commit: this ticket's focused commit.
- Push: pending final synchronization and push.

### Notes

The avatar column is explicitly sized, making its centering independent of the search field width.

## 2026-10-05 - Keep save action and type tag in artwork details

### Request

Keep the Save button available after opening an artwork card and show its colored type tag in the popup.

### Changes

- Added Save/Unsave to the shared artwork detail popup instead of limiting it to closed homepage cards.
- Connected popup saving from Home, Posts, Likes, and Saved profile collections.
- Synchronizes saved state across the visible collections after a successful backend request.
- Added the localized, color-coded artwork type tag above the popup title.
- Kept public viewing, likes, links, descriptions, dates, and popup dismissal behavior unchanged.

### Repositories

- `inkfig-user-FE`: fixed popup actions and extended tag presentation.

### Files

- `src/features/home/ArtworkDetailModal.tsx`: renders colored type and permission-controlled Save/Unsave actions.
- `src/features/home/HomePage.tsx`: supplies save permissions and handler to the popup.
- `src/features/profile/ProfilePage.tsx`: supplies profile save behavior and keeps collections synchronized.
- `src/features/works/workTypePresentation.ts`: centralizes stable work-type color selection for popup reuse.
- `src/styles.css`: adds popup tag positioning and polished Like/Save action styling.
- `tests/foundation.test.mjs`: verifies popup Save and tag contracts.

### API

- Uses existing `PUT /api/v1/works/{work_id}/save` and `DELETE /api/v1/works/{work_id}/save` without contract changes.

### Database

No migration required.

### Permissions and scope

- Save/Unsave is displayed only with `works.save`.
- Like remains controlled by `works.like`.
- Public visitors can view popup details and tags but cannot perform protected actions.
- Backend authorization remains authoritative.

### Frontend

- Opened artwork cards show the localized colored type tag and persistent Save/Unsave action.
- Save state stays aligned between Home, Posts, Likes, and Saved collections.
- RTL/LTR, responsive layout, light/dark themes, loading, empty, and error states remain supported.

### Verification

- `[passed] npm.cmd test - 37 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `6049576`
- Push: `successful`

### Notes

The Save button previously disappeared because the shared popup accepted only Like state and callbacks.

## 2026-10-06 - Reveal short save label on hover

### Request

Remove the long “Save artwork” wording and show only “Save” when hovering over the Save button.

### Changes

- Shortened the English action labels to Save and Unsave.
- Shortened the corresponding Arabic labels to حفظ and إلغاء الحفظ.
- Made the popup Save control icon-only at rest and smoothly expand its text on hover or keyboard focus.
- Preserved saved-state color, API behavior, permission checks, and accessibility naming.

### Repositories

- `inkfig-user-FE`: refined the artwork popup Save control.

### Files

- `src/i18n/resources.ts`: replaced long Save/Unsave wording with concise localized labels.
- `src/styles.css`: added icon-only resting state and hover/focus label reveal.
- `tests/foundation.test.mjs`: verifies concise wording and hover behavior.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Save remains available only with `works.save`.
- Backend authorization remains authoritative.

### Frontend

- Popup Save is a compact icon until pointer hover or keyboard focus.
- Saved and unsaved states retain distinct styling and correct localized action text.
- RTL/LTR, responsive layouts, and light/dark themes remain supported.

### Verification

- `[passed] npm.cmd test - 37 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `87e02b0`
- Push: `successful`

### Notes

Keyboard focus reveals the text as well as hover so the control remains understandable without a mouse.

## 2026-10-06 - Align profile cards with home pins

### Request

Display cards in every Profile section exactly like homepage cards, including which information is visible or hidden.

### Changes

- Replaced the Profile-only square card design with the homepage pin markup in Posts, Likes, and Saved.
- Uses natural image proportions and the same responsive masonry column layout as Home.
- Closed cards now show only the artwork image; titles, type tags, and footer metadata were removed.
- Like count and Save actions use the same hover/focus overlays and saved/liked states as Home.
- Full metadata and the colored type tag remain available in the opened artwork popup.
- Removed obsolete Profile-card styling.

### Repositories

- `inkfig-user-FE`: unified Profile and Home card presentation.

### Files

- `src/features/profile/ProfilePage.tsx`: renders homepage-style pins and connects Like/Save actions in all sections.
- `src/styles.css`: changes Profile collections to responsive masonry columns and removes obsolete square-card rules.
- `tests/foundation.test.mjs`: verifies shared pin markup and absence of Profile-only metadata.

### API

No API changes. Existing Like, Save, Posts, Likes, and Saved endpoints are reused.

### Database

No migration required.

### Permissions and scope

- Profile access still requires `profile.read_own`.
- Like requires `works.like`; Save requires `works.save`.
- Posts, Likes, and Saved remain scoped by the backend to the authenticated account.

### Frontend

- Posts, Likes, and Saved now use four masonry columns on desktop, three on tablet, two on mobile, and one on very narrow screens.
- Image dimensions remain natural instead of being cropped into squares.
- Loading, empty, error, popup, theme, localization, RTL/LTR, and responsive behavior remain supported.

### Verification

- `[passed] npm.cmd test - 37 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `90d8d56`
- Push: `successful`

### Notes

The opened popup remains the single place for title, type, uploader, date, description, links, Like, and Save details.

## 2026-10-06 - Make the complete frontend responsive

### Request

Make the full frontend responsive across all screen sizes, including navigation, search, cards, forms, and automatic column counts, while preserving artwork resolution and proportions.

### Changes

- Added one authoritative responsive layer across gallery, profile, navigation, authentication, upload, administration, placeholders, and artwork details.
- Changed Home and Profile masonry grids to calculate column count automatically from available width.
- Preserved natural image aspect ratios with width 100%, height auto, and no initial crop or forced square.
- Converts the desktop side navigation into a fixed, safe-area-aware bottom navigation on screens at or below 720px.
- Compacts the sticky search/header without hiding search or profile access.
- Makes Profile tabs horizontally scrollable, preventing clipped labels and counters.
- Makes the artwork popup full-screen and image-safe on mobile.
- Tightens forms, upload, administration, placeholder, hero, and action controls for narrow screens.
- Added extra-wide and very-narrow behavior, including one column below 360px.

### Repositories

- `inkfig-user-FE`: system-wide responsive styling and regression coverage.

### Files

- `src/styles.css`: adds adaptive columns, mobile navigation, safe areas, responsive pages, and natural-image rules.
- `tests/foundation.test.mjs`: verifies automatic columns, image preservation, mobile navigation, tabs, and breakpoints.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No roles, permissions, ownership rules, or backend authorization changed.
- Responsive presentation does not change feature access.

### Frontend

- Desktop retains the side navigation; phone/tablet layouts use bottom navigation.
- Columns grow and shrink automatically with the available gallery width.
- Below 600px the preferred pin width decreases to retain useful multi-column layouts; below 360px it becomes one column.
- Search, Profile, authentication, upload, administration, placeholders, and modal layouts adapt without horizontal overflow.
- RTL/LTR, dark/light themes, keyboard focus, reduced motion, and device safe areas remain supported.

### Verification

- `[passed] npm.cmd test - 38 tests passed`
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend, migration, or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `43f9b0c`
- Push: `successful`

### Notes

CSS preserves the source image's intrinsic proportions; perceived resolution still depends on the resolution of the originally uploaded file.

## 2026-10-06 - Build the account settings page

### Request

Replace the Settings placeholder with profile editing, password reset/change, and account management sections.

### Changes

- Added a responsive three-section settings page integrated with the fixed application navigation.
- Added profile editing for full name, exactly 10 phone digits, gender, and date of birth.
- Displays the verified email as disabled and never submits it for updates.
- Added current/new/confirmation password fields plus access to the existing forgot-password flow.
- Added active account status, confirmed deactivation, automatic sign-out, and administrator-reactivation guidance.
- Added complete English/Arabic localization and light/dark responsive styling.
- Updates the local session name after a successful profile save.
- Added frontend API integration and regression coverage.

### Repositories

- `inkfig-user-FE`: settings UI, API client, routing, localization, styles, and tests.
- `inkfig-user-system`: paired settings endpoints and backend enforcement.
- `inkfig-main-system`: no changes required.

### API

- Consumes `GET/PUT /api/v1/settings/profile`.
- Consumes `PUT /api/v1/settings/password`.
- Consumes `PUT /api/v1/settings/account-status`.

### Database

- No frontend migration. The user database already enforces unique phone numbers.

### Permissions and scope

- Unauthenticated visitors are redirected to sign in.
- Backend identity, validation, phone uniqueness, password verification, and account state remain authoritative.

### Verification

- `[passed] npm.cmd test` - 39 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-system` first, then deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No frontend environment-variable change is required.

### Git

- Branch: `feature/account-settings`
- Commit and push: completed after final synchronization.

### Notes

Deactivation intentionally requires administrator reactivation because inactive accounts cannot safely authenticate themselves.
## 2026-10-06 - Add social profile experience

### Request

Let users open one another's profiles, follow or unfollow accounts, inspect follower/following account lists, and see follower, following, and received-like counters.

### Changes

- Added profile URLs for other accounts and linked artist identities from gallery cards and artwork details.
- Added follower, following, and total received-like counters to every signed-in profile view.
- Added optimistic follow/unfollow controls on profiles and beside accounts in follower/following dialogs, with rollback on API failure.
- Preserved the owner's Posts, Likes, and Saved navigation while other profiles display their published posts.
- Added responsive, RTL-aware, light/dark social-profile styling and mobile bottom-sheet behavior.
- Extended secure-cookie refresh retry behavior to authenticated user-API profile, settings, and administration routes.
- Left guest gallery access, upload workflows, and existing private collections unchanged.

### Repositories

- `inkfig-user-FE`: implements the social-profile interface.
- `inkfig-user-system`: provides profile data, relationships, counters, and mutations.
- `inkfig-main-system`: provides selected-account artwork feeds.

### Files

- `src/features/profile/ProfilePage.tsx`: renders own/other profiles, counters, follow actions, connection dialogs, and artwork collections.
- `src/features/profile/profileApi.ts`: provides typed social-profile API calls.
- `src/features/works/worksApi.ts`: loads artworks for a selected account.
- `src/features/home/HomePage.tsx`: links gallery artist identities to profiles.
- `src/features/home/ArtworkDetailModal.tsx`: links modal artist identity to the profile.
- `src/app/AppRouter.tsx`: adds `/:language/profile/:userId`.
- `src/api/httpClient.ts`: retries authenticated user-API requests after secure-cookie refresh.
- `src/i18n/resources.ts`: adds English and Arabic social-profile labels and states.
- `src/styles.css`: adds responsive social profile, account-list, follow-button, and artist-link styling.
- `tests/foundation.test.mjs`: updates profile expectations and adds social-profile coverage.

### API

- Consumes `GET /api/v1/profiles/{user_id}`.
- Consumes `GET /api/v1/profiles/{user_id}/followers`.
- Consumes `GET /api/v1/profiles/{user_id}/following`.
- Consumes `PUT /api/v1/profiles/{user_id}/follow`.
- Consumes `DELETE /api/v1/profiles/{user_id}/follow`.
- Consumes `GET /api/v1/works/users/{user_id}`.

### Database

- Migration: `20261006_010_add_user_follows.sql` in `inkfig-user-system`.
- No frontend-local database changes.

### Permissions and scope

- Signed-in users with `profile.read_own` can open social profiles and manage their own follow relationships.
- Follow mutations never submit or select the acting user ID; secure cookies identify the actor and the backend validates authorization.
- Artwork like/save controls continue to use their existing permissions.

### Frontend

- Adds route `/:language/profile/:userId` while preserving `/:language/profile`.
- Adds clickable artist overlays, profile counters, Follow/Unfollow states, follower/following dialogs, account links, optimistic loading, empty/error states, responsive mobile presentation, RTL/LTR support, and English/Arabic localization.

### Verification

- `[passed] npm test — 40 passed`
- `[passed] npm run build — TypeScript checks and Vite production build passed`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` after both backend deployments.
- Backend migration must run before frontend deployment; it has already been applied to Supabase.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `ba2f24f`
- Push: `successful`

### Notes

- Follower/following dialogs currently load complete lists; add cursor pagination when account relationship volumes justify it.

## 2026-10-06 - Align and animate profile collection tabs

### Request

Place Posts at the start of the profile divider, Saved in the center, and Likes at the end, with an animated red underline on hover and selection.

### Changes

- Reordered the owner-profile tabs to Posts, Saved, then Likes.
- Changed the tab row to three equal grid columns aligned to logical start, center, and logical end.
- Added a red underline that smoothly expands from the center on hover, keyboard focus, and active selection.
- Preserved the selected tab's persistent underline and reduced-motion behavior.
- Added regression coverage for order, alignment, color, and animation states.

### Repositories

- `inkfig-user-FE`: profile tab markup, styling, and tests.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

No authentication, authorization, role, permission, ownership, or data-scope behavior changed.

### Frontend

- English and Arabic use logical start/end alignment.
- Pointer hover, keyboard focus, and selected states share the animated red indicator.
- Posts, Likes, Saved feeds and deep links remain unchanged.

### Verification

- `[passed] npm.cmd test` - 41 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Push `inkfig-user-FE` to `main` to trigger the existing Cloudflare deployment workflow.
- No backend, migration, secret, or environment-variable changes are required.

### Git

- Branch: `feature/profile-tab-layout`
- Commit and push: completed after final synchronization.

### Notes

The line beneath the tabs remains the shared divider; each label receives its own animated red indicator.
## 2026-10-06 - Reset password from settings with email code

### Request

Replace the current-password form in Settings with the existing forgot-password verification-code workflow: send a code to the signed-in user's email, verify it, then allow a new password, with the established resend and rate-limit rules.

### Changes

- Replaced current-password entry in Settings with a verification-code reset action.
- Automatically sends the first reset code to the authenticated account's fixed university email when the reset dialog opens.
- Added code verification followed by new-password and confirmation fields only after successful verification.
- Added resend countdown, five-code hourly-limit messaging, expired/invalid code errors, incorrect-attempt handling, and reset-token expiry handling.
- Signs the user out after success because the backend invalidates existing sessions when the password changes.
- Added responsive modal/bottom-sheet styling with light, dark, RTL, LTR, loading, error, disabled, and reduced-motion states.
- Left the standalone logged-out forgot-password page and backend security rules unchanged.

### Repositories

- `inkfig-user-FE`: replaces the settings password form with the existing email-code reset flow.
- `inkfig-user-system`: no changes; existing password-reset endpoints and enforcement are reused.

### Files

- `src/features/settings/SettingsPage.tsx`: adds the authenticated email-code dialog and three-stage reset workflow.
- `src/i18n/resources.ts`: updates the settings explanation and adds English/Arabic reset-dialog labels.
- `src/styles.css`: adds responsive and theme-aware settings reset styling.
- `tests/foundation.test.mjs`: verifies endpoint reuse, fixed session email, absence of current-password input, cooldown, hourly limit, and dialog styling.

### API

- Reuses `POST /api/v1/auth/password-reset/request` with the authenticated session email.
- Reuses `POST /api/v1/auth/password-reset/verify` with the six-digit code.
- Reuses `POST /api/v1/auth/password-reset/confirm` with the reset token and new password.
- No API contract changes.

### Database

- No migration required.
- Existing password-reset challenge, attempt, expiry, reset-token, and email-rate-limit storage is reused.

### Permissions and scope

- The Settings page requires an authenticated frontend session.
- The target email is taken from the authenticated session and is not editable in the dialog.
- The backend continues to validate account eligibility, code lifetime, incorrect attempts, reset-token lifetime, resend cooldown, and the five-codes-per-hour limit.
- Password confirmation invalidates existing refresh tokens and increments the account token version on the backend.

### Frontend

- Settings route `/:language/settings`, Reset password section now opens an accessible modal.
- Stages: automatic send and code entry, verified new-password entry, then sign-out on success.
- Provides resend countdown, hourly-limit state, loading/disabled controls, localized errors, responsive mobile bottom sheet, RTL/LTR, dark/light themes, and reduced-motion support.

### Verification

- `[passed] npm test — 41 passed`
- `[passed] npm run build — TypeScript checks and Vite production build passed`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE`.
- No backend deployment, migration, environment-variable, or configuration changes are required.

### Git

- Branch: `main`
- Commit: `c9b88ff`
- Push: `successful`

### Notes

- The settings flow intentionally shares the same backend rate-limit bucket and security rules as the logged-out forgot-password flow.

## 2026-10-06 - Add secure deactivation and suspension messaging

Added the confirmation-then-current-password self-deactivation flow, automatic sign-out, administrator-suspension login messaging, and blocked-reset messaging. Self-deactivated users can sign back in to reactivate; suspended users are directed to contact an administrator.

- API: sends `current_password` to `/settings/account-status`; handles HTTP 423 for login and password reset.
- Verification: `npm.cmd test` passed (41 tests), `npm.cmd run build` passed, and `git diff --check` passed.
- Deployment: deploy after both backends.
- Branch: `feature/account-status-lifecycle`; push to `main` after synchronization.

## 2026-10-06 - Move profile control to the application sidebar

### Request

Move the signed-in profile icon out of the top navigation and place it in the shared side navigation directly above Settings.

### Changes

- Moved the authenticated profile menu, account identity, profile link, language/theme controls, and logout action into the shared application sidebar.
- Positioned the profile control immediately above Settings on desktop and immediately before Settings in the responsive bottom navigation.
- Preserved outside-click dismissal and added LTR/RTL-aware popover placement for desktop and mobile layouts.
- Kept the guest sign-in control in the homepage header.
- Updated frontend coverage to verify the new shared-sidebar ownership and control order.

### Repositories

- `inkfig-user-FE`: navigation placement, responsive styling, and tests.
- No backend or database changes are required.

### Verification

- `[passed] npm.cmd test` - 42 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend deployment workflow.
- No migration, secret, environment-variable, or configuration changes are required.

### Git

- Branch: `feature/sidebar-profile-control`
- Commit, rebase, merge, and push: completed after final synchronization.

## 2026-10-06 - Support both settings password reset methods

### Request

Correct Settings so users normally change their password with the current password, while email verification is an alternative when the current password is forgotten.

### Changes

- Restored current password, new password, and confirmation as the primary workflow.
- Kept “Forgot password?” as a separate email-code workflow where verified email possession replaces current-password proof.
- Preserved resend cooldown, five codes per hour, one-hour blocking, code expiry, incorrect-attempt limits, and reset-token expiry.
- Preserved the concurrent secure account-deactivation and sidebar-profile changes.
- Left backend contracts, database schema, and the standalone reset page unchanged.

### Repositories

- `inkfig-user-FE`: corrects the two Settings password workflows.
- `inkfig-user-system`: no changes; existing password-change and password-reset endpoints are reused.

### Files

- `src/features/settings/SettingsPage.tsx`: restores current-password change and retains email-code recovery.
- `src/i18n/resources.ts`: explains both methods in English and Arabic.
- `src/styles.css`: styles the forgot-password action.
- `tests/foundation.test.mjs`: verifies both proof methods and preserves deactivation coverage.

### API

- Reuses `PUT /api/v1/settings/password` for current-password changes.
- Reuses `POST /api/v1/auth/password-reset/request`, `/verify`, and `/confirm` for recovery.
- No API contract changes.

### Database

No migration required.

### Permissions and scope

- The normal endpoint requires authenticated `profile.read_own` access and validates the current password.
- Recovery uses the signed-in account email, which the frontend cannot change.
- Authorization and all reset limits remain backend-enforced.

### Frontend

- Reset password displays current password, new password, and confirmation.
- “Forgot password?” opens the email-code modal; verification replaces current-password proof.
- Responsive, RTL/LTR, localization, loading, error, cooldown, hourly-limit, and reduced-motion behavior remains.

### Verification

- `[passed] npm test — 42 passed after synchronization`
- `[passed] npm run build — TypeScript and Vite production build passed after synchronization`
- `[passed] git diff --check`
- `[passed] post-rebase verification — concurrent sidebar and secure-deactivation work preserved`

### Deployment

- Deploy `inkfig-user-FE`.
- No backend deployment, migration, environment-variable, or configuration changes.

### Git

- Branch: `main`
- Commit: `847de8f`
- Push: `successful`

### Notes

This supersedes only the prior interaction decision: email verification is an alternative to current-password proof, not the only Settings method.

## 2026-10-06 - Make the frontend fluid across all viewport sizes

### Request

Make the complete InkFig interface responsive so artwork columns, navigation, search, icons, and page objects adapt to the screen while artwork keeps its original aspect ratio and source quality.

### Changes

- Added shared fluid viewport tokens for the side rail, page gutters, feed gutters, artwork target width, and masonry gaps.
- Made home and profile artwork feeds consume the available viewport width and automatically add columns as space increases.
- Scaled the sidebar, logo, navigation controls, icons, search control, and header spacing on large and ultrawide displays.
- Preserved the compact bottom-navigation layout and touch-sized controls on tablets and phones, with a one-column fallback on very narrow screens.
- Kept artwork images uncropped and unstretched with their natural aspect ratio, automatic browser-quality rendering, and the original image URL.
- Added off-screen card rendering containment to improve long-feed performance without changing user-visible content.
- Extended settings and administration containers to adapt cleanly to wider displays.
- Left routes, application behavior, APIs, authentication, permissions, and backend logic unchanged.

### Repositories

- `inkfig-user-FE`: responsive layout, artwork rendering rules, and regression coverage.

### Files

- `src/styles.css`: added the shared fluid viewport system and responsive scaling rules.
- `tests/foundation.test.mjs`: expanded responsive and image-preservation regression coverage.
- `AGENT_FEATURE_LOG.md`: recorded this ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No new permissions are required.
- The responsive presentation applies to guests, users, supervisors, admins, and system administrators on their existing accessible pages.
- Existing endpoint authorization remains validated by the backend and was not changed.

### Frontend

- Home and profile feeds use responsive Pinterest-style masonry columns tied to available width.
- Desktop navigation scales at 1600px and 2200px breakpoints; screens at 720px and below use the existing bottom navigation.
- Search, headers, content gutters, settings, administration, dialogs, and touch controls adapt to desktop, ultrawide, tablet, mobile, and narrow-mobile layouts.
- RTL/LTR positioning, safe-area spacing, dark/light themes, reduced motion, loading states, empty states, and error states remain supported.

### Verification

- `[passed] npm.cmd test - 42 tests passed`
- `[passed] npm.cmd run build - TypeScript checks and Vite production build passed`
- `[passed] git diff --check`
- `[not run] in-app browser viewport inspection - the required browser runtime tool was unavailable in this session`

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend GitHub Actions workflow.
- No migrations must run before deployment.
- No environment-variable or configuration changes are required.

### Git

- Branch: `main`
- Commit: `ba8949b`
- Push: `successful`

### Notes

CSS preserves the original image file and aspect ratio; visual display size still adapts to the card and device pixel density, which is required for a responsive layout.

## 2026-10-06 - Keep desktop navigation sizing consistent

### Request

Keep navigation, icons, search, and other controls visually consistent across desktop and laptop resolutions while continuing to change the number of artwork columns according to available screen width.

### Changes

- Removed large-screen scaling of the desktop side rail, navigation logo, icons, buttons, header height, search height, and profile-control column.
- Kept the desktop and laptop navigation rail fixed at 78px with consistent control sizing.
- Preserved fluid gallery width and responsive masonry column counts at desktop and ultrawide breakpoints.
- Preserved the dedicated compact bottom navigation on screens at 720px and below.
- Left artwork aspect-ratio preservation, routes, APIs, authorization, themes, and application behavior unchanged.

### Repositories

- `inkfig-user-FE`: corrected desktop responsive control sizing and regression coverage.

### Files

- `src/styles.css`: removed large-screen navigation and search scaling while preserving feed breakpoints.
- `tests/foundation.test.mjs`: verifies that desktop navigation controls remain fixed while column targets remain responsive.
- `AGENT_FEATURE_LOG.md`: recorded this correction.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No new permissions are required.
- The presentation correction applies to all roles and guests on pages they can already access.
- Existing authorization remains validated by the backend.

### Frontend

- Desktop and laptop navigation elements retain the same dimensions across screen widths.
- Artwork feeds continue adding or removing Pinterest-style columns based on available width.
- Mobile bottom navigation, RTL/LTR support, themes, safe-area spacing, loading states, empty states, and error states remain unchanged.

### Verification

- `[passed] npm.cmd test - 42 tests passed`
- `[passed] npm.cmd run build - TypeScript checks and Vite production build passed`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend GitHub Actions workflow.
- No migrations must run before deployment.
- No environment-variable or configuration changes are required.

### Git

- Branch: `main`
- Commit: `859631c`
- Push: `successful`

### Notes

Desktop control dimensions are intentionally fixed; only content capacity and artwork column count respond to wider screens.

## 2026-10-06 - Scale desktop interface proportionally

### Request

Correct the responsive behavior so navigation and interface controls retain a balanced visual proportion on larger screens instead of remaining physically small, while artwork column count continues responding to screen width.

### Changes

- Replaced fixed desktop navigation dimensions with smoothly scaling, bounded viewport-relative values.
- Made the side rail, navigation controls, logo, icons, header, search control, action area, gaps, and typography grow proportionally across laptop, desktop, QHD, and 4K widths.
- Applied minimum and maximum sizes so controls remain usable on laptops and do not become excessively large on ultrawide displays.
- Kept artwork masonry sizing independent so wider screens continue adding columns.
- Preserved explicit compact dimensions for mobile and extra-narrow screens.
- Left artwork quality, routes, APIs, authorization, themes, and application behavior unchanged.

### Repositories

- `inkfig-user-FE`: proportional desktop interface scaling and responsive regression coverage.

### Files

- `src/styles.css`: introduced bounded viewport-relative navigation and header sizing.
- `tests/foundation.test.mjs`: verifies proportional controls and responsive masonry behavior.
- `AGENT_FEATURE_LOG.md`: recorded this correction.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- No new permissions are required.
- Proportional presentation applies to guests and every authenticated role on pages they can access.
- Existing authorization remains validated by the backend.

### Frontend

- The side rail scales from 78px to 120px, controls from 48px to 68px, and icons from 24px to 32px according to viewport width.
- Header and search dimensions scale smoothly within bounded values.
- Artwork feeds independently add or remove Pinterest-style columns based on available width.
- Mobile bottom navigation, RTL/LTR support, safe areas, themes, reduced motion, loading, empty, and error states remain supported.

### Verification

- `[passed] npm.cmd test - 42 tests passed`
- `[passed] npm.cmd run build - TypeScript checks and Vite production build passed`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend GitHub Actions workflow.
- No migrations must run before deployment.
- No environment-variable or configuration changes are required.

### Git

- Branch: `main`
- Commit: `d9b1dc0`
- Push: `successful`

### Notes

This supersedes the immediately previous fixed-desktop-size decision: desktop chrome now preserves visual proportion through bounded fluid scaling.

## 2026-10-06 - Show artwork categories on card hover

### Request

Display each post category in the top-left corner when an artwork card is hovered, alongside the existing like and publisher controls.

### Changes

- Added a localized category badge to homepage and profile artwork cards.
- Reused the existing category-specific color palette from the artwork detail dialog.
- Added a subtle fade-and-rise hover/focus animation with a permanent touch-device presentation.
- Kept the badge in the physical top-left for English and Arabic, with the like control on the opposite side to prevent overlap.
- Added regression coverage for localization, placement, hover behavior, and profile/home consistency.

### Repositories

- `inkfig-user-FE`: artwork-card markup, styling, and tests.
- No backend or database changes are required.

### Verification

- `[passed] npm.cmd test` - 43 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations, secrets, environment variables, or configuration changes are required.

### Git

- Branch: `feature/artwork-category-badge`
- Commit, rebase, merge, and push: completed after final synchronization.
## 2026-10-06 - Semantic artwork search experience

### Request

Connect the home-page search bar to Voyage-powered artwork search with English and Arabic support.

### Changes

- Replaced local title/artist filtering with the main backend semantic search endpoint.
- Added a 350 ms debounce and cancels stale UI updates when the query, category, or session changes.
- Kept the normal public feed for empty and one-character queries.
- Kept existing card layout, interactions, category filters, responsive behavior, and profile navigation unchanged.

### Repositories

- `inkfig-user-FE`: added the semantic search request and localized UI states.
- `inkfig-main-system`: provides embedding generation, vector storage, and ranked search.

### Files

- `src/features/works/worksApi.ts`: added the typed semantic search request.
- `src/features/home/HomePage.tsx`: added debounced server-side search and state handling.
- `src/i18n/resources.ts`: added English and Arabic search status messages.
- `tests/foundation.test.mjs`: verifies semantic search wiring and debounce behavior.

### API

- `GET /api/v1/works/search`: sends `query` and optional `type_code`; consumes the existing work-feed response shape and handles unavailable responses as a localized error state.

### Database

- Migration: `20261006_006_add_work_embeddings.sql` in `inkfig-main-system`.
- No frontend-local database changes; the backend migration must run before this frontend is deployed.

### Permissions and scope

- Search is public for viewers and authenticated roles.
- Like and save actions retain their existing permission checks.
- Authorization and published/active-account scope are validated by the backend.

### Frontend

- Updated the existing localized home route for English and Arabic.
- Search starts at two trimmed characters and is debounced by 350 ms.
- Category selection narrows semantic results.
- Added localized searching, no-results, and temporary-error states with an accessible live loading message.
- Existing responsive mobile navigation and Pinterest-style cards remain unchanged.

### Verification

- `[passed] npm.cmd test` (43 tests)
- `[passed] npm.cmd run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-main-system` and run its pgvector migration before deploying `inkfig-user-FE`.
- No frontend environment-variable changes are required; the existing main API base URL is used.

### Git

- Branch: `main`
- Commit: `2a8a1e8`
- Push: `successful`

### Notes

Queries shorter than two characters intentionally show the standard feed to avoid unnecessary paid embedding requests.

## 2026-10-06 - Move account control to navigation and remove horizontal overflow

### Request

Move the profile/account icon from the home-page header to immediately above Settings in the application navigation, and correct the layout defect that showed a horizontal page scrollbar.

### Changes

- Moved the signed-out account/sign-in control from the header into the shared sidebar account group above Settings.
- Preserved the signed-in profile menu in the same position so the navigation is consistent in both authentication states.
- Removed the unused header action column and allowed the search field to consume the available header width.
- Corrected desktop and mobile header grid sizing in both LTR and RTL layouts. The previous desktop grid reserved 72 px while the responsive action control expanded to 86.17 px at 1915 px, causing 14.17 px of real horizontal overflow.
- Added regression coverage for guest and authenticated account placement and the single-column responsive header.

### Repositories

- `inkfig-user-FE`: navigation, home header, responsive styles, tests, and this log.
- `inkfig-main-system`: no changes.
- `inkfig-user-system`: no changes.

### Files

- `src/features/navigation/AppSidebar.tsx`: renders either the profile menu or sign-in account control directly above Settings.
- `src/features/home/HomePage.tsx`: removes the duplicated account control and obsolete action column from the header.
- `src/styles.css`: gives the header one flexible column and keeps navigation controls fluid across viewports.
- `tests/foundation.test.mjs`: verifies account placement and overflow-safe header rules.

### API, database, permissions, and SnapStart

- No API, database, migration, permission, environment-variable, or backend changes.
- No effect on AWS Lambda SnapStart compatibility because this is a frontend-only change.

### Verification

- `[passed] npm.cmd test` - 44 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and the Vite production build succeeded.
- `[passed] Playwright at 1915x910` - no overflowing elements; signed-in profile and signed-out account controls both appear above Settings.
- `[passed] Playwright at 390x844` - no overflowing elements; the account control remains in the responsive bottom navigation.

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations, secrets, configuration changes, or backend deployment are required.

### Git

- Branch: `main`
- Pull/rebase, commit, push, and workflow status: pending final synchronization.

## 2026-10-07 - Preserve semantic search ranking

### Request

Display semantic-search artworks according to the explicit similarity rank returned by the backend.

### Changes

- Extended the artwork API type with search-only `search_rank` and `similarity_score` metadata.
- Defensively sorts a copied semantic-search response array by ascending rank before returning it to the home page.
- Places missing ranks last for backward compatibility during staggered deployment.
- Kept normal feeds, card presentation, image quality, interactions, and layout unchanged.

### Repositories

- `inkfig-user-FE`: consumes and preserves backend semantic ranking.
- `inkfig-main-system`: returns rank and cosine similarity for every search result.

### Files

- `src/features/works/worksApi.ts`: types search metadata and orders semantic results by rank.
- `tests/foundation.test.mjs`: verifies the response fields and rank-based ordering.

### API

- Consumes `GET /api/v1/works/search` items containing `search_rank` and `similarity_score`.
- No request fields, filters, validation, permissions, or frontend error handling changed.

### Database

No migration required. The frontend has no local database, and ranking is calculated by `inkfig-main-system` from existing embeddings.

### Permissions and scope

- Public viewers and authenticated roles can use semantic search as before.
- Like and save actions retain their existing permissions.
- Published-work and active-owner scope remains validated by the backend.

### Frontend

- Search results render from rank 1 onward in the existing responsive Pinterest-style gallery.
- Missing rank values are placed after ranked results during rolling deployment.
- No visible rank badge, route, navigation, localization, loading, empty, error, responsive, or card-design changes were added.

### Verification

- `[passed] npm.cmd test - 44 passed after rebase`
- `[passed] npm.cmd run build - TypeScript and Vite production build succeeded after rebase`
- `[passed] git diff --check`
- `[passed] backend pytest - 29 passed`
- `[passed] backend mypy - no issues in 48 source files`

### Deployment

- Deploy `inkfig-main-system` before `inkfig-user-FE` for the complete response contract.
- No migrations must run before deployment.
- No environment-variable, secret, or configuration changes are required.

### Git

- Branch: `main`
- Commit: `6c61c62`
- Push: `successful`

### Notes

The similarity value is diagnostic ranking metadata and must not be presented as a probability without separate calibration.

## 2026-10-06 - Submit artwork searches with Enter

### Request

Do not send an artwork search request while the user is typing; send it only after the user presses Enter in the search bar.

### Changes

- Separated the editable search-field value from the submitted search value.
- Replaced the 350 ms typing debounce with an explicit search-form submission handler.
- Pressing Enter trims and submits the query; typing alone leaves the current results and network requests unchanged.
- Submitting an empty or one-character value uses the existing normal artwork feed behavior.
- Category changes continue to refresh the currently submitted query rather than unsubmitted text.
- Preserved accessible search semantics with a named `role="search"` form and associated input label.

### Repositories

- `inkfig-user-FE`: search interaction, regression tests, and this log.
- `inkfig-main-system`: no changes.
- `inkfig-user-system`: no changes.

### Files

- `src/features/home/HomePage.tsx`: adds submitted-query state and Enter-based form submission.
- `tests/foundation.test.mjs`: verifies explicit submission and removal of the typing debounce.

### API, database, permissions, and SnapStart

- Uses the existing `GET /api/v1/works/search` endpoint without contract changes.
- No database, migration, permission, environment-variable, or backend changes.
- No effect on AWS Lambda SnapStart compatibility because this is a frontend-only change.

### Verification

- `[passed] npm.cmd test` - 44 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] Playwright request inspection` - typing `olive moon` sent no request; pressing Enter sent `GET /api/v1/works/search?query=olive+moon`.

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations, secrets, configuration changes, or backend deployment are required.

### Git

- Branch: `main`
- Pull/rebase, commit, push, and workflow status: pending final synchronization.

## 2026-10-07 - Start the homepage directly with the artwork gallery

### Request

Remove all promotional content above the home-page gallery, including the Ink Your World lockup and Explore Gallery prompt, so the page shows artwork-type filters followed by cards.

### Changes

- Removed the complete promotional hero, kicker, title lockup, description, Explore Gallery link, and decorative curated-art mark.
- Removed the Community Gallery / Works Worth Discovering heading and viewer-note block above the filters.
- Made the localized artwork-type buttons the first content beneath the sticky search header.
- Preserved an accessible localized label on the gallery section after removing its visible heading.
- Added compact responsive top spacing and removed the obsolete top divider for a clean gallery-first composition.
- Preserved semantic search, category filtering, artwork cards, category badges, artist links, likes, saves, detail dialogs, navigation, themes, localization, and responsive behavior.

### Repositories

- `inkfig-user-FE`: simplified the homepage composition and updated regression coverage.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/home/HomePage.tsx`: removes the hero and gallery-heading blocks and their unused icons.
- `src/styles.css`: gives the gallery-first layout compact top spacing without a divider.
- `tests/foundation.test.mjs`: verifies the homepage starts with filters and no promotional markup remains.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API, database, permissions, and SnapStart

- No API, database, migration, permission, environment-variable, or backend changes.
- No effect on AWS Lambda SnapStart compatibility because this is a frontend-only presentation change.

### Verification

- `[passed] npm.cmd test` - 44 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser visual inspection` - no in-app browser was attached to this workspace.

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations, secrets, configuration changes, or backend deployment are required.

### Git

- Branch: `main`
- Commit, rebase, and push: pending final synchronization.

### Notes

The existing localization strings and legacy hero CSS remain available but unused; removing shared styling or translations was intentionally avoided to keep this ticket focused and conflict-safe.

## 2026-10-07 - Restore the home profile avatar and Pinterest-inspired spacing

### Request

Move the profile avatar back to the outer top corner of the home header and refine the spacing between the navigation rail, search bar, avatar, filters, and artwork grid using the supplied Pinterest layout as a visual reference.

### Changes

- Moved the signed-in profile menu and signed-out login avatar from the navigation rail back into the home-page header.
- Preserved profile navigation, language and theme controls, logout, guest sign-in, and outside-click menu dismissal.
- Kept Settings anchored at the bottom of the navigation rail after removing the account control from that rail.
- Added a consistent desktop rhythm with an 88px rail, 20px content gutters, 20px masonry gaps, a 12px search-to-avatar gap, and a compact 40px avatar.
- Extended the search field across the available header width while keeping the avatar aligned at the outer edge.
- Mirrored the header and sidebar relationship for Arabic and retained a compact search-plus-avatar layout on mobile.

### Repositories

- `inkfig-user-FE`: home header composition, responsive spacing, regression tests, and this log.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/home/HomePage.tsx`: restores the account/avatar control to the home header.
- `src/features/navigation/AppSidebar.tsx`: removes the duplicated account control while retaining Settings at the rail bottom.
- `src/styles.css`: adds the Pinterest-inspired spacing system and responsive RTL/mobile alignment.
- `tests/foundation.test.mjs`: updates header ownership checks and verifies the new spacing tokens.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API, database, permissions, and SnapStart

- No API, database, migration, permission, environment-variable, or backend changes.
- No effect on AWS Lambda SnapStart compatibility because this is a frontend-only presentation change.

### Verification

- `[passed] npm.cmd test` - 44 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`.
- `[not run] live browser visual inspection` - the in-app browser was unavailable in this session; responsive and RTL behavior were verified through the production build and regression assertions.

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations, secrets, configuration changes, or backend deployment are required.

### Git

- Branch: `fix/home-header-spacing`
- Commit, rebase, push, and pull-request status: pending final synchronization.

## 2026-10-07 - Add artwork feed pagination

### Request

Implement complete user-facing pagination for artwork feeds and semantic-search results.

### Changes

- Changed artwork API helpers to return page objects containing items and continuation cursors.
- Added localized Load more controls to the home feed, semantic search, profile posts, liked works, and saved works.
- Preserves an independent cursor for every profile collection tab.
- Appends new pages without duplicate artwork IDs and preserves semantic rank ordering.
- Keeps already loaded artwork visible when a later page fails and shows a retryable error state.
- Preserved artwork aspect ratios, original image URLs, Pinterest-style masonry, likes, saves, filters, themes, and navigation.

### Repositories

- `inkfig-user-FE`: adds page-aware API helpers and user-facing continuation controls.
- `inkfig-main-system`: adds search continuation and already provides feed/profile cursors.

### Files

- `src/features/works/worksApi.ts`: returns typed page responses and sends feed/search cursors.
- `src/features/home/HomePage.tsx`: loads and appends public-feed or ranked-search pages.
- `src/features/profile/ProfilePage.tsx`: tracks and loads pages independently for posts, likes, and saved tabs.
- `src/i18n/resources.ts`: adds English and Arabic load-more labels.
- `src/styles.css`: styles responsive, theme-aware pagination controls and errors.
- `tests/foundation.test.mjs`: verifies cursor transport, state, localization, and controls.

### API

- Consumes `GET /api/v1/works` with optional `before`.
- Consumes `GET /api/v1/works/search` with optional integer `cursor`.
- Consumes `GET /api/v1/works/users/{user_id}`, `/likes`, and `/saves` with optional `before`.
- All page responses consume `items` and nullable `next_cursor`; request validation, filters, permissions, and error contracts remain backend-owned.

### Database

No migration required. The frontend has no local database; the backend uses its existing feed indexes and pgvector search data.

### Permissions and scope

- Public viewers can paginate the home feed and search.
- Authenticated users with `profile.read_own` can paginate their liked and saved collections.
- Existing like/save permissions are unchanged.
- Published-work, active-owner, ownership, and viewer scopes continue to be validated by the backend.

### Frontend

- Adds accessible disabled/loading Load more controls in English and Arabic.
- Home category or submitted-query changes reset to the new first page.
- Each profile tab retains its own continuation cursor.
- Later-page failures preserve loaded cards and expose an error message; the cursor remains available for retry.
- Existing responsive desktop/mobile masonry, RTL/LTR, dark/light themes, empty states, and original-resolution image behavior remain.

### Verification

- `[passed] npm.cmd test - 44 passed`
- `[passed] npm.cmd run build - TypeScript and Vite production build succeeded`
- `[passed] git diff --check`
- `[passed] backend pytest - 30 passed`
- `[passed] backend mypy - no issues in 48 source files`

### Deployment

- Deploy `inkfig-main-system` before `inkfig-user-FE`.
- No migrations must run before deployment.
- No environment-variable, secret, or configuration changes are required.

### Git

- Branch: `main`
- Commit: `f91ad8d`
- Push: `successful`

### Notes

The explicit Load more interaction avoids unexpected network and Voyage requests while users scroll.

## 2026-10-07 - Refine navigation sizing and profile controls

### Request

Slightly enlarge the navigation rail, its controls, and logo; reduce the home search and profile-avatar sizes; make the account identity open the profile; and simplify the profile page with an editable avatar and nearby logout control.

### Changes

- Increased the desktop navigation rail to 96 pixels, navigation controls to 52 pixels, icons to 26 pixels, and logo container to 64 pixels.
- Reduced the desktop search height to 52 pixels and the home profile avatar to 34 pixels for more balanced proportions.
- Removed the separate View profile menu item and made the account identity block itself link to the profile.
- Removed the complete profile-page header and the Your InkFig Profile / community-profile eyebrow.
- Added an owner-only profile-picture picker that appears on hover/focus, validates JPEG/PNG/WebP files up to 2 MB, previews immediately, and persists per signed-in user in browser storage.
- Reused the selected picture in the home account avatar and identity block.
- Added an accessible logout button beside the owner name while preserving backend logout behavior.
- Added responsive touch presentation, dark-theme styling, and English/Arabic labels and errors.

### Repositories

- `inkfig-user-FE`: navigation sizing, account menu, profile layout, local avatar persistence, localization, tests, and this log.
- `inkfig-user-system`: no changes; it currently exposes no profile-image upload contract.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/home/HomePage.tsx`: uses the compact stored avatar and makes account information the profile link.
- `src/features/profile/ProfilePage.tsx`: removes the header/eyebrow and adds avatar selection plus adjacent logout.
- `src/features/profile/profileAvatarStorage.ts`: validates, reads, and stores per-user browser-local avatar images.
- `src/i18n/resources.ts`: adds bilingual avatar action and validation text.
- `src/styles.css`: balances navigation/search/avatar sizing and styles profile upload/logout controls.
- `tests/foundation.test.mjs`: verifies the revised structure, persistence helper, localization, and final sizing tokens.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API, database, permissions, and SnapStart

- No API, database, migration, backend permission, secret, or environment-variable changes.
- The avatar is browser-local because no backend profile-image endpoint currently exists; it is not synchronized across devices.
- Avatar editing is exposed only on the signed-in user's own profile; existing backend authorization remains authoritative.
- No effect on AWS Lambda SnapStart compatibility because this is a frontend-only change and browser APIs run only in the client.

### Verification

- `[passed] npm.cmd test` - 45 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`.
- `[not run] live browser visual inspection` - the in-app browser runtime could not start because of the Windows sandbox lock failure.

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations, secrets, configuration changes, or backend deployment are required.

### Git

- Branch: `feature/profile-avatar-controls`
- Commit, rebase, push, merge, and main push: pending final synchronization.

## 2026-10-07 - Position owner controls below artwork

### Request

Place the three-dot control used to edit or delete an owned work at the bottom-right of the artwork card, matching the supplied reference image.

### Changes

- Moved the owner-only three-dot menu from the image overlay into a compact footer below the artwork.
- Anchored the control to the physical bottom-right in both LTR and RTL layouts and made its action menu open upward so it remains associated with the card.
- Added light- and dark-theme styling while preserving the existing edit/delete behavior, authorization rules, image rendering, and non-owner cards.

### Repositories

- `inkfig-user-FE`: repositioned and restyled the existing owner work menu and updated its frontend tests.

### Files

- `src/features/profile/ProfilePage.tsx`: moved the owner menu outside the image container and marked manageable cards for footer styling.
- `src/styles.css`: added the bottom action footer, bottom-right menu placement, upward popup, and dark-theme presentation.
- `tests/foundation.test.mjs`: verifies the new manageable-card markup and menu placement.
- `AGENT_FEATURE_LOG.md`: recorded this completed ticket.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- The control remains limited to the signed-in owner where the existing `works.upload` permission and ownership checks allow management.
- Edit and delete authorization continues to be validated by the backend; this change does not broaden access or scope.

### Frontend

- The owner menu is displayed in a white or themed footer below owned artwork cards on the profile Posts section.
- The three-dot button stays at the physical bottom-right and its localized Edit/Delete popup opens above it.
- Existing responsive masonry layout, RTL/LTR support, dark mode, image resolution behavior, and confirmation/error workflows remain unchanged.

### Verification

- `[passed] npm.cmd test - 48 tests passed`
- `[passed] npm.cmd run build - TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`
- `[not run] deployed browser verification - deployment occurs through the GitHub workflow after push`

### Deployment

- Deploy `inkfig-user-FE` through its existing GitHub Actions workflow.
- No migrations or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `e366b1e`
- Push: `successful`

### Notes

The menu uses a physical right-edge position intentionally to match the supplied visual reference in both language directions.

## 2026-10-07 - Add account-scoped artwork search to the home bar

### Request

Open a Facebook-style live account list below the search bar whenever `@` is typed, require explicit account selection, search that user's matching works, and show all of that user's works when the selected `@account` has no artwork description.

### Changes

- Added a 250 ms debounced live account picker with prefix/partial-name results.
- Added mouse, touch, Arrow Up, Arrow Down, Enter, Escape, outside-click, loading, empty, light/dark, responsive, Arabic, English, RTL, and LTR behavior.
- Stores the selected immutable `user_id` separately from visible text; manually typed account names never create an owner filter.
- Invalidates the selected account if its inserted mention is removed or edited.
- Uses chronological owner-filtered feed results for an account-only query and ranked owner-filtered semantic results when artwork words remain.
- Preserved cards, image rendering, category filters, pagination, likes, saves, and account navigation.

### Repositories

- `inkfig-user-FE`: live account picker and owner-aware feed/search requests.
- `inkfig-user-system`: active verified account discovery endpoint and search index.
- `inkfig-main-system`: owner-aware public feed and semantic search.

### Files

- `src/features/home/HomePage.tsx`: implements account suggestions, explicit selection, query parsing, owner-scoped loading, and pagination.
- `src/features/profile/profileApi.ts`: adds the minimal account-search client.
- `src/features/works/worksApi.ts`: sends optional `owner_user_id` for normal and semantic feeds.
- `src/i18n/resources.ts`: adds English and Arabic account-search states.
- `src/styles.css`: adds responsive themed dropdown presentation.
- `tests/foundation.test.mjs`: verifies the account picker and owner-filter integration.

### API

- `GET /api/v1/profiles/search`: consumed with `query` and `limit=8` for live active-account suggestions.
- `GET /api/v1/works`: sends optional `owner_user_id` when only a selected account is searched.
- `GET /api/v1/works/search`: sends `query` plus optional `owner_user_id` for artwork text scoped to the selected account.

### Database

- Migration: `20261007_012_add_profile_name_search_index.sql` in `inkfig-user-system`
- The migration adds the partial trigram name-search index and has already been applied to Supabase. No frontend-local database change exists.

### Permissions and scope

- Account suggestions, public feed, and public semantic search require no authenticated permission and expose only active verified accounts and published works from active owners.
- Likes and saves retain their existing authenticated permissions.
- The selected backend owner ID, not visible account text, defines scope; backend services validate all authorization and visibility rules.

### Frontend

- The dropdown is anchored below the search bar and shows a fallback initial plus full name.
- Typing `@` alone displays guidance; typing one or more characters performs live search.
- A selected account with no remaining artwork words lists all of that account's public works.
- A selected account plus artwork words returns that account's works ordered by semantic rank.
- Loading, empty, unavailable, pagination, mobile, keyboard, RTL/LTR, and theme states are handled.

### Verification

- `[passed] npm.cmd test - 45 passed`
- `[passed] npm.cmd run build - TypeScript and Vite production build succeeded`
- `[passed] git diff --check`
- `[not run] live deployed browser verification - deployment workflows run after GitHub push`

### Deployment

- Deploy `inkfig-user-FE` after both backend services.
- Run the user-backend migration before deployment; it has already been applied.
- No environment-variable or configuration changes are required.

### Git

- Branch: `main`
- Commit: `41244bf`
- Push: `successful`

### Notes

Account avatars remain initials in suggestions because current profile pictures are browser-local and cannot be safely retrieved for other users.

## 2026-10-07 - Connect avatars to backend storage and signup

### Request

Replace browser-local profile pictures with backend persistence, make profile-picture selection optional during signup, and use the first letter of the user's name when no picture is selected.

### Changes

- Replaced localStorage avatar data with a signed-upload client that sends files directly to Supabase and asks the backend to verify/persist the completed object.
- Added an optional bilingual profile-picture field to signup with JPEG/PNG/WebP and 2 MB validation.
- Carries the uploaded object path through email verification so the backend claims it only for the verified pending account.
- Uses backend `avatar_url` values on the profile page, home avatar, and account identity.
- Preserves the user's first initial as the default whenever `avatar_url` is null.
- Preserved existing hover/focus editing, responsive behavior, navigation sizing, profile logout, localization, and themes.

### Repositories

- `inkfig-user-FE`: signup, verification, upload client, profile/home rendering, localization, tests, and this log.
- `inkfig-user-system`: signed upload, verification, persistence, storage, schema, and authorization.
- `inkfig-main-system`: no changes required.

### API, database, permissions, and SnapStart

- Consumes the new authenticated prepare/complete profile-avatar endpoints and optional signup/verification avatar fields.
- Database migration `20261007_012_add_profile_avatars.sql` is owned by `inkfig-user-system`.
- The browser never receives the Supabase service-role key; it receives only a short-lived object-specific signed upload URL.
- No frontend SnapStart impact; backend network clients remain request-scoped.

### Verification

- `[passed] npm.cmd test` - 46 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`.

### Deployment

- Run the user-system migration and deploy `inkfig-user-system` before `inkfig-user-FE`.
- Configure the new backend Supabase parameters; no frontend environment-variable changes are required.

### Git

- Branch: `feature/profile-avatar-upload`
- Commit, rebase, push, merge, and main push: pending final synchronization.

## 2026-10-07 - Slightly reduce the desktop navigation rail

### Request

Make the navigation bar and its buttons slightly smaller while keeping the logo at its current size.

### Changes

- Reduced the desktop navigation rail from 96 pixels to 90 pixels.
- Reduced desktop navigation controls from 52 pixels to 48 pixels and their icons from 26 pixels to 24 pixels.
- Preserved the existing 64-pixel logo container and 52-pixel logo image.
- Tightened the navigation spacing proportionally without changing mobile navigation or header sizing.

### Repositories

- `inkfig-user-FE`: desktop navigation sizing, regression coverage, and this log.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### Files

- `src/styles.css`: adjusts only the desktop navigation sizing overrides.
- `tests/foundation.test.mjs`: verifies the smaller rail and unchanged logo size.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API, database, permissions, and SnapStart

- No API, database, migration, permission, secret, or environment-variable changes.
- No effect on AWS Lambda SnapStart compatibility because this is a frontend-only presentation change.

### Verification

- `[passed] npm.cmd test` - 46 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and the Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing frontend workflow.
- No migrations or backend deployment are required.

### Git

- Branch: `fix/smaller-navigation-rail`
- Commit, rebase, push, merge, and main push: pending final synchronization.
## 2026-10-07 - Add themed account-discovery side panel

### Request

Add the supplied user icon to the navigation bar, open an adjacent account-only side panel on click, search names live without `@`, and paginate every backend result set.

### Changes

- Added the supplied `user-avatar.png` silhouette to the shared navigation rail.
- Renders the bitmap as a `currentColor` CSS mask so it matches existing navigation icon sizing, hover, active, light, dark, desktop, and mobile states.
- Added an adjacent side panel with a dedicated name search bar and 250 ms live-search debounce from the first character.
- Added real profile avatars with initial fallbacks, profile navigation, loading, empty, error, close, outside-backdrop, RTL/LTR, English/Arabic, and responsive states.
- Added cursor-based Load more behavior with client-side duplicate protection.
- Left the existing home `@` account selector and artwork search behavior unchanged.

### Repositories

- `inkfig-user-FE`: shared navigation control, responsive panel, API client pagination, localization, asset, styles, and tests.
- `inkfig-user-system`: paginated privacy-safe account discovery.

### Files

- `src/assets/user-avatar.png`: supplied navigation icon source.
- `src/features/navigation/AppSidebar.tsx`: adds the icon, panel, debounced live search, pagination, profile links, and states.
- `src/features/profile/profileApi.ts`: adds paginated account-search requests while preserving the eight-result `@` helper.
- `src/i18n/resources.ts`: adds English and Arabic panel labels and states.
- `src/styles.css`: themes the uploaded icon as a mask and adds desktop/mobile/RTL panel presentation.
- `tests/foundation.test.mjs`: verifies the themed icon, live request, cursor request, and panel structure.

### API

- `GET /api/v1/profiles/search`: sends name-only `query`, page `limit`, and optional integer `cursor`; consumes `items` and nullable `next_cursor`. No `@` character is required or inserted by this panel.

### Database

- Migration: `No migration required`
- The existing optimized account-name index is reused. No frontend database, schema, backfill, or rollback change exists.

### Permissions and scope

- No authenticated permission is required for minimal public account discovery.
- All roles and viewers can search only active, verified accounts.
- The user backend enforces visibility and response-field scope; the frontend never receives email, phone, role, or other private account data.

### Frontend

- The shared navbar icon opens and closes the adjacent side panel on every page using `AppSidebar`.
- Desktop panels open beside the left or right RTL rail; mobile panels open above the bottom navigation.
- Search starts after one typed character, resets on query changes, and appends unique results through Load more.
- Loading, empty, failure, pagination failure, avatar fallback, dark/light, RTL/LTR, and responsive behavior are handled.

### Verification

- `[passed] npm.cmd test - 47 passed`
- `[passed] npm.cmd run build - strict TypeScript and Vite production build succeeded`
- `[passed] git diff --check`
- `[not run] live deployed browser verification - deployment workflows run after GitHub push`

### Deployment

- Deploy `inkfig-user-FE` after `inkfig-user-system`.
- No migrations or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `890608e`
- Push: `successful`

### Notes

The uploaded raster is used only as an alpha mask; its visible color always follows the established navbar theme.
## 2026-10-07 - Add owner post controls and refine profile hierarchy

### Request

Add edit/delete controls for a user's own posts, keep uploaded images immutable, and refine profile logout, name, statistics, and tab sizing.

### Changes

- Added an owner-only three-dot menu to profile post cards with Edit and Delete actions.
- Added a responsive bilingual editor for title, description, category, and links that displays but never accepts replacement of the uploaded image.
- Added permanent-deletion confirmation and removes deleted works from posts, likes, saves, and any open detail view.
- Moved logout to the outer right/reading-end of the profile summary above the statistics area.
- Reduced the username size and enlarged follower, following, likes, Posts, Saved, and Likes labels for a balanced profile hierarchy.
- Added light/dark, RTL/LTR, responsive, error, loading, and accessibility states.

### Repositories

- `inkfig-user-FE`: owner controls, editor, profile styling, localization, tests, and this log.
- `inkfig-main-system`: authoritative owner mutations and complete deletion.
- `inkfig-user-system`: no changes required.

### API, database, permissions, and SnapStart

- Consumes `PATCH /api/v1/works/{work_id}` and `DELETE /api/v1/works/{work_id}`.
- Controls appear only on the signed-in owner's Posts tab with `works.upload`; the backend remains authoritative.
- No frontend database, migration, secret, environment-variable, or SnapStart change.

### Verification

- `[passed] npm.cmd test` - 48 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and the Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-main-system` before `inkfig-user-FE`.
- No migrations or configuration changes are required.

### Git

- Branch: `feature/owner-work-management`
- Commit, rebase, push, merge, and main push: pending final synchronization.

## 2026-10-07 - Refine owner menu button

### Request

Remove the visible frame around the artwork three-dot control and make the control slightly smaller.

### Changes

- Removed the border, background fill, and shadow from the three-dot trigger.
- Reduced the trigger to 28 by 28 pixels and its icon to 19 pixels.
- Preserved the bottom-right placement and existing edit/delete behavior.

### Repositories

- `inkfig-user-FE`: refined the owner-menu trigger styling and regression coverage.

### Files

- `src/features/profile/ProfilePage.tsx`: reduced the three-dot icon size.
- `src/styles.css`: removed the trigger frame and reduced its dimensions.
- `tests/foundation.test.mjs`: verifies the frameless compact control.
- `AGENT_FEATURE_LOG.md`: recorded this completed refinement.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- The control remains available only for manageable works owned by the signed-in user.
- Backend ownership and permission validation remain unchanged and authoritative.

### Frontend

- The bottom-right three-dot control is now frameless and slightly smaller in both themes and language directions.
- Edit/delete actions, popup placement, responsiveness, and error handling remain unchanged.

### Verification

- `[passed] npm.cmd test - 48 tests passed`
- `[passed] npm.cmd run build - TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through its existing GitHub Actions workflow.
- No migrations or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `316f817`
- Push: `successful`

### Notes

None

## 2026-10-07 - Build the system-administrator workspace

### Request

Build dedicated frontend interfaces for the system administrator according to the account's backend permissions, and keep those interfaces hidden from every other role.

### Changes

- Replaced the minimal administration screen with a complete user-management workspace.
- Added account totals for all, active, suspended, and elevated administrator accounts.
- Added live name/email search, role and status filters, result counts, and ten-account client-side pagination.
- Added localized role selectors and activate/suspend actions connected to the existing administration API.
- Added confirmation dialogs, success feedback, retryable errors, loading skeletons, empty states, and refresh behavior.
- Prevented self-role and self-status changes in the UI while preserving backend authorization as authoritative.
- Added an administration navigation icon that appears only for a `system_administrator` session with `users.read`.
- Independently gates role and status controls through `users.role.manage` and `users.status.manage`.
- Added responsive desktop/mobile, RTL/LTR, light/dark, keyboard-focus, and accessible dialog behavior.
- Intentionally left public navigation and every non-system-administrator interface unchanged.

### Repositories

- `inkfig-user-FE`: system-administrator navigation, workspace, localization, responsive styling, tests, and this log.
- `inkfig-user-system`: no changes; existing protected administration endpoints are reused.
- `inkfig-main-system`: no changes required.

### Files

- `src/features/admin/AdminUsersPage.tsx`: implements the permission-driven user administration workspace and workflows.
- `src/features/navigation/AppSidebar.tsx`: conditionally exposes the administration destination only to the system administrator.
- `src/i18n/resources.ts`: adds complete English and Arabic administration translations.
- `src/styles.css`: adds polished responsive, themed, RTL-aware administration presentation.
- `tests/foundation.test.mjs`: verifies role visibility, permission gates, API usage, pagination, dialogs, themes, and localization.
- `AGENT_FEATURE_LOG.md`: records this completed ticket.

### API

- `GET /api/v1/admin/users`: loads the protected user directory.
- `PATCH /api/v1/admin/users/{user_id}/role`: changes a selected user's role after confirmation; requires `users.role.manage` and backend hierarchy validation.
- `PATCH /api/v1/admin/users/{user_id}/status`: activates or suspends a selected account after confirmation; requires `users.status.manage` and backend hierarchy validation.
- No request or response contracts changed.

### Database

No migration required.

### Permissions and scope

- The navigation entry and page require both role `system_administrator` and permission `users.read`.
- Role controls require `users.role.manage`; account-status controls require `users.status.manage`.
- The current administrator cannot change their own role or status through the UI.
- Backend permission, role hierarchy, target scope, and self-management checks remain authoritative for every mutation.

### Frontend

- Route `/:language/admin/users` now provides the full administration workspace.
- The shared navigation rail conditionally displays a shield icon only for eligible system-administrator sessions.
- The directory includes statistics, search, filters, pagination, localized role/status labels, confirmation dialogs, and mutation feedback.
- Loading, empty, success, failure, retry, disabled, responsive mobile, dark/light, and RTL/LTR states are handled.

### Verification

- `[passed] npm.cmd test - 49 tests passed`
- `[passed] npm.cmd run build - strict TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`
- `[not run] authenticated production browser verification - deployment runs through the GitHub workflow after push`

### Deployment

- Deploy `inkfig-user-FE` through its existing GitHub Actions Cloudflare workflow.
- No backend deployment, migration, environment-variable, or configuration change is required.

### Git

- Branch: `main`
- Commit: `ecd0af1`
- Push: `successful`

### Notes

Pagination is currently performed over the protected user collection returned by the existing backend endpoint; server-side pagination can be introduced when the administration dataset requires it.

## 2026-10-07 - Remove owner-control footer surface

### Request

Remove the marked rounded surface around and below owned artwork while giving the three-dot control a visible hover response.

### Changes

- Removed the manageable card's visible background, outline-like shadow, and altered lower image corners.
- Reduced the reserved control spacing while retaining the three-dot control below the image at the bottom-right.
- Added a subtle olive background and one-pixel ring on hover, keyboard focus, and while the action menu is open.
- Added matching dark-theme interaction styling.

### Repositories

- `inkfig-user-FE`: refined the owned artwork card and menu interaction styling.

### Files

- `src/styles.css`: removes the footer surface and adds hover/focus/open feedback.
- `tests/foundation.test.mjs`: verifies the transparent container and interaction ring.
- `AGENT_FEATURE_LOG.md`: recorded this completed refinement.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- The control remains restricted to manageable works owned by the signed-in user.
- Backend authorization remains unchanged and authoritative.

### Frontend

- Owned artwork no longer has a visible rounded container beneath or around its image.
- The three-dot control visibly responds to pointer hover and keyboard focus and remains highlighted while open.
- Existing menu actions, positioning, themes, RTL/LTR behavior, responsiveness, and errors remain unchanged.

### Verification

- `[passed] npm.cmd test - 48 tests passed`
- `[passed] npm.cmd run build - TypeScript checks and Vite production build succeeded`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through its existing GitHub Actions workflow.
- No migrations or environment-variable changes are required.

### Git

- Branch: `main`
- Commit: `71c0271`
- Push: `successful`

### Notes

None

## 2026-10-07 - Add administrator work deletion controls

### Request

Give system administrators and administrators a UI for deleting any work and require them to write the deletion reason.

### Changes

- Added a Delete control to an opened artwork only when the authenticated session has `works.delete_any`.
- Added a confirmation dialog with a required 10–1000 character reason, validation, loading state, and API error handling.
- Removes a successfully deleted work from home and profile collections without requiring a reload.
- Added matching English and Arabic localization, dark-theme styling, and mobile-responsive dialog layout.
- Left owner controls and non-administrator artwork views unchanged.

### Repositories

- `inkfig-user-FE`: implemented the administrative UI and request helper.
- `inkfig-main-system`: provides the protected, audited deletion endpoint.
- `inkfig-user-system`: provides the administrator permission claim.

### Files

- `src/features/works/worksApi.ts`: added the moderation delete request.
- `src/features/home/ArtworkDetailModal.tsx`: added the permission-gated action and reason dialog.
- `src/features/home/HomePage.tsx`: wired deletion and local feed removal.
- `src/features/profile/ProfilePage.tsx`: wired deletion and local profile-list removal.
- `src/i18n/resources.ts`: added English and Arabic moderation text.
- `src/styles.css`: added responsive themed styles.
- `tests/foundation.test.mjs`: added structural coverage for permission, API, validation, styling, and translations.

### API

- `DELETE /api/v1/works/{work_id}/moderation`: sends `{ "reason": string }`; handles backend validation, authorization, missing-work, and storage errors through the shared request client.

### Database

- Migration: `20261007_011_create_work_deletion_audits.sql` in `inkfig-main-system`.
- Permission migration: `20261007_014_add_work_moderation_permission.sql` in `inkfig-user-system`.

### Permissions and scope

- Required permission: `works.delete_any`.
- The control appears only for `admin` and `system_administrator` sessions containing that permission.
- The backend remains authoritative and validates permission for every deletion request.

### Frontend

- Updated the existing artwork detail modal used by home and profile routes.
- Included localized validation, confirmation, loading, success-state removal, API errors, dark mode, and narrow-screen behavior.

### Verification

- `[passed] npm test` — 50 tests passed.
- `[passed] npm run build` — TypeScript and Vite production build completed.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` after both backend deployments and migrations.
- No frontend environment-variable changes.

### Git

- Branch: `main`
- Commit: `2e2b9aa`
- Push: `successful`

### Notes

Administrators with an existing session must sign out and sign in again to load the newly assigned permission into the frontend session.

## 2026-10-08 - Add smoothly animated account and notification panels

### Request

Open Find Accounts and Notifications as smooth sidebar sliders instead of navigating Notifications to a separate page.

### Changes

- Added a navigation-rail Notifications button that opens an adjacent panel without changing routes.
- Added smooth directional entrance motion to both the existing account finder and the new notification panel.
- Mirrors horizontal motion for Arabic and uses bottom-sheet motion above the mobile navigation.
- Ensures opening either panel closes the other and supports backdrop, close-button, Escape, and navigation dismissal.
- Added a localized empty notification state ready for notification data in a future ticket.
- Honors reduced-motion preferences and preserves existing account search, pagination, themes, and responsive behavior.

### Repositories

- `inkfig-user-FE`: sidebar interactions, notification panel, animation, localization, tests, and this log.
- `inkfig-user-system`: no changes required.
- `inkfig-main-system`: no changes required.

### API, database, permissions, and SnapStart

- No API, database, migration, permission, secret, or environment-variable changes.
- Notifications remain an empty frontend template; no notification backend contract was invented.
- No SnapStart impact because this is a frontend-only interaction change.

### Verification

- `[passed] npm.cmd test` - 51 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and the Vite production build succeeded.
- `[passed] git diff --check`
- `[not run] live browser interaction` - the in-app browser could not attach because the Windows sandbox helper failed during startup.

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend deployment or migration is required.

### Git

- Branch: `feature/sidebar-sliding-panels`
- Commit, rebase, push, merge, and main push: pending final synchronization.

## 2026-10-08 - Complete notifications and navigation hover refinement

### Request

Build the notification feed and counter, animate panel closing, refine navigation tooltips and hover scaling, rename Find Users, and lighten the search hover across devices.

### Changes

- Added server-backed notifications with unread badge, list, read state, 30-second/focus refresh, actor avatars, localized event messages, and timestamps.
- Added smooth reversed close animations for account and notification panels across desktop, mobile, LTR, RTL, and reduced-motion modes.
- Enlarges the logo and profile avatar on hover, adds faster soft-corner icon tooltips, darkens Find Users, and lightens search hover.
- Preserves responsive sizing and caps the badge at 99+.

### API and database

- Consumes `GET /api/v1/notifications` and `PUT /api/v1/notifications/read`.
- No frontend migration; depends on user-system migration `20261008_015_create_notifications.sql`.

### Verification

- `[passed] npm.cmd test` - 52 tests passed.
- `[passed] npm.cmd run build` - TypeScript and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment and Git

- Deploy after both backends, in user-system → main-system → frontend order.
- Branch: `feature/full-notifications`; commit/push pending final synchronization.

## 2026-10-08 - Disable automatic notification refresh

### Request

Stop recurring frontend notification refreshes and the focus-triggered refresh behavior.

### Changes

- Removed the 30-second notification polling interval.
- Removed notification refresh when the browser window regains focus.
- Preserved one initial notification load for the signed-in session and an explicit load when the notification panel opens.
- Preserved unread badges, mark-as-read behavior, persistent backend storage, responsive presentation, and authorization.

### Repositories

- `inkfig-user-FE`: changed notification-loading triggers and regression coverage.
- `inkfig-user-system`: no change required.
- `inkfig-main-system`: no change required.

### Files

- `src/features/navigation/AppSidebar.tsx`: removes interval and focus-based notification requests.
- `tests/foundation.test.mjs`: prevents recurring or focus-triggered notification refresh from returning.
- `AGENT_FEATURE_LOG.md`: records this ticket.

### API

No API contract changes. The frontend continues using `GET /api/v1/notifications` and `PUT /api/v1/notifications/read` only at explicit loading points.

### Database

No migration required.

### Permissions and scope

- Authentication and `profile.read_own` backend enforcement are unchanged.
- Users continue to receive only their own notification feed.

### Frontend

- Notifications load once when a signed-in session starts and whenever the user opens the notification panel.
- The frontend no longer makes background notification requests every 30 seconds or on browser focus.

### Verification

- `[passed] npm.cmd test` - 52 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through its existing Cloudflare workflow.
- No backend, migration, secret, or environment-variable changes are required.

### Git

- Branch: `fix/disable-notification-auto-refresh`
- Commit: included in this focused frontend commit.
- Push: pending final synchronization.

### Notes

The initial session request remains necessary to display an unread badge without requiring the user to open the panel first.

## 2026-10-08 - Receive live notifications

### Request

Show new notifications without refreshing or reopening InkFig.

### Changes

- Requests a short-lived WebSocket ticket, connects to AWS, refreshes the REST feed on notification invalidations, and reconnects with capped exponential backoff.
- Keeps the existing initial and panel-open loads as recovery paths.

### Repositories

- `inkfig-user-FE`: live connection and refresh behavior.

### Files

- `src/features/notifications/notificationApi.ts`: ticket API contract.
- `src/features/navigation/AppSidebar.tsx`: connection lifecycle and live refresh.
- `src/api/httpClient.ts`: permits notification requests to refresh expired sessions.
- `tests/foundation.test.mjs`: realtime regression coverage.

### API

- `POST /api/v1/notifications/socket-ticket`: obtains connection credentials.
- Receives `notifications.changed` over WSS and reloads `GET /api/v1/notifications`.

### Database

No frontend migration required.

### Permissions and scope

- Available only to authenticated sessions; backend ticket and feed authorization remain authoritative.

### Frontend

- Bell count and feed update live; reconnect delay grows to a maximum of 30 seconds.

### Verification

- `[passed] npm test` — 53 tests passed.
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy after both backends. No frontend environment variable is required because the backend returns the WebSocket URL.

### Git

- Branch: `main`
- Commit: `1b1e3ee`
- Push: `successful`

### Notes

None

## 2026-10-09 - Link like notifications to artwork cards

### Request

Show which artwork was liked, open that artwork card from the notification, and open the actor profile when their avatar is clicked.

### Changes

- Displays the related artwork title for like notifications.
- Separates avatar navigation from notification-content navigation.
- Opens actor avatars on their public profile.
- Opens like notification content on the exact artwork card through a shareable `work` query parameter.
- Fetches an artwork directly when it is not present in the current paginated home feed.
- Removes invalid or stale artwork query parameters safely.
- Intentionally leaves follow navigation, notification read state, WebSocket refresh behavior, and historical save rendering unchanged.

### Repositories

- `inkfig-user-FE`: implements notification presentation and deep-link modal behavior.
- `inkfig-user-system`: supplies related artwork titles.
- `inkfig-main-system`: supplies exact published artwork lookup.

### Files

- `src/features/notifications/notificationApi.ts`: adds nullable artwork title typing.
- `src/features/navigation/AppSidebar.tsx`: renders artwork context and separate avatar/content links.
- `src/features/works/worksApi.ts`: adds exact artwork retrieval.
- `src/features/home/HomePage.tsx`: resolves the artwork query parameter and opens the detail modal.
- `src/styles.css`: styles split notification links and truncated artwork titles in both themes.
- `tests/foundation.test.mjs`: verifies notification and deep-link wiring.

### API

- Consumes `GET /api/v1/notifications` with the new nullable `work_title` response field.
- Consumes `GET /api/v1/works/{work_id}` to retrieve the exact published artwork.

### Database

No migration required.

### Permissions and scope

- Notification data remains available only to the authenticated recipient.
- Actor profiles and published artwork retain their existing public visibility.
- Like/save controls inside the opened card remain permission-gated.
- Backend services validate notification scope and artwork visibility.

### Frontend

- Like notification text includes the artwork title.
- Clicking the notification avatar opens `/:language/profile/:actorUserId`.
- Clicking like notification content opens `/:language?work=:workId` and displays `ArtworkDetailModal`.
- Deleted or inaccessible artwork links are removed without leaving a broken modal.
- Existing responsive notification-panel behavior, RTL/LTR behavior, loading state, empty state, and dark theme remain supported.

### Verification

- `[passed] npm test` — 54 passed
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` after both backend deployments.
- No migrations are required before deployment.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `3c6b618`
- Push: `successful`

### Notes

The artwork URL is shareable and does not depend on the artwork being present in the first feed page.

## 2026-10-09 - Show live notification toast

### Request

Display a small notification rectangle at the physical bottom-left when an online user receives a WebSocket notification, and hide it after two minutes.

### Changes

- Added a compact live notification toast triggered only by WebSocket notification invalidations.
- Shows the actor avatar, action, and related artwork title when available.
- Automatically dismisses the toast after 120 seconds; a newer notification replaces it and restarts the timer.
- Added manual dismissal and preserved profile/artwork navigation from the toast.
- Intentionally left the existing notification panel, database persistence, read state, backend APIs, and WebSocket protocol unchanged.

### Repositories

- `inkfig-user-FE`: adds the live notification toast UI and behavior.

### Files

- `src/features/navigation/AppSidebar.tsx`: detects newly fetched live notifications and manages toast state and timeout.
- `src/styles.css`: adds responsive bottom-left toast styling, animation, dark theme, and reduced-motion behavior.
- `tests/foundation.test.mjs`: verifies live-only triggering, placement, accessibility, and two-minute duration.

### API

No API changes. The frontend continues consuming the existing notification feed and WebSocket invalidation event.

### Database

No migration required.

### Permissions and scope

- Only authenticated users with an active WebSocket connection can receive the live toast.
- Notification feed scope remains restricted to the authenticated recipient and is validated by the backend.
- Existing artwork and profile permissions remain unchanged.

### Frontend

- Adds an accessible `aria-live` toast at the physical bottom-left on desktop.
- Places the toast above mobile navigation on small screens.
- Supports light/dark themes, RTL/LTR layouts, manual close, reduced motion, profile navigation, and artwork deep links.
- Existing notifications loaded on initial page entry do not trigger a toast.

### Verification

- `[passed] npm test` — 55 passed
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE`.
- No migrations are required before deployment.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `73757ab`
- Push: `successful`

### Notes

Only the frontend presentation changed; notification persistence and delivery semantics remain unchanged.

## 2026-10-09 - Shorten live notification duration

### Request

Make the bottom-left live notification disappear after one minute and clarify behavior when multiple notifications arrive together.

### Changes

- Reduced the live notification auto-dismiss timeout from 120 seconds to 60 seconds.
- Preserved the existing newest-notification behavior: a newer event replaces the visible toast and restarts its timer.
- Intentionally left notification persistence, panel history, WebSocket delivery, navigation, and styling unchanged.

### Repositories

- `inkfig-user-FE`: updates the live toast duration and its regression test.

### Files

- `src/features/navigation/AppSidebar.tsx`: changes the live toast timeout to 60 seconds.
- `tests/foundation.test.mjs`: verifies the one-minute timeout.

### API

No API changes.

### Database

No migration required.

### Permissions and scope

- Existing authenticated notification-recipient scope is unchanged.
- Authorization continues to be validated by the backend.

### Frontend

- The active live notification toast now disappears after one minute.
- When multiple notifications arrive, the newest replaces the visible toast; all notifications remain available in the notification panel.

### Verification

- `[passed] npm test` — 55 passed
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE`.
- No migrations are required before deployment.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `35ab373`
- Push: `successful`

### Notes

A stacked or queued toast presentation can be added later without changing stored notification history.

## 2026-10-09 - Stack the newest five live notifications

### Request

Allow multiple live notification popups, display no more than the newest five, remove the oldest when a sixth arrives, and keep notifications unread until the notification panel is opened.

### Changes

- Replaced the single live toast with a FIFO stack capped at five notification items.
- Detects every newly fetched notification after a WebSocket invalidation, including several events discovered in one refresh.
- Removes the oldest visible item when the five-item limit is exceeded.
- Gives each toast its own one-minute expiration timer and manual dismissal behavior.
- Preserved unread state when toasts appear or are dismissed.
- Intentionally left database persistence, backend APIs, WebSocket messages, notification-panel behavior, and navigation targets unchanged.

### Repositories

- `inkfig-user-FE`: adds the capped live-notification stack.

### Files

- `src/features/navigation/AppSidebar.tsx`: tracks known notification IDs, manages a five-item FIFO stack, and manages per-item timers.
- `src/styles.css`: lays out responsive stacked notifications at the physical bottom-left.
- `tests/foundation.test.mjs`: verifies the five-item limit, live detection, one-minute timeout, and stack placement.

### API

No API changes. The existing notification feed and WebSocket invalidation event are reused.

### Database

No migration required.

### Permissions and scope

- Only notifications returned for the authenticated recipient can enter the live stack.
- Toast display does not modify notification read state.
- Backend notification scope and authorization remain unchanged and backend-validated.

### Frontend

- Shows up to five compact notification rectangles at the physical bottom-left.
- New notifications are appended; when a sixth arrives, the oldest visible notification is removed.
- Each notification disappears one minute after arrival or immediately when dismissed or followed.
- Notifications become read only through the existing notification-panel open flow.
- Responsive mobile placement, light/dark themes, RTL/LTR support, reduced motion, profile links, and artwork links remain supported.

### Verification

- `[passed] npm test` — 55 passed
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE`.
- No migrations are required before deployment.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `b53de54`
- Push: `successful`

### Notes

The stack is presentation-only; all notification history remains available from the backend-backed panel even after a toast expires or is evicted.

## 2026-10-09 - Add profile picture removal controls

### Request

Let profile owners either replace their current profile picture or remove it completely and return to the no-picture state.

### Changes

- Added separate Change and Remove actions to the editable profile avatar.
- Shows Remove only when the profile currently has an image.
- Added confirmation, busy-state protection, localized failure messaging, and immediate initials fallback after successful removal.
- Preserved existing image validation and replacement behavior.
- Intentionally left other users' profiles, signup avatar selection, account data, and profile navigation unchanged.

### Repositories

- `inkfig-user-FE`: adds profile-avatar removal API usage and responsive controls.
- `inkfig-user-system`: provides authenticated removal and storage cleanup.

### Files

- `src/features/profile/profileAvatarUpload.ts`: calls the profile-avatar DELETE endpoint.
- `src/features/profile/ProfilePage.tsx`: adds owner-only removal workflow and state handling.
- `src/i18n/resources.ts`: adds English and Arabic labels, confirmation, and error text.
- `src/styles.css`: styles responsive Change and Remove controls.
- `tests/foundation.test.mjs`: verifies API and UI wiring.

### API

- Consumes `DELETE /api/v1/profiles/avatar`, which returns 204 after clearing the authenticated user's avatar.

### Database

No migration required.

### Permissions and scope

- Controls appear only on the authenticated user's own profile.
- Requires the existing `profile.read_own` permission.
- The backend validates ownership using the authenticated principal.

### Frontend

- Hovering/focusing the owner avatar exposes Change and Remove controls.
- Mobile layouts keep the actions visible.
- Removing requires confirmation and replaces the image with the existing initials fallback.
- Supports Arabic/English, RTL/LTR, light/dark themes, busy states, and error handling.

### Verification

- `[passed] npm test` — 55 passed
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` after `inkfig-user-system`.
- No migrations are required before deployment.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `997af41`
- Push: `successful`

### Notes

The UI returns immediately to the same no-picture initials state used by accounts that never uploaded an avatar.

## 2026-10-09 - Crop profile pictures before upload

### Request

After selecting a profile picture, let the user choose the visible area through a circular crop frame with drag and zoom controls before saving.

### Changes

- Added an accessible modal crop workflow after profile-image selection.
- Supports pointer/touch dragging, 1×–3× zoom, Escape/cancel behavior, and responsive sizing.
- The circular frame exactly represents the portion used by the final circular avatar.
- Exports a 512×512 JPEG at 90 percent quality and uploads only the cropped result.
- Accepts JPEG, PNG, or WebP source images up to 20 MB while keeping the final backend upload within 2 MB.
- Added dedicated validation and upload error states.
- Intentionally left signup avatar upload, profile-picture removal controls, and backend image validation unchanged.

### Repositories

- `inkfig-user-FE`: adds native client-side cropping and localized UI.
- `inkfig-user-system`: guarantees removed avatar objects are deleted before the database reference is cleared.

### Files

- `src/features/profile/ProfileAvatarCropDialog.tsx`: implements crop positioning, zoom, canvas export, and modal controls.
- `src/features/profile/ProfilePage.tsx`: opens the crop dialog and uploads the cropped file.
- `src/features/profile/profileAvatarUpload.ts`: validates larger local source images separately from final upload limits.
- `src/i18n/resources.ts`: adds English and Arabic crop labels and errors.
- `src/styles.css`: adds responsive crop-frame, modal, mask, controls, and dark-theme styling.
- `tests/foundation.test.mjs`: verifies crop, zoom, output, localization, and styling contracts.

### API

No API changes. The cropped file uses the existing avatar upload preparation and completion endpoints.

### Database

No migration required.

### Permissions and scope

- Crop and upload controls appear only on the authenticated user's own profile.
- Existing `profile.read_own` backend permission and user-scoped object paths remain enforced.
- Backend validation still restricts the final upload to JPEG, PNG, or WebP and at most 2 MB.

### Frontend

- Selecting a valid image opens a centered crop dialog instead of uploading immediately.
- Users drag the image behind a fixed circular frame and adjust zoom from 1× to 3×.
- Save generates and uploads a 512×512 JPEG; Cancel leaves the current avatar unchanged.
- Supports mouse, touch, mobile sizing, keyboard Escape, English/Arabic, RTL/LTR, light/dark themes, busy states, and errors.

### Verification

- `[passed] npm test` — 56 passed
- `[passed] npm run build`
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` after `inkfig-user-system`.
- No migrations are required before deployment.
- No environment-variable or configuration changes.

### Git

- Branch: `main`
- Commit: `befd627`
- Push: `successful`

### Notes

The cropper uses native browser canvas and pointer events, so no additional UI or image-processing dependency was introduced.

## 2026-10-10 - Automatically continue the artwork gallery on scroll

### Request

Load additional gallery artwork automatically as the user scrolls down without requiring a manual Load more click.

### Changes

- Replaced the homepage gallery's normal Load more control with an `IntersectionObserver` sentinel.
- Starts fetching the next cursor page when the sentinel approaches within 600 pixels of the viewport.
- Supports chronological feeds, category filters, account-scoped feeds, and ranked semantic-search results.
- Preserves duplicate protection, cursor ordering, loaded cards, and the localized loading state.
- Stops automatic requests while loading or after an error; a manual button appears only as an explicit retry fallback when a continuation request fails.
- Added a compact theme-aware loading indicator and regression coverage for observer setup, cleanup, and request guards.

### Repositories

- `inkfig-user-FE`: infinite-scroll interaction, presentation, tests, and this log.
- `inkfig-main-system`: no changes; existing cursor pagination is reused.
- `inkfig-user-system`: no changes.

### API, database, permissions, and SnapStart

- Reuses existing `GET /api/v1/works` timestamp cursors and `GET /api/v1/works/search` numeric cursors.
- No API contract, database migration, permission, secret, environment-variable, or backend change is required.
- No AWS Lambda SnapStart impact because this is a browser-only frontend change.

### Verification

- `[passed] npm.cmd test` - 57 tests passed.
- `[passed] npm.cmd run build` - strict TypeScript checks and Vite production build succeeded.
- `[passed] git diff --check`

### Deployment

- Deploy `inkfig-user-FE` through the existing Cloudflare workflow.
- No backend deployment or migration ordering is required.

### Git

- Branch: `feature/gallery-infinite-scroll`
- Commit, rebase, merge, and push: completed after final synchronization.

## 2026-10-10 - Complete pagination for all growing collections

### Request

Ensure pagination is implemented throughout the project.

### Changes

- Added continuation loading to notification history while preserving unread counts and realtime refresh.
- Added paginated follower/following dialogs with duplicate-safe page appending.
- Updated administration loading to consume the backend's bounded page contract across every continuation page while preserving existing statistics, filters, and local page navigation.
- Retained existing pagination for artwork feeds, semantic search, profile posts, likes, saves, and account discovery.
- Added regression coverage for all new cursor transports and UI continuation state.

### Repositories and deployment order

- `inkfig-user-system`: adds missing notification, relationship, and administration cursors.
- `inkfig-user-FE`: consumes the new page contracts.
- `inkfig-main-system`: audited only; all growing work collections were already paginated.
- Deploy `inkfig-user-system` before `inkfig-user-FE`.

### API, database, permissions, and SnapStart

- Consumes cursor-aware notifications, followers, following, and administration endpoints.
- No database migration, permission, secret, or environment-variable changes.
- Frontend changes have no Lambda SnapStart impact.

### Verification

- `[passed] npm.cmd test` - 58 tests passed.
- `[passed] npm.cmd run build` - TypeScript and Vite production build succeeded.
- `[passed] git diff --check`

### Git

- Branch: `feature/complete-list-pagination`
- Commit, rebase, merge, and push: completed after final synchronization.
