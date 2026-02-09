export const USER_ENDPOINTS = {
  list: "/users",
  byId: (id: string) => `/users/${id}`,
  create: "/users",
  update: (id: string) => `/users/${id}`,
  delete: (id: string) => `/users/${id}`,
  status: (id: string) => `/users/${id}/status`,
  resetPassword: (id: string) => `/users/${id}/reset-password`,
  me: "/users/me",
  changeMyPassword: "/users/me/password",
  
} as const;
