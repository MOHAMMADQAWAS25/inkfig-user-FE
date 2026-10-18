import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { PasswordResetPage } from "../src/features/auth/PasswordResetPage";
import { SettingsPage } from "../src/features/settings/SettingsPage";
import { BackupEmailSettings } from "../src/features/settings/BackupEmailSettings";
import { loadProfileSettings, saveBackupEmail } from "../src/features/settings/settingsApi";
import { requestPasswordReset } from "../src/features/auth/passwordResetApi";

const auth = vi.hoisted(() => ({ session: null as null | { email: string }, setSession: vi.fn(), signOut: vi.fn() }));
vi.mock("../src/features/auth/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../src/features/navigation/AppSidebar", () => ({ AppSidebar: () => <nav /> }));
vi.mock("../src/features/settings/settingsApi", () => ({ loadProfileSettings: vi.fn(), saveBackupEmail: vi.fn(), saveProfileSettings: vi.fn(), changePassword: vi.fn(), deactivateAccount: vi.fn() }));
vi.mock("../src/features/auth/passwordResetApi", () => ({ requestPasswordReset: vi.fn(), verifyPasswordResetCode: vi.fn(), confirmPasswordReset: vi.fn() }));

const profile = { email: "12345678@students.hebron.edu", full_name: "Student", phone_number: "0591234567", gender: "female" as const, date_of_birth: "2000-01-01", is_active: true, backup_email: null as string | null };
const sent = { message: "sent", expires_in_seconds: 600, resend_after_seconds: 0, hourly_limit_reached: false, destination_required: false };
function wrap(node: React.ReactNode, language = "en") { return render(<MemoryRouter initialEntries={[`/${language}`]}><I18nProvider><ThemeProvider>{node}</ThemeProvider></I18nProvider></MemoryRouter>); }
beforeEach(() => { vi.resetAllMocks(); auth.session = null; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("waits for an explicit destination, and resends to the selected backup", async () => {
  vi.mocked(requestPasswordReset).mockResolvedValueOnce({ ...sent, destination_required: true }).mockResolvedValue(sent);
  const view = wrap(<PasswordResetPage />);
  fireEvent.change(view.container.querySelector('input[type="email"]')!, { target: { value: profile.email } });
  fireEvent.submit(view.container.querySelector("form")!);
  const radio = await screen.findByRole("radio", { name: /Backup email/ });
  expect(screen.getAllByRole("radio").every(input => !(input as HTMLInputElement).checked)).toBe(true);
  expect((screen.getByRole("button", { name: "Send reset code" }) as HTMLButtonElement).disabled).toBe(true);
  expect(requestPasswordReset).toHaveBeenCalledTimes(1);
  fireEvent.click(radio); fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.container.querySelector('input[autocomplete="one-time-code"]')).not.toBeNull());
  await waitFor(() => expect(requestPasswordReset).toHaveBeenLastCalledWith(profile.email, "backup"));
  fireEvent.click(screen.getByRole("button", { name: /new code/i }));
  await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledTimes(3));
  expect(requestPasswordReset).toHaveBeenLastCalledWith(profile.email, "backup");
});

it("keeps the existing code-entry flow without destination options when no backup exists", async () => {
  vi.mocked(requestPasswordReset).mockResolvedValue(sent);
  const view = wrap(<PasswordResetPage />);
  fireEvent.change(view.container.querySelector('input[type="email"]')!, { target: { value: profile.email } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.container.querySelector('input[autocomplete="one-time-code"]')).not.toBeNull());
  expect(screen.queryByRole("radio")).toBeNull();
});

it("validates matching Gmail entries and saves without any email verification stage", async () => {
  const onSaved = vi.fn();
  vi.mocked(saveBackupEmail).mockResolvedValue({ ...profile, backup_email: "student@gmail.com" });
  const view = wrap(<BackupEmailSettings profile={profile} onSaved={onSaved} />);
  const fields = view.container.querySelectorAll('input[type="email"]');
  fireEvent.change(fields[0], { target: { value: " Student@gmail.com " } });
  fireEvent.change(fields[1], { target: { value: "another@gmail.com" } });
  fireEvent.change(view.container.querySelector('input[name="backup_current_password"]')!, { target: { value: "password123" } });
  fireEvent.submit(view.container.querySelector("form")!);
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "The backup email entries must match.");
  expect(saveBackupEmail).not.toHaveBeenCalled();
  fireEvent.change(fields[1], { target: { value: "student@gmail.com" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(saveBackupEmail).toHaveBeenCalledWith("student@gmail.com", "student@gmail.com", "password123"));
  expect(onSaved).toHaveBeenCalled();
  expect(view.container.querySelector('input[autocomplete="one-time-code"]')).toBeNull();
});

it("shows no warning while loading, hides it after saving and restores it after removal", async () => {
  auth.session = { email: profile.email };
  let resolveProfile!: (value: typeof profile) => void;
  vi.mocked(loadProfileSettings).mockReturnValue(new Promise(resolve => { resolveProfile = resolve; }));
  vi.mocked(saveBackupEmail).mockResolvedValueOnce({ ...profile, backup_email: "student@gmail.com" }).mockResolvedValueOnce(profile);
  const view = wrap(<SettingsPage />);
  expect(view.container.querySelector(".backup-warning-icon")).toBeNull();
  resolveProfile(profile);
  await waitFor(() => expect(view.container.querySelector(".backup-warning-icon")).not.toBeNull());
  fireEvent.click(screen.getByRole("button", { name: /Security/ }));
  const fields = view.container.querySelectorAll('input[type="email"]');
  for (const field of fields) fireEvent.change(field, { target: { value: "student@gmail.com" } });
  fireEvent.change(view.container.querySelector('input[name="backup_current_password"]')!, { target: { value: "password123" } });
  fireEvent.submit(view.container.querySelector("form")!);
  await waitFor(() => expect(view.container.querySelector(".backup-warning-icon")).toBeNull());
  vi.spyOn(window, "confirm").mockReturnValue(true);
  fireEvent.change(view.container.querySelector('input[name="backup_current_password"]')!, { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: "Remove backup email" }));
  await waitFor(() => expect(saveBackupEmail).toHaveBeenLastCalledWith(null, null, "password123"));
  await waitFor(() => expect(view.container.querySelector(".backup-warning-icon")).not.toBeNull());
});

it("requires a fresh explicit destination choice each time Settings recovery opens", async () => {
  auth.session = { email: profile.email };
  vi.mocked(loadProfileSettings).mockResolvedValue({ ...profile, backup_email: "student@gmail.com" });
  vi.mocked(requestPasswordReset).mockResolvedValueOnce({ ...sent, destination_required: true }).mockResolvedValueOnce(sent).mockResolvedValueOnce({ ...sent, destination_required: true });
  wrap(<SettingsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
  fireEvent.click(screen.getByRole("button", { name: "Forgot your password?" }));
  fireEvent.click(await screen.findByRole("radio", { name: /Primary email/ }));
  fireEvent.click(screen.getByRole("button", { name: "Send reset code" }));
  await waitFor(() => expect(requestPasswordReset).toHaveBeenLastCalledWith(profile.email, "primary"));
  fireEvent.click(screen.getByRole("button", { name: /Close/ }));
  fireEvent.click(screen.getByRole("button", { name: "Forgot your password?" }));
  await screen.findByRole("radio", { name: /Backup email/ });
  expect(requestPasswordReset).toHaveBeenLastCalledWith(profile.email, undefined);
  expect(screen.getAllByRole("radio").every(input => !(input as HTMLInputElement).checked)).toBe(true);
});

it("localizes the optional security section in Arabic", () => {
  wrap(<BackupEmailSettings profile={profile} onSaved={vi.fn()} />, "ar");
  expect(screen.getByRole("heading", { name: "البريد الإلكتروني الاحتياطي" })).toBeTruthy();
});
