import { apiFetch } from "../../../services/http/interceptors";
import { USER_ENDPOINTS } from "./user.endpoints";
import type {
  BackendUser,
  CreateUserInput,
  ResetPasswordInput,
  UpdateMeInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserListItem,
} from "../types";

function withId(u: BackendUser): UserListItem {
  return { ...u, id: u._id };
}

export const userApi = {
  async getUsers(): Promise<UserListItem[]> {
    const data = await apiFetch<BackendUser[]>(USER_ENDPOINTS.list, { method: "GET" });
    return data.map(withId);
  },

  async createUser(input: CreateUserInput): Promise<UserListItem> {
    const created = await apiFetch<BackendUser>(USER_ENDPOINTS.create, {
      method: "POST",
      body: JSON.stringify({
        ...input,
        branch: input.branch ?? null,
      }),
    });
    return withId(created);
  },

  async updateUser(userId: string, input: UpdateUserInput): Promise<UserListItem> {
    const updated = await apiFetch<BackendUser>(USER_ENDPOINTS.update(userId), {
      method: "PATCH",
      body: JSON.stringify({
        ...input,
        ...(Object.prototype.hasOwnProperty.call(input, "branch")
          ? { branch: input.branch ?? null }
          : {}),
      }),
    });
    return withId(updated);
  },

  async updateUserStatus(input: UpdateUserStatusInput): Promise<UserListItem> {
    const updated = await apiFetch<BackendUser>(USER_ENDPOINTS.status(input.userId), {
      method: "PATCH",
      body: JSON.stringify({ isActive: input.isActive }),
    });
    return withId(updated);
  },

  async resetUserPassword(input: ResetPasswordInput): Promise<void> {
    await apiFetch<null>(USER_ENDPOINTS.resetPassword(input.userId), {
      method: "PATCH",
      body: JSON.stringify({ password: input.password }),
    });
  },

  async getMe(): Promise<UserListItem> {
    const me = await apiFetch<BackendUser>(USER_ENDPOINTS.me, { method: "GET" });
    return withId(me);
  },

  async updateMe(input: UpdateMeInput): Promise<UserListItem> {
    const updated = await apiFetch<BackendUser>(USER_ENDPOINTS.me, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return withId(updated);
  },
  async deleteUser(userId: string): Promise<void> {
    await apiFetch<null>(USER_ENDPOINTS.delete(userId), { method: "DELETE" });
  },
};
