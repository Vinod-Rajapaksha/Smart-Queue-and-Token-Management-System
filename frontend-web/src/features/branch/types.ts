export type Branch = {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BranchFilters = {
  isActive?: "true" | "false";
};

export type CreateBranchPayload = {
  name: string;
  code: string;
  address: string;
  city: string;
  contactNumber?: string;
};

export type UpdateBranchPayload = Partial<CreateBranchPayload> & {
  isActive?: boolean;
};
