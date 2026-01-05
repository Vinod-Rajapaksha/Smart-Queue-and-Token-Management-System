import { apiFetch } from "../../../services/http/interceptors";
import { BRANCH_ENDPOINTS } from "./branch.endpoints";
import type { Branch, BranchFilters, CreateBranchPayload, UpdateBranchPayload } from "../types";

export const branchApi = {
  getBranches(filters?: BranchFilters) {
    const qs = filters?.isActive ? `?isActive=${filters.isActive}` : "";
    return apiFetch<Branch[]>(`${BRANCH_ENDPOINTS.base}${qs}`, { 
      method: "GET" 
    });
  },

  getBranchById(id: string) {
    return apiFetch<Branch>(BRANCH_ENDPOINTS.byId(id), { 
      method: "GET" 
    });
  },

  createBranch(payload: CreateBranchPayload) {
    return apiFetch<Branch>(BRANCH_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBranch(id: string, payload: UpdateBranchPayload) {
    return apiFetch<Branch>(BRANCH_ENDPOINTS.byId(id), {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deactivateBranch(id: string) {
    return apiFetch<Branch>(BRANCH_ENDPOINTS.byId(id), { 
      method: "DELETE" 
    });
  },

  activateBranch(id: string) {
    return apiFetch<Branch>(BRANCH_ENDPOINTS.activate(id), { 
      method: "PATCH" 
    });
  },
};
