import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const loginPage = readFileSync(new URL("../src/features/auth/LoginPage.tsx", import.meta.url), "utf8");
const authenticationApi = readFileSync(new URL("../src/features/auth/authenticationApi.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("../src/app/AppRouter.tsx", import.meta.url), "utf8");
const signup = readFileSync(new URL("../src/features/auth/SignupPage.tsx", import.meta.url), "utf8");
const registrationApi = readFileSync(new URL("../src/features/auth/registrationApi.ts", import.meta.url), "utf8");
const verifyEmailPage = readFileSync(new URL("../src/features/auth/VerifyEmailPage.tsx", import.meta.url), "utf8");
const passwordResetPage = readFileSync(new URL("../src/features/auth/PasswordResetPage.tsx", import.meta.url), "utf8");
const passwordField = readFileSync(new URL("../src/features/auth/PasswordField.tsx", import.meta.url), "utf8");
const dateOfBirthField = readFileSync(new URL("../src/features/auth/DateOfBirthField.tsx", import.meta.url), "utf8");
const passwordResetApi = readFileSync(new URL("../src/features/auth/passwordResetApi.ts", import.meta.url), "utf8");
const appProviders = readFileSync(new URL("../src/app/AppProviders.tsx", import.meta.url), "utf8");
const themeProvider = readFileSync(new URL("../src/theme/ThemeProvider.tsx", import.meta.url), "utf8");
const themeToggle = readFileSync(new URL("../src/theme/ThemeToggle.tsx", import.meta.url), "utf8");
const resources = readFileSync(new URL("../src/i18n/resources.ts", import.meta.url), "utf8");
const i18nProvider = readFileSync(new URL("../src/i18n/I18nProvider.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../src/features/home/HomePage.tsx", import.meta.url), "utf8");
const worksApi = readFileSync(new URL("../src/features/works/worksApi.ts", import.meta.url), "utf8");
const uploadWorkPage = readFileSync(new URL("../src/features/works/UploadWorkPage.tsx", import.meta.url), "utf8");

test("uses the approved frontend dependencies", () => {
  assert.ok(packageJson.dependencies.react);
  assert.ok(packageJson.dependencies["react-router-dom"]);
  assert.ok(packageJson.dependencies["lucide-react"]);
  for (const forbidden of ["@mui/material", "bootstrap", "redux", "styled-components", "tailwindcss"]) {
    assert.equal(packageJson.dependencies[forbidden], undefined);
  }
});

test("requires a six-digit email verification code before login", () => {
  assert.match(router, /\/:language\/verify-email/);
  assert.match(registrationApi, /\/auth\/verify-email/);
  assert.match(registrationApi, /\/auth\/resend-verification/);
  assert.match(verifyEmailPage, /pattern="\[0-9\]\{6\}"/);
  assert.match(verifyEmailPage, /one-time-code/);
  assert.match(verifyEmailPage, /cooldown/);
});

test("logs in and logs out through the InkFig backend", () => {
  assert.match(authenticationApi, /\/auth\/login/);
  assert.match(authenticationApi, /\/auth\/logout/);
  assert.match(loginPage, /loginUser/);
  assert.match(loginPage, /setSession/);
  assert.doesNotMatch(loginPage, /disabled type="submit"/);
});

test("resets passwords through a three-stage email-code flow", () => {
  assert.match(loginPage, /reset-password/);
  assert.match(router, /\/:language\/reset-password/);
  assert.match(passwordResetApi, /\/auth\/password-reset\/request/);
  assert.match(passwordResetApi, /\/auth\/password-reset\/verify/);
  assert.match(passwordResetApi, /\/auth\/password-reset\/confirm/);
  assert.match(passwordResetPage, /pattern="\[0-9\]\{6\}"/);
  assert.match(passwordResetPage, /resetToken/);
  assert.match(passwordResetPage, /password !== confirmation/);
  assert.match(passwordResetPage, /hourlyLimitReached/);
  assert.match(passwordResetPage, /cooldown/);
  assert.match(passwordResetApi, /hourly_limit_reached/);
});

test("shows backend-enforced hourly code limits in both email flows", () => {
  assert.match(registrationApi, /hourly_limit_reached/);
  assert.match(verifyEmailPage, /hourlyLimitReached/);
  assert.match(verifyEmailPage, /formatWait/);
  assert.match(resources, /auth\.hourlyEmailLimit/);
});

test("provides localized signup with every required field", () => {
  assert.match(router, /\/:language\/signup/);
  for (const field of ["email", "full_name", "phone_number", "gender", "date_of_birth", "password", "password_confirmation"]) {
    assert.match(`${signup}\n${passwordField}\n${dateOfBirthField}`, new RegExp(`name=["']?${field}["']?`));
  }
  assert.match(signup, /students\\\.hebron\\\.edu/);
  assert.match(signup, /PHONE_NUMBER = \/\^\[0-9\]\{10\}\$\//);
  assert.match(registrationApi, /\/auth\/signup/);
});

test("defines shared visual tokens and responsive RTL behavior", () => {
  assert.match(styles, /--brand-leaf:\s*#617d2b/);
  assert.match(styles, /--brand-deep:\s*#39431c/);
  assert.match(styles, /--brand-cream:\s*#eee7bd/);
  assert.match(styles, /--brand-fig:\s*#982824/);
  assert.match(styles, /--primary:\s*#a9b65f/);
  assert.match(styles, /--radius:\s*8px/);
  assert.match(styles, /\[dir="rtl"\]/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});

test("uses the InkFig logo for application branding", () => {
  assert.match(indexHtml, /inkfig-logo\.svg/);
  assert.match(homePage, /inkfig-logo\.svg/);
  assert.match(styles, /\.auth-logo/);
  assert.match(styles, /\.brand-logo/);
});

test("keeps the InkFig brand name untranslated in every locale", () => {
  assert.equal([...resources.matchAll(/"app\.name": "InkFig"/g)].length, 2);
  assert.match(resources, /"auth\.getStarted": "انضم إلى مجتمع InkFig"/);
  assert.doesNotMatch(resources, /إنكفِغ/);
  assert.doesNotMatch(loginPage, /className="eyebrow brand-name"/);
  assert.doesNotMatch(signup, /className="eyebrow brand-name"/);
  assert.match(verifyEmailPage, /className="eyebrow brand-name"/);
  assert.match(styles, /\.brand-name\s*\{[^}]*text-transform:\s*none/);
});

test("provides persistent logo-derived light and dark themes", () => {
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /--bg:\s*#f7f3d9/);
  assert.match(styles, /--bg:\s*#10140c/);
  assert.match(styles, /--brand-leaf:\s*#617d2b/);
  assert.match(styles, /--brand-cream:\s*#eee7bd/);
  assert.match(styles, /--brand-fig:\s*#982824/);
  assert.match(appProviders, /ThemeProvider/);
  assert.match(themeProvider, /inkfig\.theme/);
  assert.match(themeProvider, /prefers-color-scheme: dark/);
  assert.match(themeToggle, /theme\.useLight/);
  assert.match(themeToggle, /theme\.useDark/);
});

test("harmonizes light authentication cards while preserving dark cards", () => {
  assert.match(styles, /--card-background:\s*linear-gradient\(145deg, rgb\(255 253 240/);
  assert.match(styles, /\.auth-card\s*\{[\s\S]*--text:\s*#283014/);
  assert.match(styles, /\.auth-card::before[\s\S]*var\(--brand-fig\)/);
  assert.match(styles, /:root\[data-theme="dark"\] \.auth-card\s*\{[\s\S]*--text:\s*#f7f2d8/);
});
test("softens only the light-theme login card from the dark palette", () => {
  assert.ok(loginPage.includes('className="auth-card login-card"'));
  assert.ok(styles.includes("rgb(57 67 28 / 0.78)"));
  assert.ok(styles.includes("--input-background: rgb(16 20 12 / 0.46)"));
  assert.ok(styles.includes(':root[data-theme="dark"] .login-card'));
  assert.ok(styles.includes("background: var(--card-background)"));
});

test("matches signup and authentication theme toggle to the login card", () => {
  assert.match(styles, /\.login-card, \.signup-card\s*\{/);
  assert.match(styles, /:root\[data-theme="dark"\] \.login-card, :root\[data-theme="dark"\] \.signup-card/);
  assert.match(styles, /\.auth-theme-control \.theme-toggle\s*\{[^}]*background:\s*linear-gradient\(145deg, rgb\(57 67 28 \/ 0\.78\), rgb\(32 40 25 \/ 0\.68\)\)/);
  assert.match(styles, /:root\[data-theme="dark"\] \.auth-theme-control \.theme-toggle\s*\{[^}]*background:\s*var\(--card-background\)/);
});

test("places the language control opposite the reading origin without outer form shadows", () => {
  assert.match(styles, /\.login-card > \.text-button, \.signup-card > \.text-button \{[^}]*margin-left:\s*auto;[^}]*margin-right:\s*0/);
  assert.match(styles, /\[dir="rtl"\] \.login-card > \.text-button, \[dir="rtl"\] \.signup-card > \.text-button \{[^}]*margin-left:\s*0;[^}]*margin-right:\s*auto/);
  assert.match(styles, /\.login-card, \.signup-card\s*\{[^}]*box-shadow:\s*inset/);
  assert.match(styles, /:root\[data-theme="dark"\] \.login-card, :root\[data-theme="dark"\] \.signup-card\s*\{[^}]*box-shadow:\s*inset/);
});

test("centers the logo inside both forms and themes their scrollbars", () => {
  assert.match(loginPage, /<section className="auth-card login-card"[\s\S]*<img className="auth-logo"/);
  assert.match(signup, /<section className="auth-card signup-card"[\s\S]*<img className="auth-logo"/);
  assert.match(styles, /\.auth-logo \{[^}]*margin-inline:\s*auto/);
  assert.match(styles, /\.login-card \.auth-logo \{[^}]*width:\s*min\(180px, 54%\)/);
  assert.match(styles, /scrollbar-color:\s*var\(--auth-scrollbar-thumb\) var\(--auth-scrollbar-track\)/);
  assert.match(styles, /\.auth-form-column \.auth-card::\-webkit-scrollbar-thumb/);
  assert.match(styles, /--auth-scrollbar-thumb:\s*#a9b65f/);
  assert.match(styles, /:root\[data-theme="dark"\] \.login-card,[\s\S]*--auth-scrollbar-thumb:\s*#617d2b/);
});

test("uses the supplied responsive background on login and signup", () => {
  assert.ok(loginPage.includes('className="auth-layout auth-photo-background"'));
  assert.ok(signup.includes('className="auth-layout auth-layout-scroll auth-photo-background"'));
  assert.ok(loginPage.includes("auth-enter-from-start"));
  assert.ok(signup.includes("auth-enter-from-end"));
  assert.doesNotMatch(loginPage, /auth-form-logo/);
  assert.doesNotMatch(signup, /auth-form-logo/);
  assert.match(styles, /\.auth-photo-background::before\s*\{[\s\S]*auth-background-light-hd\.png/);
  assert.match(styles, /\.auth-photo-background::after\s*\{[\s\S]*auth-background-dark-hd\.png/);
  assert.match(styles, /\.auth-form-column\s*\{[^}]*max-height:\s*calc\(100svh - 40px\)[^}]*margin-inline:\s*auto/);
  assert.match(styles, /\.auth-form-column \.auth-card \{[^}]*overflow-y:\s*auto/);
  assert.match(styles, /\.auth-photo-background\s*\{[^}]*overflow:\s*hidden/);
});

test("serves a public localized artwork gallery as the default experience", () => {
  assert.match(router, /path="\/:language" element=\{<HomePage \/>\}/);
  assert.match(router, /Navigate replace to="\/en"/);
  assert.match(i18nProvider, /=== "ar" \? "ar" : "en"/);
  assert.match(homePage, /className="artwork-grid"/);
  assert.match(homePage, /gallery-primary-link/);
  assert.match(homePage, /session \?/);
  assert.doesNotMatch(router, /dashboard|welcome|RequireAuth|AppShell/);
  assert.match(styles, /gallery-ivory-background\.png/);
  assert.match(styles, /\.artwork-grid \{ columns: 3 300px/);
  assert.match(resources, /"home\.collectionTitle"/);
});

test("loads public works and provides authenticated direct image uploads", () => {
  assert.match(worksApi, /"GET", "\/works"/);
  assert.match(worksApi, /"GET", "\/works\/types"/);
  assert.match(worksApi, /"POST", "\/works\/uploads"/);
  assert.match(worksApi, /method:"PUT"/);
  assert.match(worksApi, /new FormData\(\)/);
  assert.match(worksApi, /\/publish/);
  assert.match(worksApi, /\/like/);
  assert.match(router, /\/:language\/upload/);
  assert.match(uploadWorkPage, /Navigate replace/);
  assert.match(uploadWorkPage, /accept="image\/jpeg,image\/png,image\/webp,image\/gif"/);
  assert.match(homePage, /getWorks/);
  assert.match(homePage, /setWorkLike/);
});

test("provides polished authentication controls and reset-page motion", () => {
  assert.match(passwordField, /EyeOff/);
  assert.match(passwordField, /auth\.showPassword/);
  assert.match(dateOfBirthField, /CalendarDays/);
  assert.match(signup, /placeholder="05xxxxxxxx"/);
  assert.doesNotMatch(signup, /auth\.emailHint|auth\.phoneHint/);
  assert.match(passwordResetPage, /auth-photo-background/);
  assert.match(passwordResetPage, /auth-enter-from-end/);
  assert.doesNotMatch(signup, /placeholder="[^"]*@(?:students\.)?hebron\.edu/);
  assert.doesNotMatch(passwordResetPage, /placeholder="[^"]*@(?:students\.)?hebron\.edu/);
  assert.match(styles, /\.login-form-column \{ width: min\(600px, 100%\); \}/);
});

test("centers authentication forms with responsive signup columns and motion", () => {
  assert.match(signup, /className="form-stack signup-form-grid"/);
  assert.match(signup, /className="signup-email-field"/);
  assert.match(styles, /\.signup-form-column \{ width: min\(820px, 100%\); \}/);
  assert.match(styles, /\.signup-form-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styles, /@keyframes auth-card-enter/);
  assert.match(styles, /transition: opacity 560ms ease/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.signup-form-grid \{ grid-template-columns: 1fr; \}/);
  assert.match(styles, /prefers-reduced-motion[\s\S]*animation-duration: 0\.01ms !important/);
});
