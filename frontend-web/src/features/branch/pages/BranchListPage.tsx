import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  createBranch,
  deactivateBranch,
  fetchBranches,
  updateBranch,
  activateBranch,
} from "../../../store/slices/branch.slice";

import PageHeader from "../../../components/common/PageHeader";
import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import BranchTable from "../components/BranchTable";
import BranchForm from "../components/BranchForm";
import type { Branch, CreateBranchPayload, UpdateBranchPayload } from "../types";

export default function BranchListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, loading, error } = useAppSelector((s) => s.branch);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeactivate, setToDeactivate] = useState<Branch | null>(null);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    dispatch(fetchBranches(undefined));
  }, [dispatch]);

  const activeCount = useMemo(
    () => items.filter((b: Branch) => b.isActive).length,
    [items]
  );

  const closeCreate = () => setCreateOpen(false);

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const onCreate = async (payload: CreateBranchPayload) => {
    try {
      setCreating(true);
      await dispatch(createBranch(payload)).unwrap();
      closeCreate();
    } finally {
      setCreating(false);
    }
  };

  const onEdit = async (payload: UpdateBranchPayload) => {
    if (!editing) return;
    try {
      setUpdating(true);
      await dispatch(updateBranch({ id: editing._id, payload })).unwrap();
      closeEdit();
    } finally {
      setUpdating(false);
    }
  };

  const onAskDeactivate = (branch: Branch) => {
    setToDeactivate(branch);
    setConfirmOpen(true);
  };

  const onConfirmDeactivate = async () => {
    if (!toDeactivate) return;

    try {
      setDeactivating(true);
      await dispatch(deactivateBranch(toDeactivate._id)).unwrap();
      setConfirmOpen(false);
      setToDeactivate(null);
    } finally {
      setDeactivating(false);
    }
  };

  const onActivate = async (branch: Branch) => {
    await dispatch(activateBranch(branch._id)).unwrap();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
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
          <Button onClick={() => setCreateOpen(true)}>
            + New Branch
          </Button>
        }
      />

      {loading && <Loading />}

      {!loading && error && <EmptyState title="Error" message={error} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="No branches yet"
          message="Create your first branch to get started."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <BranchTable
          items={items}
          onView={(id) => navigate(`/admin/branches/${id}`)}
          onEdit={(b) => {
            setEditing(b);
            setEditOpen(true);
          }}
          onDeactivate={onAskDeactivate}
          onActivate={onActivate}
        />
      )}

      {/* Create */}
      <Modal open={createOpen} title="Create Branch" onClose={closeCreate}>
        <BranchForm
          mode="create"
          submitting={creating}
          onCancel={closeCreate}
          onSubmit={onCreate}
        />
      </Modal>

      {/* Edit */}
      <Modal open={editOpen} title="Edit Branch" onClose={closeEdit}>
        {editing ? (
          <BranchForm
            mode="edit"
            initial={editing}
            submitting={updating}
            onCancel={closeEdit}
            onSubmit={onEdit}
          />
        ) : (
          <EmptyState title="No branch selected" message="Select a branch to edit." />
        )}
      </Modal>

      {/* Confirm Deactivate */}
      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate Branch"
        message={`Deactivate "${toDeactivate?.name}"? Confirm Deactivation.`}
        confirmText={deactivating ? "Deactivating..." : "Deactivate"}
        cancelText="Cancel"
        onClose={() => {
          if (deactivating) return;
          setConfirmOpen(false);
          setToDeactivate(null);
        }}
        onConfirm={onConfirmDeactivate}
      />
    </div>
  );
}
