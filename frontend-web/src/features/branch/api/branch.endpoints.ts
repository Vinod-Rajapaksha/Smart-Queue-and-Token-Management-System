export const BRANCH_ENDPOINTS = {
  base: "/branches",
  byId: (id: string) => `/branches/${id}`,
  activate: (id: string) => `/branches/${id}/activate`,
} as const;