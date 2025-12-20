import type { AuthUser } from "../../features/auth/types";

const USER_KEY = "zeroq_user";

export const userStorage = {
  get(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  set(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(USER_KEY);
  },
};
