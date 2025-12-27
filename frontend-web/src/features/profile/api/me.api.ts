import { apiFetch } from "../../../services/http/interceptors";
import type { ApiResponse, MeDto } from "../types";
import { PROFILE_ENDPOINTS } from "./profile.endpoints";

export function getMe(): Promise<MeDto> {
  return apiFetch<MeDto>(PROFILE_ENDPOINTS.me, { 
    method: "GET" 
  });
}

export function updateMe(payload: {
  name: string;
  email: string;
  telephone: string;
}): Promise<MeDto> {
  return apiFetch<MeDto>(PROFILE_ENDPOINTS.me, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiFetch<ApiResponse<null>>(PROFILE_ENDPOINTS.changePassword, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
