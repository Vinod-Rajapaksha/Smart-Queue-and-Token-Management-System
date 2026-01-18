import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const user = await authService.login(email, password);
      return user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; telephone: string; password: string; role: string },
    thunkAPI
  ) => {
    try {
      const user = await authService.register(data);
      return user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Register failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; });
  },
});

export default authSlice.reducer;
