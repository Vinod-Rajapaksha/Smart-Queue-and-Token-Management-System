import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface BranchState {
  list: unknown[];
}

const initialState: BranchState = {
  list: [],
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setBranches(state, action: PayloadAction<unknown[]>) {
      state.list = action.payload;
    },
  },
});

export const { setBranches } = branchSlice.actions;
export default branchSlice.reducer;
