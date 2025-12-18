import type { QUEUE_STATUS, ROLES, TOKEN_STATUS } from "./enums";

export type ID = string;

// User
export interface User {
  id: ID;
  name?: string;
  email?: string;
  phone?: string;
  role?: ROLES;
}

// Branch
export interface Branch {
  id: ID;
  name: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Counter
export interface Counter {
  id: ID;
  branchId: ID;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Queue
export interface Queue {
  id: ID;
  branchId: ID;
  name?: string;
  status?: QUEUE_STATUS;
  createdAt?: string;
  updatedAt?: string;
}

// Token
export interface Token {
  id: ID;
  tokenNumber: number;
  userId?: ID;
  branchId: ID;
  queueId: ID;
  status: TOKEN_STATUS;
  issuedAt?: string;
  servedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Rating
export interface Rating {
  id: ID;
  tokenId: ID;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Analytics 
export interface AnalyticsSnapshot {
  avgWaitTime?: number;
  tokensByStatus?: Partial<Record<TOKEN_STATUS, number>>;
}
