import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AnalyticsState {
  data: Record<string, unknown>;
}

const initialState: AnalyticsState = {
  data: {},
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setAnalytics(state, action: PayloadAction<Record<string, unknown>>) {
      state.data = action.payload;
    },
  },
});

export const { setAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
