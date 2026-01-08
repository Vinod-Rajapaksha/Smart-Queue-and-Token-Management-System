import { apiFetch } from "../../../services/http/interceptors";
import type { PaginatedResponse } from "../../../types/api"; 
import type { QueueDto, TokenDto, OpenQueueDto, CloseQueueDto, CallNextDto } from "../types";
import { QUEUE_ENDPOINTS } from "./queue.endpoints";

export const queueApi = {
  list: async (params?: { branchId?: string; status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.branchId) qs.set("branchId", params.branchId);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));

    const url = qs.toString() ? `${QUEUE_ENDPOINTS.list}?${qs.toString()}` : QUEUE_ENDPOINTS.list;

    const res = await apiFetch<PaginatedResponse<QueueDto>>(url);
    return res.items;
  },

  listPaginated: (params?: { branchId?: string; status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.branchId) qs.set("branchId", params.branchId);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));

    const url = qs.toString() ? `${QUEUE_ENDPOINTS.list}?${qs.toString()}` : QUEUE_ENDPOINTS.list;
    return apiFetch<PaginatedResponse<QueueDto>>(url);
  },

  open: (payload: OpenQueueDto) =>
    apiFetch<QueueDto>(QUEUE_ENDPOINTS.open, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  close: (payload: CloseQueueDto) =>
    apiFetch<QueueDto>(QUEUE_ENDPOINTS.close, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  active: (counterId: string) => apiFetch<QueueDto>(QUEUE_ENDPOINTS.active(counterId)),

  next: (payload: CallNextDto) =>
    apiFetch<TokenDto>(QUEUE_ENDPOINTS.next, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  serving: (tokenId: string) =>
    apiFetch<TokenDto>(QUEUE_ENDPOINTS.tokenServing(tokenId), { method: "PATCH" }),

  skipped: (tokenId: string) =>
    apiFetch<TokenDto>(QUEUE_ENDPOINTS.tokenSkipped(tokenId), { method: "PATCH" }),

  cancelled: (tokenId: string) =>
    apiFetch<TokenDto>(QUEUE_ENDPOINTS.tokenCancelled(tokenId), { method: "PATCH" }),

  completed: (tokenId: string) =>
    apiFetch<TokenDto>(QUEUE_ENDPOINTS.tokenCompleted(tokenId), { method: "PATCH" }),
};
