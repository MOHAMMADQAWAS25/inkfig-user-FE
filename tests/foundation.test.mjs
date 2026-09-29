import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const loginPage = readFileSync(new URL("../src/features/auth/LoginPage.tsx", import.meta.url), "utf8");
const appShell = readFileSync(new URL("../src/features/layout/AppShell.tsx", import.meta.url), "utf8");

test("uses the approved frontend dependencies", () => {
  assert.ok(packageJson.dependencies.react);
  assert.ok(packageJson.dependencies["react-router-dom"]);
  assert.ok(packageJson.dependencies["lucide-react"]);
  for (const forbidden of ["@mui/material", "bootstrap", "redux", "styled-components", "tailwindcss"]) {
    assert.equal(packageJson.dependencies[forbidden], undefined);
  }
});

test("defines shared visual tokens and responsive RTL behavior", () => {
  assert.match(styles, /--primary:/);
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
