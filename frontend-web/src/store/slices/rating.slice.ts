import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RatingState {
  list: unknown[];
}

const initialState: RatingState = {
  list: [],
};

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    setRatings(state, action: PayloadAction<unknown[]>) {
      state.list = action.payload;
    },
  },
});

export const { setRatings } = ratingSlice.actions;
export default ratingSlice.reducer;
