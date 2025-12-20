// USER ROLES
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export type ROLES = (typeof ROLES)[keyof typeof ROLES];

// ADMIN PORTAL ROLES
export const ADMIN_PORTAL_ROLES: ROLES[] = ["ADMIN", "MANAGER", "STAFF"];

// QUEUE STATUS
export const QUEUE_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export type QUEUE_STATUS = (typeof QUEUE_STATUS)[keyof typeof QUEUE_STATUS];

// TOKEN STATUS
export const TOKEN_STATUS = {
  CREATED: "CREATED",
  WAITING: "WAITING",
  CALLING: "CALLING",
  SERVING: "SERVING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  SKIPPED: "SKIPPED",
} as const;

export type TOKEN_STATUS = (typeof TOKEN_STATUS)[keyof typeof TOKEN_STATUS];
