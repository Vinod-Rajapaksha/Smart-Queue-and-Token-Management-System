import { env } from "../../app/config/env";
import { tokenStorage } from "../storage/tokenStorage";
import { ApiError } from "./errors";
import type { RefreshResponse } from "../../features/auth/types";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type Json = JsonValue;

function isObject(v: Json): v is JsonObject {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function unwrapApi(data: Json): Json {
  if (!isObject(data)) return data;

  const hasDataKey = Object.prototype.hasOwnProperty.call(data, "data");
  const hasStatusCode = typeof data["statusCode"] === "number";
  const hasMessage = typeof data["message"] === "string";

  if (hasDataKey && (hasStatusCode || hasMessage)) {
    return data["data"] ?? null;
  }

  return data;
}

function getMessage(data: Json): string | null {
  if (isObject(data)) {
    const msg = data["message"];
    return typeof msg === "string" ? msg : null;
  }
  return null;
}

let isRefreshing = false;
let refreshPromise: Promise<RefreshResponse> | null = null;

async function safeJson(res: Response): Promise<Json> {
  try {
    return (await res.json()) as Json;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<RefreshResponse> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new ApiError("No refresh token", 401);

  const res = await fetch(`${env.API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const raw = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(getMessage(raw) ?? "Refresh failed", res.status, raw);
  }

  const data = unwrapApi(raw);

  if (
    !isObject(data) ||
    typeof data["accessToken"] !== "string" ||
    typeof data["refreshToken"] !== "string"
  ) {
    throw new ApiError("Invalid refresh response", 500, raw);
  }

  return {
    accessToken: data["accessToken"],
    refreshToken: data["refreshToken"],
  };
}

export async function apiFetch<T>( path: string, options: RequestInit = {} ): Promise<T> {
  const url = `${env.API_URL}${path}`;
  const accessToken = tokenStorage.getAccess();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const raw = await safeJson(res);

  if (res.ok) return unwrapApi(raw) as T;

  if (res.status === 401) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = doRefresh().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      const promise = refreshPromise;
      if (!promise) throw new ApiError("Refresh unavailable", 401);

      const refreshed = await promise;
      tokenStorage.set(refreshed.accessToken, refreshed.refreshToken);

      const retryHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${refreshed.accessToken}`,
      };

      const retryRes = await fetch(url, { ...options, headers: retryHeaders });
      const retryRaw = await safeJson(retryRes);

      if (retryRes.ok) return unwrapApi(retryRaw) as T;

      throw new ApiError(
        getMessage(retryRaw) ?? "Request failed",
        retryRes.status,
        retryRaw
      );
    } catch (e) {
      tokenStorage.clear();
      throw e instanceof ApiError ? e : new ApiError("Unauthorized", 401);
    }
  }

  throw new ApiError(getMessage(raw) ?? "API request failed", res.status, raw);
}
