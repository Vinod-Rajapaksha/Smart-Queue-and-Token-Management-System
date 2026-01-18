import api from "./api";

export const createToken = async (branchId: string, queueId: string) => {
  const response = await api.post("/tokens", { branchId, queueId });
  return response.data;
};

export const fetchMyTokens = async () => {
  const response = await api.get("/tokens/me");
  return response.data;
};
