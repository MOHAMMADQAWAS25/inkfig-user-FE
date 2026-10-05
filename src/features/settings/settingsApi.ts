import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type Gender = "female" | "male";

export interface ProfileSettings {
  email: string;
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  is_active: boolean;
}

export async function loadProfileSettings(): Promise<ProfileSettings> {
  return (await requestJson<ProfileSettings>(userApiBaseUrl, "GET", "/settings/profile")).data;
}

export async function saveProfileSettings(profile: Omit<ProfileSettings, "email" | "is_active">): Promise<ProfileSettings> {
  return (await requestJson<ProfileSettings>(userApiBaseUrl, "PUT", "/settings/profile", { body: profile })).data;
}

export async function changePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "PUT", "/settings/password", { body: { current_password: currentPassword, password, password_confirmation: passwordConfirmation } });
}

export async function deactivateAccount(): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "PUT", "/settings/account-status", { body: { is_active: false } });
}
