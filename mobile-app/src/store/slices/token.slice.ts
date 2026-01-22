import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createToken as createTokenService, fetchMyTokens } from "../../services/tokenService";
import * as ratingService from "../../services/ratingService";

interface TokenState {
  myToken: any | null;
  activeTokens: any[];
  completedTokens: any[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  historyLoading: boolean;
  ratingLoading: boolean;
  successMessage: string | null;
}

const initialState: TokenState = {
  myToken: null,
  activeTokens: [],
  completedTokens: [],
  loading: false,
  error: null,
  refreshing: false,
  historyLoading: false,
  ratingLoading: false,
  successMessage: null,
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

export const fetchMyTokensSplit = createAsyncThunk(
  "token/fetchMyTokensSplit",
  async (_, thunkAPI) => {
    try {
      const res = await fetchMyTokens();
      const list = Array.isArray(res?.data) ? res.data : [];
      const activeTokens = list.filter(
        (t: any) => !["COMPLETED", "CANCELLED"].includes(t.status)
      );
      const completedTokens = list.filter((t: any) =>
        ["COMPLETED", "CANCELLED"].includes(t.status)
      );
      const myToken = activeTokens[0] || null;

      return { activeTokens, completedTokens, myToken };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch tokens"
      );
    }
  }
);

export const submitTokenRating = createAsyncThunk(
  "token/submitRating",
  async (
    data: { tokenId: string; rating: number; comment?: string },
    thunkAPI
  ) => {
    try {
      const result = await ratingService.submitRating(data.tokenId, data.rating, data.comment);
      return result;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Rating submit failed"
      );
    }
  }
);

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // create token
      .addCase(createToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null; 
      })
      .addCase(createToken.fulfilled, (state, action) => {
        state.loading = false;
        state.myToken = action.payload?.data ?? action.payload;
        state.successMessage = action.payload?.message ?? "Success";
      })
      .addCase(createToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.successMessage = null;
      })

      // refresh tokens
      .addCase(fetchMyTokensSplit.pending, (state) => {
        state.refreshing = true;
        state.historyLoading = true;
      })
      .addCase(fetchMyTokensSplit.fulfilled, (state, action) => {
        state.refreshing = false;
        state.historyLoading = false;

        state.activeTokens = action.payload.activeTokens;
        state.completedTokens = action.payload.completedTokens;
        state.myToken = action.payload.myToken;
      })
      .addCase(fetchMyTokensSplit.rejected, (state) => {
        state.refreshing = false;
        state.historyLoading = false;
      })

      // submit token rating
      .addCase(submitTokenRating.pending, (state) => {
        state.ratingLoading = true;
        state.error = null;
      })
      .addCase(submitTokenRating.fulfilled, (state) => {
        state.ratingLoading = false;
      })
      .addCase(submitTokenRating.rejected, (state, action) => {
        state.ratingLoading = false;
        state.error = action.payload as string;
      });

  },
});

export const { clearSuccessMessage, clearError } = tokenSlice.actions;
export default tokenSlice.reducer;
