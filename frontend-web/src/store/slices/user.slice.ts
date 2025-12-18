import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  [key: string]: string | number | boolean | null;
}

export interface UserState {
  profile: Record<string, unknown> | null;
}

const initialState: UserState = {
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Record<string, unknown>>) {
      state.profile = action.payload;
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
});

export const { setProfile, clearProfile } = userSlice.actions;
export default userSlice.reducer;
