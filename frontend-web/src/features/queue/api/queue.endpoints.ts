export const QUEUE_ENDPOINTS = {
  open: "/queues/open",
  close: "/queues/close",

  active: (counterId: string) => `/queues/active/${counterId}`,

  next: "/queues/next",

  tokenServing: (tokenId: string) => `/queues/tokens/${tokenId}/serving`,
  tokenSkipped: (tokenId: string) => `/queues/tokens/${tokenId}/skipped`,
  tokenCancelled: (tokenId: string) => `/queues/tokens/${tokenId}/cancelled`,
  tokenCompleted: (tokenId: string) => `/queues/tokens/${tokenId}/completed`,

  list: "/queues",
} as const;
