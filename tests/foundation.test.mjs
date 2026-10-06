import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const loginPage = readFileSync(new URL("../src/features/auth/LoginPage.tsx", import.meta.url), "utf8");
const authenticationApi = readFileSync(new URL("../src/features/auth/authenticationApi.ts", import.meta.url), "utf8");
const authContext = readFileSync(new URL("../src/features/auth/AuthContext.tsx", import.meta.url), "utf8");
const sharedTypes = readFileSync(new URL("../src/shared/types.ts", import.meta.url), "utf8");
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
const languageToggle = readFileSync(new URL("../src/i18n/LanguageToggle.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../src/features/home/HomePage.tsx", import.meta.url), "utf8");
const artworkDetailModal = readFileSync(new URL("../src/features/home/ArtworkDetailModal.tsx", import.meta.url), "utf8");
const worksApi = readFileSync(new URL("../src/features/works/worksApi.ts", import.meta.url), "utf8");
const uploadWorkPage = readFileSync(new URL("../src/features/works/UploadWorkPage.tsx", import.meta.url), "utf8");
const profilePage = readFileSync(new URL("../src/features/profile/ProfilePage.tsx", import.meta.url), "utf8");
const profileApi = readFileSync(new URL("../src/features/profile/profileApi.ts", import.meta.url), "utf8");
const appSidebar = readFileSync(new URL("../src/features/navigation/AppSidebar.tsx", import.meta.url), "utf8");
const placeholderPage = readFileSync(new URL("../src/features/navigation/FeaturePlaceholderPage.tsx", import.meta.url), "utf8");
const settingsPage = readFileSync(new URL("../src/features/settings/SettingsPage.tsx", import.meta.url), "utf8");
const settingsApi = readFileSync(new URL("../src/features/settings/settingsApi.ts", import.meta.url), "utf8");

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

test("provides Palestine-time defaults and persistent manual themes", () => {
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /--bg:\s*#f7f3d9/);
  assert.match(styles, /--bg:\s*#10140c/);
  assert.match(styles, /--brand-leaf:\s*#617d2b/);
  assert.match(styles, /--brand-cream:\s*#eee7bd/);
  assert.match(styles, /--brand-fig:\s*#982824/);
  assert.match(appProviders, /ThemeProvider/);
  assert.match(themeProvider, /inkfig\.theme/);
  assert.match(themeProvider, /PALESTINE_TIME_ZONE = "Asia\/Hebron"/);
  assert.match(themeProvider, /LIGHT_THEME_START_HOUR = 6/);
  assert.match(themeProvider, /DARK_THEME_START_HOUR = 18/);
  assert.match(themeProvider, /getPalestineTimeTheme/);
  assert.match(themeProvider, /setInterval\(synchronizeWithPalestineTime, 60_000\)/);
  assert.doesNotMatch(themeProvider, /prefers-color-scheme/);
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
  assert.match(homePage, /gallery-guest-avatar/);
  assert.match(homePage, /!session&&<Link className="gallery-guest-avatar"/);
  assert.doesNotMatch(router, /dashboard|welcome|RequireAuth|AppShell/);
  assert.match(styles, /gallery-ivory-background\.png/);
  assert.match(styles, /\.artwork-grid \{ column-count: 4; column-gap: 18px/);
  assert.match(styles, /@media \(max-width: 1100px\) \{ \.artwork-grid \{ column-count: 3; \} \}/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.artwork-grid \{ column-count: 2; column-gap: 12px/);
  assert.match(styles, /@media \(max-width: 520px\)[\s\S]*\.artwork-grid \{ column-count: 2; column-gap: 10px/);
  assert.match(styles, /\.artwork-image \{[^}]*width: 100%;[^}]*height: auto;/);
  assert.match(styles, /\.artwork-pin-media/);
  assert.match(styles, /\.artwork-pin-like/);
  assert.doesNotMatch(homePage, /<h3>\{work\.title\}<\/h3>/);
  assert.doesNotMatch(homePage, /artwork-type-tag/);
  assert.doesNotMatch(homePage, /artwork-pin-uploader/);
  assert.match(styles, /\.artwork-type-tag/);
  assert.doesNotMatch(homePage, /workTypeTone\(work\)/);
  assert.match(styles, /artwork-type-tag--violet/);
  assert.match(styles, /artwork-type-tag--terracotta/);
  assert.match(styles, /artwork-type-tag--magenta/);
  assert.match(styles, /\.artwork-pin-media:hover \.artwork-pin-like/);
  assert.match(styles, /@media \(hover: none\)/);
  assert.match(resources, /"home\.collectionTitle"/);
});

test("loads public works and provides authenticated direct image uploads", () => {
  assert.match(worksApi, /"GET", `\/works\$\{query\}`/);
  assert.match(worksApi, /"GET", "\/works\/types"/);
  assert.match(worksApi, /"POST", "\/works\/uploads"/);
  assert.match(worksApi, /method:"PUT"/);
  assert.match(worksApi, /new FormData\(\)/);
  assert.match(worksApi, /file\.size <= 0/);
  assert.match(worksApi, /MAX_WORK_FILE_SIZE/);
  assert.match(worksApi, /WORK_IMAGE_TYPES/);
  assert.match(worksApi, /url\.protocol === "http:" \|\| url\.protocol === "https:"/);
  assert.match(worksApi, /links\.length>10/);
  assert.match(worksApi, /new Set\(links\.map/);
  assert.match(worksApi, /\/publish/);
  assert.match(worksApi, /\/like/);
  assert.match(router, /\/:language\/upload/);
  assert.match(uploadWorkPage, /Navigate replace/);
  assert.match(uploadWorkPage, /accept="image\/jpeg,image\/png,image\/webp,image\/gif"/);
  assert.match(uploadWorkPage, /handleFileChange/);
  assert.match(uploadWorkPage, /works\.emptyFile/);
  assert.match(uploadWorkPage, /event\.target\.value=""/);
  assert.match(uploadWorkPage, /links\.length<10/);
  assert.match(uploadWorkPage, /works\.addLink/);
  assert.match(artworkDetailModal, /work\.links\.map/);
  assert.match(artworkDetailModal, /noopener noreferrer/);
  assert.match(homePage, /getWorks/);
  assert.match(homePage, /setWorkLike/);
  assert.match(homePage, /ArtworkDetailModal/);
  assert.match(homePage, /setSelectedWorkId/);
  assert.match(homePage, /artwork-image-button/);
});

test("keeps authentication tokens in secure backend cookies and refreshes expired access", () => {
  assert.match(authenticationApi, /"\/auth\/login"/);
  assert.match(authenticationApi, /"\/auth\/logout"/);
  assert.doesNotMatch(authenticationApi, /access_token:\s*string|refresh_token:\s*string/);
  assert.doesNotMatch(authContext, /\.accessToken|\.refreshToken/);
  assert.doesNotMatch(sharedTypes, /accessToken|refreshToken/);
  assert.doesNotMatch(loginPage, /response\.access_token|response\.refresh_token/);
  assert.match(readFileSync(new URL("../src/api/httpClient.ts", import.meta.url), "utf8"), /credentials:\s*"include"/);
  assert.match(readFileSync(new URL("../src/api/httpClient.ts", import.meta.url), "utf8"), /\/auth\/refresh/);
  assert.match(readFileSync(new URL("../src/api/httpClient.ts", import.meta.url), "utf8"), /response\.status === 401/);
  assert.doesNotMatch(worksApi, /Authorization|\{token\}/);
});

test("opens an accessible artwork detail modal with complete public metadata", () => {
  assert.match(artworkDetailModal, /role="dialog"/);
  assert.match(artworkDetailModal, /aria-modal="true"/);
  assert.match(artworkDetailModal, /work\.description/);
  assert.match(artworkDetailModal, /work\.created_at/);
  assert.match(artworkDetailModal, /work\.like_count/);
  assert.match(artworkDetailModal, /artwork-modal-save/);
  assert.match(resources, /"home\.saveWork": "Save"/);
  assert.doesNotMatch(resources, /Save artwork/);
  assert.match(styles, /\.artwork-modal-save:hover span/);
  assert.match(artworkDetailModal, /onToggleSave/);
  assert.match(artworkDetailModal, /artwork-modal-type-tag/);
  assert.match(artworkDetailModal, /work\.links\.map/);
  assert.match(artworkDetailModal, /noopener noreferrer/);
  assert.match(artworkDetailModal, /event\.key === "Escape"/);
  assert.match(styles, /\.artwork-modal-backdrop/);
  assert.match(styles, /@media \(max-width: 780px\)/);
});

test("provides an authenticated profile with posts and likes collections", () => {
  assert.match(router, /\/:language\/profile/);
  assert.match(homePage, /\$\{language\}\/profile/);
  assert.match(profilePage, /Navigate replace/);
  assert.match(profilePage, /getUserWorks/);
  assert.match(profilePage, /getLikedWorks/);
  assert.match(profilePage, /profile\.posts/);
  assert.match(profilePage, /profile\.likes/);
  assert.match(profilePage, /role="tablist"/);
  assert.match(profilePage, /role="tab"/);
  assert.match(profilePage, /aria-selected/);
  assert.match(profilePage, /const \[section,setSection\]/);
  assert.match(profilePage, /ArtworkDetailModal/);
  assert.match(worksApi, /"\/works\/me"/);
  assert.match(worksApi, /"\/works\/likes"/);
  assert.match(styles, /\.profile-artwork-grid/);
  assert.match(profilePage, /className="artwork-card"/);
  assert.match(profilePage, /className="artwork-pin-media"/);
  assert.match(profilePage, /className="artwork-image-button"/);
  assert.match(profilePage, /className=\{`artwork-pin-like/);
  assert.match(profilePage, /className=\{`artwork-pin-save/);
  assert.doesNotMatch(profilePage, /artwork-type-tag|profile-artwork-details/);
  assert.match(styles, /\.profile-tabs/);
  assert.equal([...resources.matchAll(/"profile\.likes"/g)].length, 2);
});

test("orders profile tabs across the divider with an animated red underline", () => {
  const postsIndex = profilePage.indexOf('aria-selected={section==="posts"}');
  const savedIndex = profilePage.indexOf('aria-selected={section==="saved"}');
  const likesIndex = profilePage.indexOf('aria-selected={section==="likes"}');
  assert.ok(postsIndex < savedIndex && savedIndex < likesIndex);
  assert.match(styles, /\.profile-tabs \{ display: grid;[^}]*grid-template-columns: repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.profile-tabs button:nth-child\(1\) \{ justify-self: start/);
  assert.match(styles, /\.profile-tabs button:nth-child\(2\) \{ justify-self: center/);
  assert.match(styles, /\.profile-tabs button:nth-child\(3\) \{ justify-self: end/);
  assert.match(styles, /background: #982824;[^}]*transform: scaleX\(0\)/);
  assert.match(styles, /button:hover::after[^}]*button:focus-visible::after[^}]*button\.active::after[^}]*transform: scaleX\(1\)/);
});

test("filters the homepage by all canonical artwork categories", () => {
  for (const code of ["digital-art", "hand-art", "video", "audio", "animation", "games", "interactive", "vr-ar"]) {
    assert.ok(homePage.includes(`code: "${code}"`));
  }
  assert.match(homePage, /className="gallery-filters"/);
  assert.match(homePage, /aria-pressed/);
  assert.match(homePage, /setActiveCategory/);
  assert.match(worksApi, /type_code=\$\{encodeURIComponent\(typeCode\)\}/);
  assert.match(styles, /:root\[data-theme="dark"\] \.gallery-filters button/);
  for (const key of ["digitalArt", "handArt", "video", "audio", "animation", "games", "interactive", "vrAr"]) {
    assert.equal([...resources.matchAll(new RegExp(`"home\\.filter\\.${key}"`, "g"))].length, 2);
  }
});

test("matches the homepage theme toggle to the navbar surface", () => {
  assert.match(styles, /\.gallery-header \.theme-toggle \{[^}]*background:\s*rgb\(247 243 217 \/ 0\.82\)/);
  assert.match(styles, /:root\[data-theme="dark"\] \.gallery-header \.theme-toggle \{[^}]*background:\s*rgb\(16 20 12 \/ 0\.84\)/);
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
test("keeps matching language and theme controls fixed at the physical top right on sign in", () => {
  assert.ok(loginPage.includes("auth-theme-control auth-page-controls"));
  assert.ok(loginPage.includes("<ThemeToggle /><LanguageToggle />"));
  assert.doesNotMatch(loginPage, /className="text-button"/);
  assert.ok(languageToggle.includes("Languages"));
  assert.ok(languageToggle.includes("setLanguage(nextLanguage)"));
  assert.ok(resources.includes('"language.useArabic"'));
  assert.ok(resources.includes('"language.useEnglish"'));
  assert.ok(styles.includes("top: 18px; right: 18px; bottom: auto; left: auto"));
  assert.ok(styles.includes(".auth-page-controls { display: flex; gap: 10px; direction: ltr; }"));
});

test("uses the fixed language and theme controls on signup and password reset", () => {
  for (const page of [signup, passwordResetPage]) {
    assert.ok(page.includes("auth-theme-control auth-page-controls"));
    assert.ok(page.includes("<ThemeToggle /><LanguageToggle />"));
    assert.doesNotMatch(page, /className="text-button"/);
  }
  assert.doesNotMatch(passwordResetPage, /className="eyebrow brand-name"/);
});

test("features the Ink your world hero lockup", () => {
  assert.match(homePage, /className="gallery-hero-title"/);
  assert.match(homePage, /home\.titleInk/);
  assert.match(homePage, /home\.titleYour/);
  assert.match(homePage, /home\.titleWorld/);
  assert.match(resources, /"home\.title": "Ink your world"/);
  assert.match(styles, /\.gallery-hero-title-outline[^}]*-webkit-text-stroke:\s*2px #982824/);
  assert.match(styles, /\.gallery-hero-title-accent\s*\{[^}]*color:\s*#779439/);
});
test("builds a searchable icon-first homepage header", () => {
  assert.doesNotMatch(homePage, /gallery-nav|gallery-language/);
  assert.match(appSidebar, /<LanguageToggle\/>/);
  assert.match(homePage, /className="gallery-search"/);
  assert.match(homePage, /setSearchQuery/);
  assert.match(homePage, /visibleWorks\.map/);
  assert.match(homePage, /<AppSidebar \/>/);
  assert.match(appSidebar, /className="gallery-profile-menu app-sidebar-profile"/);
  assert.match(appSidebar, /className="gallery-profile-popover"/);
  assert.match(appSidebar, /session\.fullName\.trim\(\)\.charAt\(0\)/);
  assert.match(appSidebar, /onClick=\{signOut\}/);
  assert.match(styles, /\.gallery-profile-popover/);
  assert.match(styles, /\.gallery-search:focus-within/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.gallery-search \{ grid-column: 1 \/ -1; grid-row: 2; \}/);
  for (const key of ["searchPlaceholder", "noSearchResults", "profileMenu", "viewProfile", "preferences"]) {
    assert.equal([...resources.matchAll(new RegExp(`"home\\.${key}"`, "g"))].length, 2);
  }
});
test("closes the homepage profile menu when clicking outside it", () => {
  assert.match(appSidebar, /useRef<HTMLDetailsElement>\(null\)/);
  assert.match(appSidebar, /ref=\{profileMenuRef\}/);
  assert.match(appSidebar, /document\.addEventListener\("pointerdown",closeProfileMenu\)/);
  assert.match(appSidebar, /!menu\.contains\(event\.target\)/);
  assert.match(appSidebar, /menu\.removeAttribute\("open"\)/);
  assert.match(appSidebar, /document\.removeEventListener\("pointerdown",closeProfileMenu\)/);
});

test("places the signed-in profile control above Settings in the shared sidebar", () => {
  assert.match(appSidebar, /app-sidebar-account/);
  assert.ok(appSidebar.indexOf("app-sidebar-profile") < appSidebar.indexOf("app-sidebar-settings"));
  assert.doesNotMatch(homePage, /ref=\{profileMenuRef\}/);
  assert.match(styles, /\.app-sidebar-account \{[^}]*margin-top: auto/);
});

test("provides secure profile, password, and account settings", () => {
  assert.match(router, /SettingsPage/);
  assert.match(settingsPage, /"profile" \| "password" \| "account"/);
  assert.match(settingsPage, /disabled dir="ltr" value=\{profile\.email\}/);
  assert.match(settingsPage, /\^\\d\{10\}\$/);
  assert.match(settingsPage, /password !== confirmation/);
  assert.match(settingsPage, /requestPasswordReset/);
  assert.match(settingsPage, /verifyPasswordResetCode/);
  assert.match(settingsPage, /confirmPasswordReset/);
  assert.match(settingsPage, /session!\.email/);
  assert.match(settingsPage, /name="deactivate_password"/);
  assert.match(loginPage, /status === 423/);
  assert.match(settingsPage, /changePassword\(currentPassword, password, confirmation\)/);
  assert.match(settingsPage, /current-password/);
  assert.match(settingsPage, /auth\.forgotPassword/);
  assert.match(settingsPage, /hourlyLimitReached/);
  assert.match(settingsPage, /cooldown/);
  assert.match(settingsPage, /window\.confirm/);
  assert.match(settingsApi, /\/settings\/profile/);
  assert.match(settingsApi, /\/settings\/password/);
  assert.match(settingsApi, /\/settings\/account-status/);
  assert.match(styles, /\.settings-shell/);
  assert.match(styles, /\.settings-reset-dialog/);
  assert.match(styles, /:root\[data-theme="dark"\] \.settings-page/);
});

test("saves artworks for registered users and exposes a Saved profile tab", () => {
  assert.match(worksApi, /saved_by_me:\s*boolean/);
  assert.match(worksApi, /getSavedWorks/);
  assert.match(worksApi, /\/works\/saves/);
  assert.match(worksApi, /setWorkSave/);
  assert.match(worksApi, /\/save/);
  assert.match(homePage, /hasPermission\(session\.permissions,"works\.save"\)/);
  assert.match(homePage, /className=\{`artwork-pin-save/);
  assert.match(homePage, /work\.saved_by_me/);
  assert.match(homePage, /<Bookmark/);
  assert.match(profilePage, /getSavedWorks/);
  assert.match(profilePage, /profile\.saved/);
  assert.match(profilePage, /profile\.noSaved/);
  assert.match(profilePage, /section==="saved"/);
  assert.match(styles, /\.artwork-pin-save\.saved[^}]*color:\s*#f4c430/);
  assert.match(styles, /\.artwork-pin-media:hover \.artwork-pin-save/);
  assert.equal([...resources.matchAll(/"profile\.saved"/g)].length, 2);
});

test("provides a fixed icon rail and future-feature templates", () => {
  for (const icon of ["House", "Trophy", "Plus", "Bell", "Bookmark", "Settings"]) assert.match(appSidebar, new RegExp(icon));
  assert.match(appSidebar, /profile\?section=saved/);
  assert.match(styles, /\.app-sidebar \{ position: fixed/);
  assert.match(styles, /border-right: 1px solid/);
  assert.match(styles, /\.gallery-home, \.app-page-with-sidebar, \.app-feature-page \{ padding-left: 78px/);
  for (const route of ["exhibition", "notifications", "settings"]) assert.match(router, new RegExp(`/:language/${route}`));
  assert.match(placeholderPage, /app-feature-placeholder/);
  assert.match(uploadWorkPage, /<AppSidebar\/>/);
  assert.match(profilePage, /<AppSidebar\/>/);
});

test("keeps gallery cards minimal until hover and opens full details", () => {
  assert.doesNotMatch(homePage, /artwork-pin-uploader|workTypeTone/);
  assert.match(styles, /\.artwork-pin-like \{ opacity: 0/);
  assert.match(styles, /\.artwork-pin-save\.saved \{ opacity: 0/);
  assert.match(styles, /\.artwork-pin-media, \.artwork-image-button \{ cursor: pointer/);
  assert.match(homePage, /setSelectedWorkId\(work\.work_id\)/);
  assert.match(styles, /html \{ scroll-behavior: smooth/);
  assert.match(resources, /"home\.searchPlaceholder": "Search"/);
});

test("opens Saved directly from the rail", () => {
  assert.match(profilePage, /useSearchParams/);
  assert.match(profilePage, /const requested=/);
  assert.match(profilePage, /setSearchParams/);
  assert.match(profilePage, /section==="saved"/);
});

test("provides public social profiles and follow controls", () => {
  assert.match(router, /profile\/:userId/);
  assert.match(profilePage, /profile\.followers/);
  assert.match(profilePage, /profile\.following/);
  assert.match(profilePage, /profile\.totalLikes/);
  assert.match(profilePage, /setProfileFollow/);
  assert.match(profilePage, /profile-account-list/);
  assert.match(profileApi, /\/profiles\/\$\{userId\}\/follow/);
  assert.match(homePage, /artwork-artist-link/);
  assert.match(styles, /\.profile-social-stats/);
  assert.match(styles, /\.profile-connections-dialog/);
});

test("refines and mirrors the gallery chrome for Arabic", () => {
  assert.match(appSidebar, /size=\{24\}/);
  assert.match(styles, /\.app-sidebar-logo img \{ width: 48px; height: 48px/);
  assert.match(styles, /\.app-sidebar-nav \{ gap: 14px; margin-top: 14px/);
  assert.match(styles, /\.gallery-header \{ padding: 10px 0 10px/);
  assert.match(styles, /background: rgb\(238 231 189 \/ \.94\)/);
  assert.match(styles, /\.gallery-search \{ min-height: 46px; border-radius: 8px/);
  assert.match(styles, /\.gallery-search:hover/);
  assert.match(styles, /\.gallery-profile-menu > summary, \.gallery-guest-avatar \{ width: 38px; height: 38px/);
  assert.match(styles, /\[dir="rtl"\] \.app-sidebar \{ right: 0; left: auto/);
  assert.match(styles, /\[dir="rtl"\] \.gallery-home,[^{]+\{ padding-right: 78px; padding-left: 0/);
  assert.match(styles, /\[dir="rtl"\] \.gallery-header \{ padding-right:/);
});

test("uses an edge scrollbar and aligns the compact avatar with gallery cards", () => {
  assert.match(styles, /html \{ overflow-y: scroll; scrollbar-gutter: stable/);
  assert.match(styles, /html::-webkit-scrollbar \{ width: 12px/);
  assert.match(styles, /body \{ overflow: visible/);
  assert.match(styles, /\.gallery-header \{ padding-right: 32px; padding-left: 32px/);
  assert.match(styles, /\.gallery-profile-menu > summary, \.gallery-guest-avatar \{ width: 34px; height: 34px/);
  assert.doesNotMatch(appSidebar, /app-sidebar-upload/);
  assert.doesNotMatch(styles, /\.app-sidebar-nav \.app-sidebar-upload/);
  assert.match(styles, /@media \(max-width: 520px\)[^{]+\{ \.gallery-header, \[dir="rtl"\] \.gallery-header \{ padding-right: 20px; padding-left: 20px/);
});

test("centers the avatar between the search edge and header edge", () => {
  assert.match(styles, /\.gallery-header \{ grid-template-columns: minmax\(0,1fr\) 72px; gap: 0; padding-right: 0; padding-left: 32px/);
  assert.match(styles, /\.gallery-header-actions \{ width: 72px; min-width: 72px; justify-content: center/);
  assert.match(styles, /\[dir="rtl"\] \.gallery-header \{ padding-right: 32px; padding-left: 0/);
  assert.match(styles, /@media \(max-width: 520px\)[^{]+\{ \.gallery-header \{ grid-template-columns: minmax\(0,1fr\) 52px/);
});

test("adapts the complete interface across screen sizes without cropping artwork", () => {
  assert.match(styles, /\.artwork-grid, \.profile-artwork-grid \{ column-count: auto; column-width: 220px/);
  assert.match(styles, /\.artwork-image, \.profile-artwork-grid \.artwork-image[^}]*height: auto[^}]*aspect-ratio: auto[^}]*object-fit: contain/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.app-sidebar, \[dir="rtl"\] \.app-sidebar[\s\S]*bottom: 0/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.profile-tabs[\s\S]*overflow-x: auto/);
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*column-width: 155px/);
  assert.match(styles, /@media \(max-width: 359px\)[\s\S]*column-count: 1/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /--app-rail-size: clamp\(78px, 4\.7vw, 120px\)/);
  assert.match(styles, /--artwork-column-size: 220px/);
  assert.match(styles, /@media \(min-width: 2200px\)[\s\S]*--artwork-column-size: 260px/);
  assert.match(styles, /--nav-control-size: clamp\(48px, 2\.75vw, 68px\)/);
  assert.match(styles, /--nav-icon-size: clamp\(24px, 1\.35vw, 32px\)/);
  assert.match(styles, /\.gallery-header \{ min-height: clamp\(64px, 4\.5vw, 88px\)/);
  assert.match(styles, /\.gallery-search \{ min-width: 0; min-height: var\(--header-control-size\)/);
  assert.match(styles, /\.gallery-feed \{ width: 100%; padding-right: var\(--feed-gutter\)/);
  assert.match(styles, /content-visibility: auto/);
  assert.match(styles, /contain-intrinsic-size: 300px 420px/);
  assert.match(styles, /image-rendering: auto/);
});
