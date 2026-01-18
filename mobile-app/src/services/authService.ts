import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RegisterData {
  name: string;
  email: string;
  telephone: string;
  password: string;
  role: string;
}

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  const { user, accessToken } = response.data.data;

  await AsyncStorage.setItem("token", accessToken);

  return user;
};

export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);

  return response.data.data;
};


export const logout = async () => {
  await AsyncStorage.removeItem("token");
};
