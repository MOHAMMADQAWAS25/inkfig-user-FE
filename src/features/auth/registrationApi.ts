import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type Gender = "male" | "female";

export interface RegistrationRequest {
  email: string;
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  password: string;
  password_confirmation: string;
}

export interface RegistrationResponse {
  email: string;
  verification_required: boolean;
  expires_in_seconds: number;
  resend_after_seconds: number;
}

export interface VerificationResponse { email: string; verified: boolean; }
export interface ResendResponse { email: string; expires_in_seconds: number; resend_after_seconds: number; }

export async function registerUser(body: RegistrationRequest): Promise<RegistrationResponse> {
  const result = await requestJson<RegistrationResponse>(
    userApiBaseUrl,
    "POST",
    "/auth/signup",
    { body },
  );
  return result.data;
}

export async function verifyEmail(email: string, code: string): Promise<VerificationResponse> {
  const result = await requestJson<VerificationResponse>(userApiBaseUrl, "POST", "/auth/verify-email", {
    body: { email, code },
  });
  return result.data;
}

export async function resendVerification(email: string): Promise<ResendResponse> {
  const result = await requestJson<ResendResponse>(userApiBaseUrl, "POST", "/auth/resend-verification", {
    body: { email },
  });
  return result.data;
}
