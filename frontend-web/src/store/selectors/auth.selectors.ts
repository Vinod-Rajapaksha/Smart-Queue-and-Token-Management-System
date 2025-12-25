import type { RootState } from "../store";

export const selectAuthUser = (state: RootState) => state.auth.user;
