export type QueueStatus = "OPEN" | "CLOSED";

export type QueueDto = {
  _id: string;
  branch: string | { _id: string; name: string; code?: string };
  counter?: string | { _id: string; name: string; code?: string };
  status: QueueStatus;
  openedAt?: string;
  closedAt?: string;
  currentToken?: string;
  lastCalledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OpenQueueDto = { 
  counterId: string
};

export type CloseQueueDto = { 
  counterId: string
};

export type CallNextDto = { 
  counterId: string 
};

export type TokenStatus =
  | "CREATED"
  | "WAITING"
  | "CALLING"
  | "SERVING"
  | "SKIPPED"
  | "CANCELLED"
  | "COMPLETED";

export type TokenDto = {
  _id: string;
  tokenNumber: number;
  status: TokenStatus;
  user: string;
  branch: string | { _id: string; name: string };
  counter?: string | { _id: string; name: string; code?: string };
  calledAt?: string;
  servedAt?: string;
  skippedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type QueueListDto = {
  items: QueueDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
