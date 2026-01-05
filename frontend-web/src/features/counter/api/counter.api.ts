import { apiFetch } from "../../../services/http/interceptors";
import type {
  CounterDto,
  CreateCounterDto,
  UpdateCounterDto,
  ChangeCounterStatusDto,
  PaginatedResult,
} from "../types";
import { COUNTER_ENDPOINTS } from "./counter.endpoints";

export const counterApi = {
  list: async () => {
    const res = await apiFetch<PaginatedResult<CounterDto>>(COUNTER_ENDPOINTS.list);
    return res.items;
  },
  
  getById: (id: string) => apiFetch<CounterDto>(COUNTER_ENDPOINTS.byId(id)),

  create: (payload: CreateCounterDto) =>
    apiFetch<CounterDto>(COUNTER_ENDPOINTS.list, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateCounterDto) =>
    apiFetch<CounterDto>(COUNTER_ENDPOINTS.update(id), {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  changeStatus: (id: string, payload: ChangeCounterStatusDto) =>
    apiFetch<CounterDto>(COUNTER_ENDPOINTS.changeStatus(id), {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    apiFetch<void>(COUNTER_ENDPOINTS.remove(id), { method: "DELETE" }),
};
