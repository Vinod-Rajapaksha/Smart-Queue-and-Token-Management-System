import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchBranches } from "../../../store/slices/branch.slice";
import { fetchCounters } from "../../../store/slices/counter.slice";
import { fetchTokens, updateTokenStatus } from "../../../store/slices/token.slice";

import PageHeader from "../../../components/common/PageHeader";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";

import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

import TokenTable from "../components/TokenTable";
import type { Branch } from "../../branch/types";
import type { CounterDto } from "../../counter/types";
import type { TokenStatus } from "../types";

const STATUS_OPTIONS: { value: string; label: string; disabled?: boolean }[] = [
  { value: "WAITING", label: "WAITING" },
  { value: "CALLING", label: "CALLING" },
  { value: "SERVING", label: "SERVING" },
  { value: "SKIPPED", label: "SKIPPED" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

export default function TokenListPage() {
  const dispatch = useAppDispatch();

  const branchState = useAppSelector((s) => s.branch);
  const counterState = useAppSelector((s) => s.counter);
  const tokenState = useAppSelector((s) => s.token);

  const [branchId, setBranchId] = useState<string>("");
  const [counterId, setCounterId] = useState<string>("");
  const [status, setStatus] = useState<TokenStatus | "">("");

  useEffect(() => {
    dispatch(fetchBranches(undefined));
    dispatch(fetchCounters());
  }, [dispatch]);

  const branches = useMemo(() => {
    return (branchState.items ?? []) as Branch[];
  }, [branchState.items]);

  const countersForBranch = useMemo(() => {
    if (!branchId) return [];
    const counters = (counterState.items ?? []) as CounterDto[];

    return counters.filter((c) => {
      const cb = typeof c.branch === "string" ? c.branch : c.branch?._id;
      return cb === branchId;
    });
  }, [counterState.items, branchId]);

  const canSearch = Boolean(branchId) && Boolean(counterId);

  const onSearch = () => {
    if (!canSearch) return;
    dispatch(fetchTokens({ branchId, counterId, status }));
  };

  useEffect(() => {
    if (!counterId) return;
    onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterId, status]);

  const onSetStatus = async (id: string, next: TokenStatus) => {
    await dispatch(updateTokenStatus({ tokenId: id, status: next })).unwrap();
    onSearch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tokens"
        subtitle="View tokens by branch/counter and update status."
        right={
          <Button onClick={onSearch} disabled={!canSearch || tokenState.loading}>
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="Branch"
          value={branchId}
          onChange={(v) => {
            setBranchId(v);
            setCounterId("");
          }}
          options={[
            { value: "NONE", label: "Select branch", disabled: true },
            ...branches.map((b) => ({ value: b._id, label: b.name })),
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

        <Select
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as TokenStatus | "")}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          disabled={!counterId}
          hint={!counterId ? "Select a counter first" : undefined}
        />
      </div>

      {tokenState.loading && <Loading />}

      {!tokenState.loading && tokenState.error && (
        <EmptyState title="Error" message={tokenState.error} />
      )}

      {!tokenState.loading && !tokenState.error && (
        <TokenTable items={tokenState.items} loading={tokenState.loading} onSetStatus={onSetStatus} />
      )}
    </div>
  );
}
