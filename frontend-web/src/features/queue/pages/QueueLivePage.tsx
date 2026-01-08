import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchBranches } from "../../../store/slices/branch.slice";
import { fetchCounters } from "../../../store/slices/counter.slice";

import {
  fetchActiveQueue,
  openQueue,
  closeQueue,
  callNext,
  markServing,
  markSkipped,
  markCancelled,
  markCompleted,
} from "../../../store/slices/queue.slice";

import PageHeader from "../../../components/common/PageHeader";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";

import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import type { TokenDto } from "../types";
import type { Branch } from "../../branch/types";
import type { CounterDto } from "../../counter/types";

function tokenLabel(t: TokenDto | null) {
  if (!t) return "-";
  return `#${t.tokenNumber} (${t.status})`;
}

export default function QueueLivePage() {
  const dispatch = useAppDispatch();

  const branchState = useAppSelector((s) => s.branch);
  const counterState = useAppSelector((s) => s.counter);
  const queueState = useAppSelector((s) => s.queue);

  const { active, lastToken, loading, error } = queueState;

  const [branchId, setBranchId] = useState("");
  const [counterId, setCounterId] = useState("");

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    dispatch(fetchBranches(undefined));
    dispatch(fetchCounters());
  }, [dispatch]);

  useEffect(() => {
    if (counterId) dispatch(fetchActiveQueue(counterId));
  }, [dispatch, counterId]);

  const branches = useMemo(() => (branchState.items ?? []) as Branch[], [branchState.items]);

  const countersForBranch = useMemo(() => {
    if (!branchId) return [];

    const counters = (counterState.items ?? []) as CounterDto[];

    return counters.filter((c) => {
      const counterBranchId =
        typeof c.branch === "string"
          ? c.branch
          : c.branch?._id;

      return counterBranchId === branchId;
    });
  }, [counterState.items, branchId]);

  const isQueueOpen = active?.status === "OPEN";

  const onOpenQueue = async () => {
    if (!counterId) return;
    await dispatch(openQueue(counterId)).unwrap();
    dispatch(fetchActiveQueue(counterId));
  };

  const onAskCloseQueue = () => {
    if (!counterId) return;
    setConfirmCloseOpen(true);
  };

  const onConfirmCloseQueue = async () => {
    if (!counterId) return;
    try {
      setClosing(true);
      await dispatch(closeQueue(counterId)).unwrap();
      setConfirmCloseOpen(false);
      dispatch(fetchActiveQueue(counterId));
    } finally {
      setClosing(false);
    }
  };

  const onCallNext = async () => {
    if (!counterId) return;
    await dispatch(callNext({ counterId })).unwrap();
    dispatch(fetchActiveQueue(counterId));
  };

  const tokenId = lastToken?._id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Queue"
        subtitle="Open/close queue, call next token, and update token status."
        right={
          <div className="flex items-center gap-2">
            <Badge variant={isQueueOpen ? "success" : "danger"}>
              {active ? active.status : "NO QUEUE"}
            </Badge>
          </div>
        }
      />

      {/* Selects */}
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Branch"
          value={branchId}
          onChange={(v) => {
            setBranchId(v);
            setCounterId("");
          }}
          options={[
            { value: "NONE", label: "Select branch", disabled: true },
            ...branches.map((b) => ({
              value: b._id,
              label: b.name,
            })),
          ]}
          placeholder="Select branch"
        />

        <Select
          label="Counter"
          value={counterId}
          onChange={(v) => setCounterId(v)}
          options={[
            { value: "NONE", label: "Select counter", disabled: true },
            ...countersForBranch.map((c) => ({
              value: c._id,
              label: c.code ? `${c.name} (${c.code})` : c.name,
            })),
          ]}
          placeholder="Select counter"
          disabled={!branchId}
          hint={!branchId ? "Select a branch first" : undefined}
        />
      </div>

      {loading && <Loading />}
      {!loading && error && <EmptyState title="Error" message={error} />}

      {/* Active queue card */}
      {!loading && !error && (
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Active queue</div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="font-semibold text-gray-200">
              {active ? `Queue is ${active.status}` : "No open queue for today"}
            </div>

            {active?.lastCalledAt && (
              <span className="text-sm text-gray-400">
                • Last called: {new Date(active.lastCalledAt).toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onOpenQueue} disabled={!counterId || isQueueOpen || loading}>
              {isQueueOpen ? "Queue is Open" : "Open Queue"}
            </Button>

            <Button
              variant="secondary"
              onClick={onAskCloseQueue}
              disabled={!counterId || !isQueueOpen || loading}
            >
              Close Queue
            </Button>

            <Button onClick={onCallNext} disabled={!counterId || !isQueueOpen || loading}>
              Call Next
            </Button>
          </div>
        </div>
      )}

      {/* Last token */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500">Last token</div>
        <div className="mt-1 text-xl font-bold text-gray-200">{tokenLabel(lastToken)}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => tokenId && dispatch(markServing(tokenId))}
            disabled={!tokenId || lastToken?.status !== "CALLING" || loading}
          >
            Serving
          </Button>

          <Button
            variant="secondary"
            onClick={() => tokenId && dispatch(markSkipped(tokenId))}
            disabled={!tokenId || lastToken?.status !== "CALLING" || loading}
          >
            Skipped
          </Button>

          <Button
            variant="secondary"
            onClick={() => tokenId && dispatch(markCancelled(tokenId))}
            disabled={!tokenId || !["CALLING", "SKIPPED"].includes(lastToken?.status ?? "") || loading}
          >
            Cancelled
          </Button>

          <Button
            onClick={() => tokenId && dispatch(markCompleted(tokenId))}
            disabled={!tokenId || lastToken?.status !== "SERVING" || loading}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Close confirm */}
      <ConfirmDialog
        open={confirmCloseOpen}
        title="Close Queue"
        message="Close today’s queue for this branch? This action will stop calling new tokens."
        confirmText={closing ? "Closing..." : "Close Queue"}
        cancelText="Cancel"
        onClose={() => {
          if (closing) return;
          setConfirmCloseOpen(false);
        }}
        onConfirm={onConfirmCloseQueue}
      />
    </div>
  );
}
