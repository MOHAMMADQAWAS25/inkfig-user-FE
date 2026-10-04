import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export interface AuthenticationResponse {
  expires_in: number;
  user_id: string;
  email: string;
  full_name: string;
  permissions: string[];
  role: "viewer" | "user" | "supervisor" | "admin" | "system_administrator";
}

export async function loginUser(email: string, password: string): Promise<AuthenticationResponse> {
  const response = await requestJson<AuthenticationResponse>(userApiBaseUrl, "POST", "/auth/login", {
    body: { email, password },
  });
  return response.data;
}

export async function logoutUser(): Promise<void> {
  await requestJson<null>(userApiBaseUrl, "POST", "/auth/logout");
}
