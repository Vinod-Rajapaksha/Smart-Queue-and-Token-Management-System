import { apiFetch } from "../../../services/http/interceptors";
import type { TokenDto, TokenStatus } from "../types";
import { TOKEN_ENDPOINTS } from "./token.endpoints";

export const tokenApi = {
  list: (params?: {
    branchId?: string;
    counterId?: string;
    status?: TokenStatus | "";
    date?: string; // YYYY-MM-DD
  }) => {
    const qs = new URLSearchParams();

    if (params?.branchId) qs.set("branchId", params.branchId);
    if (params?.counterId) qs.set("counterId", params.counterId);
    if (params?.status) qs.set("status", params.status);
    if (params?.date) qs.set("date", params.date);

    const url = qs.toString()
      ? `${TOKEN_ENDPOINTS.list}?${qs.toString()}`
      : TOKEN_ENDPOINTS.list;

    return apiFetch<TokenDto[]>(url);
  },

  updateStatus: (tokenId: string, status: TokenStatus) =>
    apiFetch<TokenDto>(TOKEN_ENDPOINTS.updateStatus(tokenId), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
