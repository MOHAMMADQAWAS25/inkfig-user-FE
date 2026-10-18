import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { FirstLoginBackupPrompt } from "../src/features/home/FirstLoginBackupPrompt";
import { loadProfileSettings } from "../src/features/settings/settingsApi";
import { LoginPage } from "../src/features/auth/LoginPage";
import { loginUser } from "../src/features/auth/authenticationApi";
import { ThemeProvider } from "../src/theme/ThemeProvider";

const auth = vi.hoisted(() => ({ session: { userId: "student" } as { userId: string } | null, setSession: vi.fn() }));
vi.mock("../src/features/auth/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../src/features/settings/settingsApi", () => ({ loadProfileSettings: vi.fn() }));
vi.mock("../src/features/auth/authenticationApi", () => ({ loginUser: vi.fn() }));
const profile = { email: "12345678@students.hebron.edu", full_name: "Student", phone_number: "0591234567", gender: "female" as const, date_of_birth: "2000-01-01", is_active: true, backup_email: null };
function Probe() { const location = useLocation(); return <output data-testid="route">{location.pathname}{location.search}|{JSON.stringify(location.state)}</output>; }
function App({ ready = true, requested = true, language = "en" }) {
  return <MemoryRouter initialEntries={[{ pathname: `/${language}`, state: requested ? { firstLoginBackupPrompt: true } : null }]}><I18nProvider><FirstLoginBackupPrompt ready={ready} /><Probe /></I18nProvider></MemoryRouter>;
}
beforeEach(() => {
  vi.resetAllMocks(); auth.session = { userId: "student" };
  vi.mocked(loadProfileSettings).mockResolvedValue(profile);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("waits for homepage readiness and consumes the transient flag before showing", async () => {
  const view = render(<App ready={false} />);
  await waitFor(() => expect(loadProfileSettings).toHaveBeenCalled());
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByTestId("route").textContent).not.toContain("firstLoginBackupPrompt");
  view.rerender(<App ready />);
  expect(await screen.findByRole("dialog", { name: "Keep access after graduation" })).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Later" }));
});

it.each(["Later", "Escape", "outside"])("%s dismisses permanently for this login", async method => {
  const view = render(<App />);
  const dialog = await screen.findByRole("dialog");
  if (method === "Later") fireEvent.click(screen.getByRole("button", { name: "Later" }));
  else if (method === "Escape") fireEvent(dialog, new Event("cancel", { cancelable: true }));
  else fireEvent.click(dialog);
  expect(screen.queryByRole("dialog")).toBeNull();
  view.rerender(<App ready={false} />); view.rerender(<App ready />);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("opens Security directly when Add is selected", async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "Add backup email" }));
  expect(screen.getByTestId("route").textContent).toContain("/en/settings?section=security");
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("does not show on ordinary navigation, restored sessions or guest visits", async () => {
  const view = render(<App requested={false} />);
  expect(loadProfileSettings).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
  view.unmount(); auth.session = null;
  render(<App />);
  expect(loadProfileSettings).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("suppresses the popup if a backup email is already saved", async () => {
  vi.mocked(loadProfileSettings).mockResolvedValue({ ...profile, backup_email: "student@gmail.com" });
  render(<App />);
  await waitFor(() => expect(loadProfileSettings).toHaveBeenCalled());
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("shows localized Arabic content", async () => {
  render(<App language="ar" />);
  expect(await screen.findByRole("dialog", { name: "احتفظ بالوصول بعد التخرج" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "لاحقًا" })).toBeTruthy();
});

it("passes the one-time login response flag to the homepage without persisting it in the session", async () => {
  auth.session = null;
  auth.setSession.mockImplementation((value: { userId: string }) => { auth.session = value; });
  vi.mocked(loginUser).mockResolvedValue({ expires_in: 900, user_id: "student", email: profile.email, full_name: "Student", role: "user", permissions: [], show_backup_email_prompt: true });
  const view = render(<MemoryRouter initialEntries={["/en/login"]}><I18nProvider><ThemeProvider><Routes>
    <Route path="/en/login" element={<LoginPage />} />
    <Route path="/en" element={<><FirstLoginBackupPrompt ready /><Probe /></>} />
  </Routes></ThemeProvider></I18nProvider></MemoryRouter>);
  fireEvent.change(view.container.querySelector('input[name="email"]')!, { target: { value: profile.email } });
  fireEvent.change(view.container.querySelector('input[name="password"]')!, { target: { value: "password123" } });
  fireEvent.submit(view.container.querySelector("form")!);
  expect(await screen.findByRole("dialog")).toBeTruthy();
  expect(auth.setSession.mock.calls[0][0]).not.toHaveProperty("show_backup_email_prompt");
  expect(screen.getByTestId("route").textContent).not.toContain("firstLoginBackupPrompt");
});
