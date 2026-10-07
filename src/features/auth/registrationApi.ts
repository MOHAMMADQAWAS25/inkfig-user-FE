import { requestJson, userApiBaseUrl } from "../../api/httpClient";
import type { AvatarUpload } from "../profile/profileAvatarUpload";

export type Gender = "male" | "female";

export interface RegistrationRequest {
  email: string;
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  password: string;
  password_confirmation: string;
  avatar_file_name?: string;
  avatar_mime_type?: string;
  avatar_file_size?: number;
}

export interface RegistrationResponse {
  email: string;
  verification_required: boolean;
  expires_in_seconds: number;
  resend_after_seconds: number;
  hourly_limit_reached: boolean;
  avatar_upload: AvatarUpload | null;
}

export interface VerificationResponse { email: string; verified: boolean; }
export interface ResendResponse {
  email: string;
  expires_in_seconds: number;
  resend_after_seconds: number;
  hourly_limit_reached: boolean;
}

export async function registerUser(body: RegistrationRequest): Promise<RegistrationResponse> {
  const result = await requestJson<RegistrationResponse>(
    userApiBaseUrl,
    "POST",
    "/auth/signup",
    { body },
  );
  return result.data;
}

export async function verifyEmail(email: string, code: string, avatarObjectPath?:string): Promise<VerificationResponse> {
  const result = await requestJson<VerificationResponse>(userApiBaseUrl, "POST", "/auth/verify-email", {
    body: { email, code, avatar_object_path:avatarObjectPath },
  });
  return result.data;
}

export async function resendVerification(email: string): Promise<ResendResponse> {
  const result = await requestJson<ResendResponse>(userApiBaseUrl, "POST", "/auth/resend-verification", {
    body: { email },
  });
  return result.data;
}
