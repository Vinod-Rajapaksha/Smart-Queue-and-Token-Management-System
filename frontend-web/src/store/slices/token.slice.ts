import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { ApiError } from "../../services/http/errors";

import { tokenApi } from "../../features/token/api/token.api";
import type { TokenDto, TokenStatus } from "../../features/token/types";

type TokenFilters = {
  branchId: string;
  counterId: string;
  status: TokenStatus | "";
  date: string; // YYYY-MM-DD
};

type TokenState = {
  items: TokenDto[];
  loading: boolean;
  error: string | null;
  filters: TokenFilters;
};

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const initialState: TokenState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    branchId: "",
    counterId: "",
    status: "",
    date: todayStr(),
  },
};

export const fetchTokens = createAsyncThunk(
  "token/fetchTokens",
  async (
    params: { branchId?: string; counterId?: string; status?: TokenStatus | ""; date?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await tokenApi.list(params);
    } catch (err: unknown) {
      if (err instanceof ApiError) return rejectWithValue(err.message);
      return rejectWithValue("Failed to load tokens");
    }
  }
);

export const updateTokenStatus = createAsyncThunk(
  "token/updateTokenStatus",
  async (
    { tokenId, status }: { tokenId: string; status: TokenStatus },
    { rejectWithValue }
  ) => {
    try {
      return await tokenApi.updateStatus(tokenId, status);
    } catch (err: unknown) {
      if (err instanceof ApiError) return rejectWithValue(err.message);
      return rejectWithValue("Failed to update token status");
    }
  }
);

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    clearTokenError(state) {
      state.error = null;
    },
    clearTokens(state) {
      state.items = [];
      state.error = null;
    },
    setTokenFilters(state, action: { payload: Partial<TokenFilters>; type: string }) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch tokens
      .addCase(fetchTokens.pending, (s, a) => {
        s.loading = true;
        s.error = null;

        const p = (a.meta.arg ?? {}) as Partial<TokenFilters>;
        if (typeof p.branchId === "string") s.filters.branchId = p.branchId;
        if (typeof p.counterId === "string") s.filters.counterId = p.counterId;
        if (typeof p.status === "string") s.filters.status = p.status as TokenStatus | "";
        if (typeof p.date === "string") s.filters.date = p.date;
      })
      .addCase(fetchTokens.fulfilled, (s, a) => {
        s.loading = false;
        s.items = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchTokens.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || a.error.message || "Failed to load tokens";
      })

      // update token status
      .addCase(updateTokenStatus.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateTokenStatus.fulfilled, (s, a) => {
        s.loading = false;

        const updated = a.payload;
        const idx = s.items.findIndex((t) => t._id === updated._id);
        if (idx !== -1) s.items[idx] = updated;

        toast.success(`Token #${updated.tokenNumber} → ${updated.status}`);
      })
      .addCase(updateTokenStatus.rejected, (s, a) => {
        s.loading = false;
        s.error =
          (a.payload as string) || a.error.message || "Failed to update token status";
      });
  },
});

export const { clearTokenError, clearTokens, setTokenFilters } = tokenSlice.actions;
export default tokenSlice.reducer;
