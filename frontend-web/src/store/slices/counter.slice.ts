import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { counterApi } from "../../features/counter/api/counter.api";
import type {
  CounterDto,
  CreateCounterDto,
  UpdateCounterDto,
  ChangeCounterStatusDto,
} from "../../features/counter/types";

type CounterState = {
  items: CounterDto[];
  selected: CounterDto | null;
  loading: boolean;
  error: string | null;
};

const initialState: CounterState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchCounters = createAsyncThunk("counter/fetchCounters", async () => {
  return await counterApi.list();
});

export const fetchCounterById = createAsyncThunk(
  "counter/fetchCounterById",
  async (id: string) => {
    return await counterApi.getById(id);
  }
);

export const createCounter = createAsyncThunk(
  "counter/createCounter",
  async (payload: CreateCounterDto) => {
    return await counterApi.create(payload);
  }
);

export const updateCounter = createAsyncThunk(
  "counter/updateCounter",
  async ({ id, payload }: { id: string; payload: UpdateCounterDto }) => {
    return await counterApi.update(id, payload);
  }
);

export const changeCounterStatus = createAsyncThunk(
  "counter/changeCounterStatus",
  async ({ id, payload }: { id: string; payload: ChangeCounterStatusDto }) => {
    return await counterApi.changeStatus(id, payload);
  }
);

export const deleteCounter = createAsyncThunk(
  "counter/deleteCounter",
  async (id: string) => {
    await counterApi.remove(id);
    return id; 
  }
);

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    clearSelectedCounter(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchCounters.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCounters.fulfilled, (s, a) => {
        s.loading = false;
        s.items = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchCounters.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to load counters";
      })

      // fetch by id
      .addCase(fetchCounterById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCounterById.fulfilled, (s, a) => {
        s.loading = false;
        s.selected = a.payload;
      })
      .addCase(fetchCounterById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to load counter";
      })

      // create
      .addCase(createCounter.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createCounter.fulfilled, (s, a) => {
        s.loading = false;
        s.items = [a.payload, ...s.items];
        toast.success("Counter created");
      })
      .addCase(createCounter.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to create counter";
      })

      // update
      .addCase(updateCounter.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateCounter.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.map((c) => (c._id === a.payload._id ? a.payload : c));
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
        toast.success("Counter updated");
      })
      .addCase(updateCounter.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to update counter";
      })

      // status change
      .addCase(changeCounterStatus.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(changeCounterStatus.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.map((c) => (c._id === a.payload._id ? a.payload : c));
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
        toast.success("Status updated");
      })
      .addCase(changeCounterStatus.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to update status";
      })

      // delete
      .addCase(deleteCounter.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteCounter.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.filter((c) => c._id !== a.payload);
        if (s.selected?._id === a.payload) s.selected = null;
        toast.success("Counter deleted");
      })
      .addCase(deleteCounter.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to delete counter";
      });
  },
});

export const { clearSelectedCounter } = counterSlice.actions;
export default counterSlice.reducer;
