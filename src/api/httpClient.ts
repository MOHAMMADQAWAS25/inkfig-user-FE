import type { ApiErrorBody, ApiResult, HttpMethod } from "../shared/types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requestJson<TData>(
  baseUrl: string,
  method: HttpMethod,
  path: string,
  options: { body?: unknown; token?: string; signal?: AbortSignal } = {},
): Promise<ApiResult<TData>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const request: RequestInit = { method, headers, signal: options.signal };

  if (options.token?.trim()) {
    headers.Authorization = `Bearer ${options.token.trim()}`;
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${normalizeBaseUrl(baseUrl)}${path}`, request);
  const data = await parseResponse<TData>(response);

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(data, response.statusText));
  }

  return { data, status: response.status };
}

export const userApiBaseUrl = import.meta.env.VITE_USER_API_BASE_URL ?? "http://localhost:8001/api/v1";
export const mainApiBaseUrl = import.meta.env.VITE_MAIN_API_BASE_URL ?? "http://localhost:8000/api/v1";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

async function parseResponse<TData>(response: Response): Promise<TData> {
  const text = await response.text();
  return text ? (JSON.parse(text) as TData) : (null as TData);
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "detail" in data) {
    const detail = (data as ApiErrorBody).detail;
    return typeof detail === "string" ? detail : JSON.stringify(detail);
  }
  return fallback;
}
