import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TokenState {
  list: unknown[];
}

const initialState: TokenState = {
  list: [],
};

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<unknown[]>) {
      state.list = action.payload;
    },
  },
});

export const { setTokens } = tokenSlice.actions;
export default tokenSlice.reducer;
