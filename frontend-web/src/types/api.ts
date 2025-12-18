export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

export type ApiResult<T> =
  | { ok: true; value: ApiResponse<T> }
  | { ok: false; error: ApiErrorResponse };
