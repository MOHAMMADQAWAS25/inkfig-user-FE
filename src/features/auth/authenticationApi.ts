import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user_id: string;
  email: string;
  full_name: string;
  permissions: string[];
}

export async function loginUser(email: string, password: string): Promise<AuthenticationResponse> {
  const response = await requestJson<AuthenticationResponse>(userApiBaseUrl, "POST", "/auth/login", {
    body: { email, password },
  });
  return response.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "POST", "/auth/logout", {
    body: { refresh_token: refreshToken },
  });
}
