import { useEffect } from "react";
import { useAppDispatch } from "../../store/hooks";
import { hydrateAuth, logout } from "../../store/slices/auth.slice";
import { tokenStorage } from "../../services/storage/tokenStorage";
import { userStorage } from "../../services/storage/userStorage";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = tokenStorage.getAccess();
    const refreshToken = tokenStorage.getRefresh();
    const user = userStorage.get();

    if (accessToken && refreshToken && user) {
      dispatch(hydrateAuth({ user, accessToken, refreshToken }));
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  return <>{children}</>;
}
