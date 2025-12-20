import { useAppSelector } from "../../../store/hooks";
import type { AuthUser } from "../types";
import type { ROLES } from "../../../types/enums";

export function useAuth(): {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: ROLES | null;
  loading: boolean;
  error: string | null;
} {
  const auth = useAppSelector((state) => state.auth);

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    role: auth.user?.role ?? null,
    loading: auth.loading,
    error: auth.error,
  };
}
