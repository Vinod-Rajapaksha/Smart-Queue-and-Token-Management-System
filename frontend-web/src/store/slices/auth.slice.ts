import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../features/auth/types";

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,
};

type LoginSuccessPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },

    loginSuccess(state, action: PayloadAction<LoginSuccessPayload>) {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },

    loginFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },

    // called by refresh flow
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },

    // load from storage on app start
    hydrateAuth(
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFail,
  setTokens,
  hydrateAuth,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
