import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchQueues } from "../../../store/slices/queue.slice";
import { fetchBranches } from "../../../store/slices/branch.slice";

import PageHeader from "../../../components/common/PageHeader";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";

import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";

import type { QueueDto } from "../types";
import type { Branch } from "../../branch/types";

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

function counterName(counter: QueueDto["counter"]) {
  if (!counter) return "-";
  return typeof counter === "string" ? counter : counter.name;
}

export default function QueueListPage() {
  const dispatch = useAppDispatch();

  const { paginated, items, loading, error } = useAppSelector((s) => s.queue);
  const branchState = useAppSelector((s) => s.branch);

  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState<"" | "OPEN" | "CLOSED">("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchBranches(undefined));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchQueues({
        branchId: branchId || undefined,
        status: status || undefined,
        page,
        limit,
      })
    );
  }, [dispatch, branchId, status, page]);

  const branches = useMemo(() => (branchState.items ?? []) as Branch[], [branchState.items]);

  const total = paginated?.total ?? 0;
  const totalPages = paginated?.totalPages ?? 1;

  const openCount = useMemo(
    () => items.filter((q) => q.status === "OPEN").length,
    [items]
  );

  const columns = useMemo(
    () => [
      {
        header: "Counter",
        cell: (q: QueueDto) => (
          <div className="font-medium text-gray-200">{counterName(q.counter)}</div>
        ),
      },
      {
        header: "Status",
        cell: (q: QueueDto) => (
          <Badge variant={q.status === "OPEN" ? "success" : "danger"}>
            {q.status}
          </Badge>
        ),
      },
      {
        header: "Current Token",
        cell: (q: QueueDto) => (
          <span className="text-gray-300">{q.currentToken ?? "-"}</span>
        ),
      },
      {
        header: "Last Called",
        cell: (q: QueueDto) => (
          <span className="text-gray-300">{fmtDate(q.lastCalledAt ?? null)}</span>
        ),
      },
      {
        header: "Opened",
        cell: (q: QueueDto) => (
          <span className="text-gray-300">{fmtDate(q.openedAt ?? null)}</span>
        ),
      },
      {
        header: "Created",
        cell: (q: QueueDto) => (
          <span className="text-gray-400">{fmtDate(q.createdAt)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queues"
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400">
              Total: <span className="text-gray-200">{total}</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">
              Showing: <span className="text-gray-200">{items.length}</span>
            </span>
            <Badge variant={openCount > 0 ? "warning" : "default"} className="ml-2">
              {openCount} Open
            </Badge>
          </div>
        }
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setBranchId("");
                setStatus("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="Branch"
          value={branchId}
          onChange={(v) => {
            setBranchId(v);
            setPage(1);
          }}
          options={[
            ...branches.map((b) => ({ value: b._id, label: b.name })),
          ]}
          placeholder="All branches"
        />

        <Select
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v as "" | "OPEN" | "CLOSED");
            setPage(1);
          }}
          options={[
            { value: "OPEN", label: "OPEN" },
            { value: "CLOSED", label: "CLOSED" },
          ]}
          placeholder="All statuses"
        />

        <div className="flex items-end justify-end gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>

          <div className="pb-2 text-sm text-gray-400">
            Page <span className="text-gray-200">{page}</span> /{" "}
            <span className="text-gray-200">{totalPages}</span>
          </div>

          <Button
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {loading && <Loading />}

      {!loading && error && <EmptyState title="Error" message={error} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState title="No queues" message="No queues found for the selected filters." />
      )}

      {!loading && !error && items.length > 0 && (
        <Table<QueueDto> columns={columns} data={items} keyField="_id" />
      )}
    </div>
  );
}
