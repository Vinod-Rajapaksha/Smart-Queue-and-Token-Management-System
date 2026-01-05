import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

import {
  fetchCounters,
  createCounter,
  updateCounter,
  deleteCounter,
  changeCounterStatus,
} from "../../../store/slices/counter.slice";

import { fetchBranches } from "../../../store/slices/branch.slice";

import PageHeader from "../../../components/common/PageHeader";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

import CounterTable from "../components/CounterTable";
import CounterForm from "../components/CounterForm";
import type { CounterDto } from "../types";

export default function CounterPage() {
  const dispatch = useAppDispatch();

  const { items, loading, error } = useAppSelector((s) => s.counter);
  const branches = useAppSelector((s) => s.branch.items);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CounterDto | null>(null);
  const [toDelete, setToDelete] = useState<CounterDto | null>(null);

  useEffect(() => {
    dispatch(fetchCounters());
    dispatch(fetchBranches(undefined));
  }, [dispatch]);

  const branchOptions = useMemo(
    () => branches.map((b) => ({ label: b.name, value: b._id })),
    [branches]
  );

  const canCreate = branchOptions.length > 0;

  const activeCount = useMemo(
    () => items.filter((c: CounterDto) => c.isActive).length,
    [items]
  );

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (c: CounterDto) => {
    setEditing(c);
    setOpenForm(true);
  };

  const onSubmit = async (values: {
    branchId: string;
    name: string;
    code: string | null;
    services: string[];
    isActive: boolean;
  }) => {
    if (editing?._id) {
      const payload = {
        name: values.name,
        code: values.code,
        services: values.services,
        isActive: values.isActive,
      };
      await dispatch(updateCounter({ id: editing._id, payload })).unwrap();
    } else {
      await dispatch(createCounter(values)).unwrap();
    }
    setOpenForm(false);
    setEditing(null);
  };

  const onToggleActive = async (c: CounterDto) => {
    await dispatch(
      changeCounterStatus({
        id: c._id,
        payload: { isActive: !c.isActive },
      })
    ).unwrap();
  };

  const onConfirmDelete = async () => {
    if (!toDelete?._id) return;
    await dispatch(deleteCounter(toDelete._id)).unwrap();
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counters"
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400">
              Total: <span className="text-gray-200">{items.length}</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">
              Active: <span className="text-gray-200">{activeCount}</span>
            </span>
            <Badge
              variant={activeCount === items.length ? "success" : "warning"}
              className="ml-2"
            >
              {activeCount}/{items.length} Active
            </Badge>
          </div>
        }
        right={
          <Button onClick={onCreate} disabled={!canCreate}>
            + New Counter
          </Button>
        }
      />

      {loading && <Loading />}

      {!loading && error && (
        <EmptyState
          title="Something went wrong"
          message={error ?? "Unknown error"}
          action={<Button onClick={() => dispatch(fetchCounters())}>Retry</Button>}
        />
      )}

      {!loading && !error && (
        <>
          {!canCreate && (
            <div className="rounded-xl border border-gray-700/60 bg-gray-900/40 p-4 text-sm text-gray-300">
              Branch list not loaded yet. Please create a branch first (or reload), then
              you can add counters.
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState
              title="No counters yet"
              message="Create your first counter to start managing service points."
              action={
                <Button onClick={onCreate} disabled={!canCreate}>
                  + New Counter
                </Button>
              }
            />
          ) : (
            <CounterTable
              items={items}
              onEdit={onEdit}
              onDelete={(c) => setToDelete(c)}
              onToggleActive={onToggleActive}
            />
          )}
        </>
      )}

      <Modal
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        title={editing ? "Edit Counter" : "Create Counter"}
      >
        <CounterForm
          initial={editing}
          branchOptions={branchOptions}
          submitting={loading}
          onCancel={() => {
            setOpenForm(false);
            setEditing(null);
          }}
          onSubmit={onSubmit}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete counter"
        message={`Delete "${toDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => setToDelete(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
