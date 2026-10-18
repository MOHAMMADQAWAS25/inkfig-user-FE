import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { LoginPage } from "../src/features/auth/LoginPage";
import { SignupPage } from "../src/features/auth/SignupPage";
import { PasswordResetPage } from "../src/features/auth/PasswordResetPage";
import { VerifyEmailPage } from "../src/features/auth/VerifyEmailPage";
import { ArtworkMedia } from "../src/features/home/ArtworkMedia";
import { registerUser } from "../src/features/auth/registrationApi";
import { SearchHints } from "../src/features/home/SearchHints";

vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:null,setSession:vi.fn()})}));
vi.mock("../src/features/auth/registrationApi",()=>({registerUser:vi.fn(),verifyEmail:vi.fn(),resendVerification:vi.fn()}));
afterEach(()=>{cleanup();vi.unstubAllGlobals();localStorage.clear();document.documentElement.removeAttribute("data-theme");});

function sizeImage(container: HTMLElement, image: HTMLElement, width: number, height: number, mediaWidth: number, mediaHeight: number) {
  Object.defineProperties(image, {
    offsetWidth: { configurable: true, value: width }, offsetHeight: { configurable: true, value: height },
    complete: { configurable: true, value: true }, naturalWidth: { configurable: true, value: width },
  });
  Object.defineProperties(container.querySelector(".artwork-modal-media"), {
    clientWidth: { configurable: true, value: mediaWidth }, clientHeight: { configurable: true, value: mediaHeight },
  });
}

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
  expect(signup.container.querySelector('input[type="file"]')).toBeNull();
  expect(screen.getAllByRole("group")).toHaveLength(2);
});
function SignupRouteProbe(){const location=useLocation();return <output data-testid="signup-route">{location.pathname}|{JSON.stringify(location.state)}</output>;}
it("submits the existing required registration data without preparing or uploading an avatar",async()=>{
  vi.mocked(registerUser).mockResolvedValue({email:"12345678@students.hebron.edu",verification_required:true,expires_in_seconds:600,resend_after_seconds:60,hourly_limit_reached:false,avatar_upload:null});
  const {container}=render(<MemoryRouter initialEntries={["/en/signup"]}><I18nProvider><ThemeProvider><SignupPage/><SignupRouteProbe/></ThemeProvider></I18nProvider></MemoryRouter>);
  for(const [name,value] of Object.entries({full_name:"Student Artist",phone_number:"0591234567",date_of_birth:"2000-01-01",email:"12345678@students.hebron.edu",password:"SecurePass123",password_confirmation:"SecurePass123"})){
    fireEvent.change(container.querySelector(`[name="${name}"]`)!,{target:{value}});
  }
  fireEvent.submit(container.querySelector("form")!);
  await waitFor(()=>expect(registerUser).toHaveBeenCalledWith({full_name:"Student Artist",phone_number:"0591234567",gender:"female",date_of_birth:"2000-01-01",email:"12345678@students.hebron.edu",password:"SecurePass123",password_confirmation:"SecurePass123"}));
  await waitFor(()=>expect(screen.getByTestId("signup-route").textContent).toContain("/en/verify-email"));
  expect(screen.getByTestId("signup-route").textContent).not.toContain("avatarObjectPath");
});
it.each([
  { email:"artist@example.com",phone:"0591234567",confirmation:"SecurePass123",error:"Enter a valid Hebron University email address." },
  { email:"12345678@students.hebron.edu",phone:"123",confirmation:"SecurePass123",error:"Phone number must contain exactly 10 digits." },
  { email:"12345678@students.hebron.edu",phone:"0591234567",confirmation:"DifferentPass123",error:"The passwords do not match." },
])("preserves signup validation before sending a request: $error",({email,phone,confirmation,error})=>{
  vi.mocked(registerUser).mockClear();
  const {container}=render(<MemoryRouter initialEntries={["/en/signup"]}><I18nProvider><ThemeProvider><SignupPage/></ThemeProvider></I18nProvider></MemoryRouter>);
  for(const [name,value] of Object.entries({email,phone_number:phone,password:"SecurePass123",password_confirmation:confirmation}))fireEvent.change(container.querySelector(`[name="${name}"]`)!,{target:{value}});
  fireEvent.submit(container.querySelector("form")!);
  expect(screen.getByRole("alert").textContent).toBe(error);
  expect(registerUser).not.toHaveBeenCalled();
});
it.each(["en","ar"])("renders localized decorative search hints without changing input semantics (%s)",language=>{
  const view=render(<MemoryRouter initialEntries={[`/${language}`]}><I18nProvider><SearchHints visible artistSelected={false}/></I18nProvider></MemoryRouter>);
  const hints=view.container.querySelector(".search-hints")!;
  expect(hints.getAttribute("aria-hidden")).toBe("true");
  expect(hints.children).toHaveLength(2);
  expect(hints.textContent).toContain(language==="en"?"Search art":"ابحث عن عمل فني");
  expect(hints.textContent).toContain("@");
  view.rerender(<MemoryRouter initialEntries={[`/${language}`]}><I18nProvider><SearchHints visible={false} artistSelected/></I18nProvider></MemoryRouter>);
  expect(hints.getAttribute("data-visible")).toBe("false");
  expect(hints.children).toHaveLength(1);
});
it("keeps exactly one accessible sharp image with a decorative copy for the spare space",()=>{
  const {container}=render(<ArtworkMedia url="/portrait.png" title="Portrait" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  const original=screen.getByRole("img",{name:"Portrait"});
  expect(original.className).toBe("artwork-media-original");
  expect(container.querySelector(".artwork-media-backdrop")).toBeNull();
  sizeImage(container, original, 225, 225, 225, 650);
  fireEvent.load(original);
  const blur=container.querySelector(".artwork-media-backdrop")!;
  expect(blur.getAttribute("src")).toBe(original.getAttribute("src"));
  expect(blur.getAttribute("aria-hidden")).toBe("true");expect(blur.getAttribute("alt")).toBe("");
  expect(original.style.transform).toMatch(/^scale\(0\./);
});
it.each([[400,700,400,700],[400,700,401,701]])("leaves naturally fitting images without blur or artificial framing (%s x %s)",(width,height,mediaWidth,mediaHeight)=>{
  const {container}=render(<ArtworkMedia url="/fit.png" title="Fit" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  const original=screen.getByRole("img",{name:"Fit"});
  sizeImage(container,original,width,height,mediaWidth,mediaHeight);
  fireEvent.load(original);
  expect(container.querySelector(".artwork-media-backdrop")).toBeNull();
  expect(original.style.transform).toBe("");
});
it("rechecks horizontal mobile gaps and removes framing after resize without measuring its own transform",()=>{
  let resize=()=>{};
  const disconnect=vi.fn();
  vi.stubGlobal("ResizeObserver",class { constructor(callback:()=>void){resize=callback;} observe(){} disconnect=disconnect; });
  const view=render(<ArtworkMedia url="/square.png" title="Square" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  const original=screen.getByRole("img",{name:"Square"});
  sizeImage(view.container,original,225,225,366,225);
  fireEvent.load(original);
  expect(view.container.querySelector(".artwork-media-backdrop")).toBeTruthy();
  const scale=original.style.transform;
  act(()=>resize());
  expect(original.style.transform).toBe(scale);
  sizeImage(view.container,original,225,225,225,225);
  act(()=>resize());
  expect(view.container.querySelector(".artwork-media-backdrop")).toBeNull();
  expect(original.style.transform).toBe("");
  sizeImage(view.container,original,225,225,225,650);
  fireEvent(window,new Event("resize"));
  expect(view.container.querySelector(".artwork-media-backdrop")).toBeTruthy();
  view.rerender(<ArtworkMedia url="/next.png" title="Next" mimeType="image/png" readOnly={false} failureLabel="Unable to load"/>);
  expect(view.container.querySelector(".artwork-media-backdrop")).toBeNull();
  view.unmount();
  expect(disconnect).toHaveBeenCalled();
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
