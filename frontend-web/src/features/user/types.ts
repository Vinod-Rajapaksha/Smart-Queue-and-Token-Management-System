import type { ROLES } from "../../types/enums";

export type BranchRef =
  | string
  | {
      _id: string;
      name: string;
      code: string;
    }
  | null;

export type BackendUser = {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: ROLES;
  branch: BranchRef;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListItem = BackendUser & { id: string };

export type UpdateUserStatusInput = {
  userId: string;
  isActive: boolean;
};

export type MeResponse = UserListItem;

export type UpdateMeInput = {
  name?: string;
  email?: string;
  telephone?: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  telephone: string;
  role: ROLES;          
  password: string;
  branch?: string | null; 
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  telephone?: string;
  role?: ROLES;
  branch?: string | null;  
  isActive?: boolean;
};

export type ResetPasswordInput = {
  userId: string;
  password: string;
};