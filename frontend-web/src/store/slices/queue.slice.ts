import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface QueueState {
  active: unknown | null;
}

const initialState: QueueState = {
  active: null,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setActiveQueue(state, action: PayloadAction<unknown>) {
      state.active = action.payload;
    },
    clearQueue(state) {
      state.active = null;
    },
  },
});

export const { setActiveQueue, clearQueue } = queueSlice.actions;
export default queueSlice.reducer;
