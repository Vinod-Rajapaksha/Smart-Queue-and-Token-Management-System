import { apiFetch } from "../../../services/http/interceptors";
import { AUTH_ENDPOINTS } from "./auth.endpoints";
import type { LoginRequest, LoginResponse, RefreshResponse } from "../types";

export const authApi = {
  login(payload: LoginRequest) {
    return apiFetch<LoginResponse>(AUTH_ENDPOINTS.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  refresh(refreshToken: string) {
    return apiFetch<RefreshResponse>(AUTH_ENDPOINTS.refresh, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout() {
    return apiFetch<{ success: boolean }>(AUTH_ENDPOINTS.logout, {
      method: "POST",
    });
  },
};
