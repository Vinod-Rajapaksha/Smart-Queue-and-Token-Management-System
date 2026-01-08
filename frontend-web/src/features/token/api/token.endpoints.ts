export const TOKEN_ENDPOINTS = {
  list: "/tokens",
  updateStatus: (id: string) => `/tokens/${id}/status`,
} as const;
