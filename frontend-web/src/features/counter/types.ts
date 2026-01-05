export type CounterDto = {
  _id: string;
  branch: {
    _id: string;
    name: string;
    code: string;
  };
  name: string;
  code: string | null;
  services: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCounterDto = {
  branchId: string;
  name: string;
  code?: string | null;
  services?: string[];
  isActive?: boolean;
};

export type UpdateCounterDto = Partial<{
  name: string;
  code: string | null;
  services: string[];
  isActive: boolean;
}>;

export type ChangeCounterStatusDto = {
  isActive: boolean;
};

export type CounterFormValues = {
  branchId: string;
  name: string;
  code: string;
  servicesText: string;
  isActive: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};
