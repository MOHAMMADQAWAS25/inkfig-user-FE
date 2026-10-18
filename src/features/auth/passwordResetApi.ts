import { requestJson, userApiBaseUrl } from "../../api/httpClient";

interface PasswordResetRequestResponse {
  destination_required?: boolean;
  message: string;
  expires_in_seconds: number;
  resend_after_seconds: number;
  hourly_limit_reached: boolean;
}

interface PasswordResetVerifyResponse {
  reset_token: string;
  expires_in_seconds: number;
}

export type ResetDestination = "primary" | "backup";

export async function requestPasswordReset(email: string, destination?: ResetDestination): Promise<PasswordResetRequestResponse> {
  const response = await requestJson<PasswordResetRequestResponse>(
    userApiBaseUrl,
    "POST",
    "/auth/password-reset/request",
    { body: { email, ...(destination ? { destination } : {}) } },
  );
  return response.data;
}

export async function verifyPasswordResetCode(
  email: string,
  code: string,
): Promise<PasswordResetVerifyResponse> {
  const response = await requestJson<PasswordResetVerifyResponse>(
    userApiBaseUrl,
    "POST",
    "/auth/password-reset/verify",
    { body: { email, code } },
  );
  return response.data;
}

export async function confirmPasswordReset(
  email: string,
  resetToken: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "POST", "/auth/password-reset/confirm", {
    body: {
      email,
      reset_token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    },
  });
}
