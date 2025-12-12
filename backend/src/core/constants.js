// USER ROLES
export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

// TOKEN STATUS
export const TOKEN_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// QUEUE STATUS
export const QUEUE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

// DEFAULT PAGINATION
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
};

// SORT ORDER
export const SORT_ORDER = {
  ASC: 1,
  DESC: -1,
};

// COMMON MESSAGES
export const MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
};
