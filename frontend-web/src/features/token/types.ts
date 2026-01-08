export type TokenStatus =
  | "CREATED"
  | "WAITING"
  | "CALLING"
  | "SERVING"
  | "SKIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type TokenDto = {
  _id: string;
  tokenNumber: number;
  status: TokenStatus;
  branch?: string | { _id: string; name: string };
  queue?: string | { _id: string; name?: string; code?: string };
  user?: string | { _id: string; name?: string; email?: string };
  servedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  skippedAt?: string | null;
  calledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
