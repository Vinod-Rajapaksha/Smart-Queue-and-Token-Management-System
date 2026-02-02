import api from "./api";

export interface MeDto {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: string;
  branch: { _id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getMe = async (): Promise<MeDto> => {
  const response = await api.get("/users/me");
  return response.data.data;
};

export type UpdateMeDto = Partial<Pick<MeDto, "name" | "email" | "telephone">>;

export const updateMe = async (data: UpdateMeDto): Promise<MeDto> => {
  const response = await api.patch("/users/me", data);
  return response.data.data;
};

export const changeMyPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.patch("/users/me/password", data);
  return response.data;
};
