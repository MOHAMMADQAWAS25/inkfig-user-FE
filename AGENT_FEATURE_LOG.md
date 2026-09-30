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
