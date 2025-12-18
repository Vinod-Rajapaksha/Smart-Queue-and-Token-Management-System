import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CounterState {
  list: unknown[];
}

const initialState: CounterState = {
  list: [],
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setCounters(state, action: PayloadAction<unknown[]>) {
      state.list = action.payload;
    },
  },
});

export const { setCounters } = counterSlice.actions;
export default counterSlice.reducer;
