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
  user: {
    user_id: string;
    email: string;
    full_name: string;
    phone_number: string;
    gender: Gender;
    date_of_birth: string;
    is_active: boolean;
    created_at: string;
  };
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
