import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { ApiError } from "../../services/http/errors";

import { queueApi } from "../../features/queue/api/queue.api";
import type {
  QueueDto,
  QueueListDto,
  TokenDto,
} from "../../features/queue/types";

type QueueState = {
  items: QueueDto[];             
  paginated: QueueListDto | null;
  active: QueueDto | null;        
  lastToken: TokenDto | null;
  loading: boolean;
  error: string | null;
};

const initialState: QueueState = {
  items: [],
  paginated: null,
  active: null,
  lastToken: null,
  loading: false,
  error: null,
};

export const fetchQueues = createAsyncThunk(
  "queue/fetchQueues",
  async (params?: { branchId?: string; status?: string; page?: number; limit?: number }) => {
    return await queueApi.listPaginated(params);
  }
);

export const fetchActiveQueue = createAsyncThunk(
  "queue/fetchActiveQueue",
  async (counterId: string, { rejectWithValue }) => {
    try {
      return await queueApi.active(counterId);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          return null;
        }
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to load active queue");
    }
  }
);

export const openQueue = createAsyncThunk(
  "queue/openQueue",
  async (counterId: string) => {
    return await queueApi.open({ counterId });
  }
);

export const closeQueue = createAsyncThunk(
  "queue/closeQueue",
  async (counterId: string) => {
    return await queueApi.close({ counterId });
  }
);

export const callNext = createAsyncThunk(
  "queue/callNext",
  async ({ counterId }: { counterId: string }) => {
    return await queueApi.next({ counterId });
  }
);

export const markServing = createAsyncThunk(
  "queue/markServing",
  async (tokenId: string) => {
    return await queueApi.serving(tokenId);
  }
);

export const markSkipped = createAsyncThunk(
  "queue/markSkipped",
  async (tokenId: string) => {
    return await queueApi.skipped(tokenId);
  }
);

export const markCancelled = createAsyncThunk(
  "queue/markCancelled",
  async (tokenId: string) => {
    return await queueApi.cancelled(tokenId);
  }
);

export const markCompleted = createAsyncThunk(
  "queue/markCompleted",
  async (tokenId: string) => {
    return await queueApi.completed(tokenId);
  }
);

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    clearSelectedQueueState(state) {
      state.active = null;
      state.lastToken = null;
    },
    clearQueueError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list (paginated)
      .addCase(fetchQueues.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchQueues.fulfilled, (s, a) => {
        s.loading = false;
        s.paginated = a.payload;
        s.items = Array.isArray(a.payload?.items) ? a.payload.items : [];
      })
      .addCase(fetchQueues.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to load queues";
      })

      // active queue
      .addCase(fetchActiveQueue.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchActiveQueue.fulfilled, (s, a) => {
        s.loading = false;
        s.error = null;
        s.active = a.payload;
      })
      .addCase(fetchActiveQueue.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || a.error.message || "Failed to load active queue";
      })

      // open queue
      .addCase(openQueue.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(openQueue.fulfilled, (s, a) => {
        s.loading = false;
        s.active = a.payload;
        toast.success("Queue opened");
      })
      .addCase(openQueue.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to open queue";
      })

      // close queue
      .addCase(closeQueue.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(closeQueue.fulfilled, (s, a) => {
        s.loading = false;
        s.active = a.payload;
        toast.success("Queue closed");
      })
      .addCase(closeQueue.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to close queue";
      })

      // call next
      .addCase(callNext.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(callNext.fulfilled, (s, a) => {
        s.loading = false;
        s.lastToken = a.payload;
        toast.success(`Called token #${a.payload?.tokenNumber ?? ""}`.trim());
      })
      .addCase(callNext.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to call next token";
      })

      // serving
      .addCase(markServing.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(markServing.fulfilled, (s, a) => {
        s.loading = false;
        s.lastToken = a.payload;
        toast.success("Token marked serving");
      })
      .addCase(markServing.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to mark serving";
      })

      // skipped
      .addCase(markSkipped.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(markSkipped.fulfilled, (s, a) => {
        s.loading = false;
        s.lastToken = a.payload;
        toast.success("Token marked skipped");
      })
      .addCase(markSkipped.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to mark skipped";
      })

      // cancelled
      .addCase(markCancelled.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(markCancelled.fulfilled, (s, a) => {
        s.loading = false;
        s.lastToken = a.payload;
        toast.success("Token cancelled");
      })
      .addCase(markCancelled.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to cancel token";
      })

      // completed
      .addCase(markCompleted.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(markCompleted.fulfilled, (s, a) => {
        s.loading = false;
        s.lastToken = a.payload;
        toast.success("Token completed");
      })
      .addCase(markCompleted.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to complete token";
      });
  },
});

export const { clearSelectedQueueState, clearQueueError } = queueSlice.actions;
export default queueSlice.reducer;
