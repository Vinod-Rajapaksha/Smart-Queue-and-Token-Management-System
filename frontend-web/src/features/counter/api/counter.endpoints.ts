export const COUNTER_ENDPOINTS = {
  list: "/counters",
  byId: (id: string) => `/counters/${id}`,
  update: (id: string) => `/counters/${id}`,
  changeStatus: (id: string) => `/counters/${id}/status`,
  remove: (id: string) => `/counters/${id}`,
};
