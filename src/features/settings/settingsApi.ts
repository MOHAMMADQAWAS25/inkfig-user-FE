import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type Gender = "female" | "male";

export interface ProfileSettings {
  email: string;
  backup_email?: string | null;
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  is_active: boolean;
}

export async function loadProfileSettings(): Promise<ProfileSettings> {
  return (await requestJson<ProfileSettings>(userApiBaseUrl, "GET", "/settings/profile")).data;
}

export async function saveProfileSettings(profile: Omit<ProfileSettings, "email" | "is_active" | "backup_email">): Promise<ProfileSettings> {
  return (await requestJson<ProfileSettings>(userApiBaseUrl, "PUT", "/settings/profile", { body: profile })).data;
}

export async function changePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "PUT", "/settings/password", { body: { current_password: currentPassword, password, password_confirmation: passwordConfirmation } });
}

export async function deactivateAccount(currentPassword: string): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "PUT", "/settings/account-status", { body: { current_password: currentPassword } });
}

export async function saveBackupEmail(email: string | null, confirmation: string | null, currentPassword: string): Promise<ProfileSettings> {
  return (await requestJson<ProfileSettings>(userApiBaseUrl, "PUT", "/settings/backup-email", {
    body: { backup_email: email, backup_email_confirmation: confirmation, current_password: currentPassword },
  })).data;
}
