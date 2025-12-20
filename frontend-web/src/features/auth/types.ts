import type { ROLES } from "../../types/enums";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: ROLES;
  branch?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
