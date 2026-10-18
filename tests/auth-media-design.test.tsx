import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { LoginPage } from "../src/features/auth/LoginPage";
import { SignupPage } from "../src/features/auth/SignupPage";
import { PasswordResetPage } from "../src/features/auth/PasswordResetPage";
import { VerifyEmailPage } from "../src/features/auth/VerifyEmailPage";
import { ArtworkMedia } from "../src/features/home/ArtworkMedia";

vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:null,setSession:vi.fn()})}));
afterEach(()=>{cleanup();localStorage.clear();document.documentElement.removeAttribute("data-theme");});

it.each(["en","ar"])("shares the watercolor glass layout and top-right controls across all %s auth pages",language=>{
  for(const Page of [LoginPage,SignupPage,PasswordResetPage,VerifyEmailPage]){
    const view=render(<MemoryRouter initialEntries={[`/${language}/login`]}><I18nProvider><ThemeProvider><Page/></ThemeProvider></I18nProvider></MemoryRouter>);
    expect(view.container.querySelector("main.auth-photo-background")).toBeTruthy();
    expect(view.container.querySelectorAll(".auth-page-controls button")).toHaveLength(2);
    const logo=screen.getByRole("img",{name:"InkFig"});
    expect(logo.querySelector('path[d^="M173.31,218.19"]')?.getAttribute("fill")).toBe("var(--auth-logo-nib)");
    expect(logo.querySelector('circle[cx="49.43"]')?.getAttribute("fill")).toBe("var(--auth-logo-detail)");
    expect(view.container.querySelector(".auth-card h1")).toBeTruthy();
    view.unmount();
  }
});
it("retains sign-in field semantics and required registration fields",()=>{
  const view=render(<MemoryRouter><I18nProvider><ThemeProvider><LoginPage/></ThemeProvider></I18nProvider></MemoryRouter>);
  expect(view.container.querySelector('input[name="email"]')?.getAttribute("autocomplete")).toBe("email");
  expect(view.container.querySelector('input[name="password"]')?.getAttribute("autocomplete")).toBe("current-password");
  view.unmount();
  const signup=render(<MemoryRouter><I18nProvider><ThemeProvider><SignupPage/></ThemeProvider></I18nProvider></MemoryRouter>);
  expect(signup.container.querySelectorAll("input[required]").length).toBeGreaterThanOrEqual(5);
  expect(signup.container.querySelector('input[type="file"]')?.hasAttribute("required")).toBe(false);
});
it("keeps exactly one accessible sharp image with a decorative copy for the spare space",()=>{
  const {container}=render(<ArtworkMedia url="/portrait.png" title="Portrait" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  const original=screen.getByRole("img",{name:"Portrait"});
  expect(original.className).toBe("artwork-media-original");
  const blur=container.querySelector(".artwork-media-backdrop")!;
  expect(blur.getAttribute("src")).toBe(original.getAttribute("src"));
  expect(blur.getAttribute("aria-hidden")).toBe("true");expect(blur.getAttribute("alt")).toBe("");
});
it("handles failed images without showing a broken blurred duplicate and recovers for another work",()=>{
  const view=render(<ArtworkMedia url="/broken.png" title="Broken" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  fireEvent.error(screen.getByRole("img",{name:"Broken"}));
  expect(screen.getByRole("status").textContent).toBe("Unable to load");
  expect(view.container.querySelector(".artwork-media-backdrop")).toBeNull();
  view.rerender(<ArtworkMedia url="/next.png" title="Next" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  expect(screen.getByRole("img",{name:"Next"})).toBeTruthy();
});
it.each([true,false])("preserves video read-only controls=%s without duplicating playback",readOnly=>{
  const {container}=render(<ArtworkMedia url="/art.mp4" title="Video" mimeType="video/mp4" readOnly={readOnly} failureLabel="Unable to load"/>);
  expect(container.querySelectorAll("video")).toHaveLength(1);
  expect(container.querySelector("video")?.controls).toBe(!readOnly);
  expect(container.querySelector(".artwork-media-backdrop")).toBeNull();
});
