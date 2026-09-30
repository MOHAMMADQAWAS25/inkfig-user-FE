export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResult<TData> {
  data: TData;
  status: number;
}

export interface ApiErrorBody {
  detail?: unknown;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
  fullName: string;
  permissions: string[];
  userId: string;
}
