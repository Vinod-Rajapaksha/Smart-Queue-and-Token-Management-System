import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { tokenStorage } from "../../../services/storage/tokenStorage";
import { userStorage } from "../../../services/storage/userStorage";
import { useAppDispatch } from "../../../store/hooks";
import { loginStart, loginSuccess, loginFail, logout } from "../../../store/slices/auth.slice";
import { ADMIN_PORTAL_ROLES } from "../../../types/enums";
import type { LoginRequest } from "../types";

export function useLogin() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const login = async (payload: LoginRequest) => {
    setSubmitting(true);
    setError(null);
    dispatch(loginStart());

    try {
      const res = await authApi.login(payload);

      if (!ADMIN_PORTAL_ROLES.includes(res.user.role)) {
        throw new Error("You are not allowed to access the admin portal.");
      }

      tokenStorage.set(res.accessToken, res.refreshToken);
      userStorage.set(res.user);

      dispatch(
        loginSuccess({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        })
      );

      navigate("/admin", { replace: true });
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";

      tokenStorage.clear();
      userStorage.clear();

      dispatch(loginFail(message));
      dispatch(logout());

      setError(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { login, submitting, error };
}
