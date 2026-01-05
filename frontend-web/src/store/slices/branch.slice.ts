import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Branch, CreateBranchPayload, UpdateBranchPayload, BranchFilters } from "../../features/branch/types";
import {branchApi} from "../../features/branch/api/branch.api";

type BranchState = {
  items: Branch[];
  selected: Branch | null;
  loading: boolean;
  error: string | null;
};

const initialState: BranchState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchBranches = createAsyncThunk(
  "branch/fetchBranches",
  async (filters: BranchFilters | undefined) => {
    return await branchApi.getBranches(filters);
  }
);

export const fetchBranchById = createAsyncThunk(
  "branch/fetchBranchById",
  async (id: string) => {
    return await branchApi.getBranchById(id);
  }
);

export const createBranch = createAsyncThunk(
  "branch/createBranch",
  async (payload: CreateBranchPayload) => {
    return await branchApi.createBranch(payload);
  }
);

export const updateBranch = createAsyncThunk(
  "branch/updateBranch",
  async ({ id, payload }: { id: string; payload: UpdateBranchPayload }) => {
    return await branchApi.updateBranch(id, payload);
  }
);

export const deactivateBranch = createAsyncThunk(
  "branch/deactivateBranch",
  async (id: string) => {
    return await branchApi.deactivateBranch(id);
  }
);

export const activateBranch = createAsyncThunk(
  "branch/activateBranch",
  async (id: string) => {
    return await branchApi.activateBranch(id);
  }
);

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    clearSelectedBranch(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchBranches.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBranches.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchBranches.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to load branches"; })

      // fetch by id
      .addCase(fetchBranchById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBranchById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(fetchBranchById.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to load branch"; })

      // create
      .addCase(createBranch.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createBranch.fulfilled, (s, a) => {
        s.loading = false;
        s.items = [a.payload, ...s.items];
      })
      .addCase(createBranch.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to create branch"; })

      // update
      .addCase(updateBranch.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateBranch.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.map((b) => (b._id === a.payload._id ? a.payload : b));
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
      })
      .addCase(updateBranch.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to update branch"; })

      // deactivate
      .addCase(deactivateBranch.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deactivateBranch.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.map((b) => (b._id === a.payload._id ? a.payload : b));
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
      })
      .addCase(deactivateBranch.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to deactivate branch"; });

      // activate
      builder
      .addCase(activateBranch.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(activateBranch.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.map((b) => (b._id === a.payload._id ? a.payload : b));
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
      })
      .addCase(activateBranch.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to activate branch"; });
  },
});

export const { clearSelectedBranch } = branchSlice.actions;
export default branchSlice.reducer;
