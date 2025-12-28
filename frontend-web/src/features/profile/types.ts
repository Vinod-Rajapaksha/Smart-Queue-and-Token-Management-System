import type { ROLES } from "../../types/enums";

export type BranchDto = {
  _id: string;
  name: string;
} | null;

export type MeDto = {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: ROLES;
  branch: BranchDto;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};
