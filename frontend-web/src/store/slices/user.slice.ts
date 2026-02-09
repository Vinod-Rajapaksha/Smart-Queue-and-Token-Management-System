import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userApi } from "../../features/user/api/user.api";
import type {
  UserListItem,
  CreateUserInput,
  UpdateUserInput,
} from "../../features/user/types";

type UserState = {
  items: UserListItem[];
  me: UserListItem | null;
  loading: boolean;
  error: string | null;
};

const initialState: UserState = {
  items: [],
  me: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<UserListItem[]>(
  "users/fetchAll",
  async () => {
    return await userApi.getUsers();
  }
);

export const updateUserStatus = createAsyncThunk<
  UserListItem,
  { userId: string; isActive: boolean }
>("users/updateStatus", async ({ userId, isActive }) => {
  return await userApi.updateUserStatus({ userId, isActive });
});

export const fetchMe = createAsyncThunk<UserListItem>(
  "users/fetchMe",
  async () => {
    return await userApi.getMe();
  }
);

export const updateMe = createAsyncThunk<UserListItem,{ name: string; email: string; telephone: string }
>("users/updateMe", async (payload) => {
  return await userApi.updateMe(payload);
});

export const createUser = createAsyncThunk<UserListItem, CreateUserInput>(
  "users/create",
  async (payload) => {
    return await userApi.createUser(payload);
  }
);

export const updateUser = createAsyncThunk<
  UserListItem,
  { userId: string; updates: UpdateUserInput }
>("users/update", async ({ userId, updates }) => {
  return await userApi.updateUser(userId, updates);
});

export const resetUserPassword = createAsyncThunk<
  { userId: string },
  { userId: string; password: string }
>("users/resetPassword", async ({ userId, password }) => {
  await userApi.resetUserPassword({ userId, password });
  return { userId };
});


export const deleteUser = createAsyncThunk<
  { userId: string },
  { userId: string }
>("users/delete", async ({ userId }) => {
  await userApi.deleteUser(userId);
  return { userId };
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchUsers.pending, (s) => {
      s.loading = true;
      s.error = null;
    });

    b.addCase(fetchUsers.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload;
    });

    b.addCase(fetchUsers.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message ?? "Failed to fetch users";
    });

    b.addCase(updateUserStatus.fulfilled, (s, a) => {
      const index = s.items.findIndex((u) => u.id === a.payload.id);
      if (index !== -1) s.items[index] = a.payload;
    });

    b.addCase(fetchMe.pending, (s) => {
      s.loading = true;
      s.error = null;
    });

    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.loading = false;
      s.me = a.payload;
    });

    b.addCase(fetchMe.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message ?? "Failed to fetch profile";
    });

    b.addCase(updateMe.pending, (s) => {
      s.loading = true;
      s.error = null;
    });

    b.addCase(updateMe.fulfilled, (s, a) => {
      s.loading = false;
      s.me = a.payload;

      const idx = s.items.findIndex((u) => u.id === a.payload.id);
      if (idx !== -1) s.items[idx] = a.payload;
    });

    b.addCase(updateMe.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message ?? "Failed to update profile";
    });

    b.addCase(createUser.fulfilled, (s, a) => {
      s.items = [a.payload, ...s.items];
    });

    b.addCase(updateUser.fulfilled, (s, a) => {
      const idx = s.items.findIndex((u) => u.id === a.payload.id);
      if (idx !== -1) s.items[idx] = a.payload;

      if (s.me?.id === a.payload.id) s.me = a.payload;
    });

    
    b.addCase(deleteUser.fulfilled, (s, a) => {
      s.items = s.items.filter((u) => u.id !== a.payload.userId);
    });
  },
});

export default userSlice.reducer;
