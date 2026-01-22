import api from "./api";

export const submitRating = async (tokenId: string, rating: number, comment?: string) => {
  const response = await api.post("/ratings", { tokenId, rating, comment });
  
  return response.data;
};
