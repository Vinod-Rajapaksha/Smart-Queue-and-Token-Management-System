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

export const updateMe = async (data: {
  name: string;
  email: string;
  telephone: string;
}): Promise<MeDto> => {
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
