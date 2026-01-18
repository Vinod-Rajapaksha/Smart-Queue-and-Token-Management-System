import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createToken as createTokenService, fetchMyTokens } from "../../services/tokenService";

interface TokenState {
  myToken: any | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

const initialState: TokenState = {
  myToken: null,
  loading: false,
  error: null,
  refreshing: false,
};

export const createToken = createAsyncThunk(
  "token/createToken",
  async ({ branchId, queueId }: { branchId: string; queueId: string }, thunkAPI) => {
    try {
      const data = await createTokenService(branchId, queueId);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const fetchMyToken = createAsyncThunk(
  "token/fetchMyToken",
  async (_, thunkAPI) => {
    try {
      const res = await fetchMyTokens();
      const list = Array.isArray(res?.data) ? res.data : [];
      const active =
        list.find((t: any) => !["COMPLETED", "CANCELLED"].includes(t.status)) ||
        list[0] ||
        null;

      return active;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch token"
      );
    }
  }
);

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // create token
      .addCase(createToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createToken.fulfilled, (state, action) => {
        state.loading = false;
        state.myToken = action.payload?.data ?? action.payload;
      })
      .addCase(createToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // refresh token
      .addCase(fetchMyToken.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(fetchMyToken.fulfilled, (state, action) => {
        state.refreshing = false;
        if (action.payload) state.myToken = action.payload;
      })
      .addCase(fetchMyToken.rejected, (state) => {
        state.refreshing = false;
      });
  },
});

export default tokenSlice.reducer;
