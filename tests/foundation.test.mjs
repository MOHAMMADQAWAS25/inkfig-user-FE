import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const loginPage = readFileSync(new URL("../src/features/auth/LoginPage.tsx", import.meta.url), "utf8");
const appShell = readFileSync(new URL("../src/features/layout/AppShell.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../src/app/AppRouter.tsx", import.meta.url), "utf8");
const signup = readFileSync(new URL("../src/features/auth/SignupPage.tsx", import.meta.url), "utf8");
const registrationApi = readFileSync(new URL("../src/features/auth/registrationApi.ts", import.meta.url), "utf8");
const appProviders = readFileSync(new URL("../src/app/AppProviders.tsx", import.meta.url), "utf8");
const themeProvider = readFileSync(new URL("../src/theme/ThemeProvider.tsx", import.meta.url), "utf8");
const themeToggle = readFileSync(new URL("../src/theme/ThemeToggle.tsx", import.meta.url), "utf8");

test("uses the approved frontend dependencies", () => {
  assert.ok(packageJson.dependencies.react);
  assert.ok(packageJson.dependencies["react-router-dom"]);
  assert.ok(packageJson.dependencies["lucide-react"]);
  for (const forbidden of ["@mui/material", "bootstrap", "redux", "styled-components", "tailwindcss"]) {
    assert.equal(packageJson.dependencies[forbidden], undefined);
  }
});

test("provides localized welcome and signup routes with every required field", () => {
  assert.match(router, /\/:language\/welcome/);
  assert.match(router, /\/:language\/signup/);
  for (const field of ["email", "full_name", "phone_number", "gender", "date_of_birth", "password", "password_confirmation"]) {
    assert.match(signup, new RegExp(`name=["']${field}["']`));
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
  assert.match(loginPage, /inkfig-logo\.svg/);
  assert.match(appShell, /inkfig-logo\.svg/);
  assert.match(styles, /\.auth-logo/);
  assert.match(styles, /\.brand-logo/);
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
