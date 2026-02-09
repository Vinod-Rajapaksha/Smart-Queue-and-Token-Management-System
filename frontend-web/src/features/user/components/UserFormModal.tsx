import { useEffect, useMemo, useState } from "react";
import type { Branch } from "../../branch/types";
import { branchApi } from "../../branch/api/branch.api";
import type { CreateUserInput, UpdateUserInput, UserListItem } from "../types";
import UserForm from "./UserForm";
import { useAppSelector } from "../../../store/hooks";
import Modal from "../../../components/ui/Modal";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  branches?: Branch[];
  initial?: UserListItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserInput | UpdateUserInput) => Promise<void> | void;
};

export default function UserFormModal({
  open,
  mode,
  title,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [activeBranches, setActiveBranches] = useState<Branch[]>([]);

  const currentUserRole = useAppSelector((s) => s.auth.user?.role ?? null);
  const currentUserBranchRaw = useAppSelector((s) => s.auth.user?.branch ?? null);

  const currentUserBranchId = useMemo(() => {
    return normalizeBranch(currentUserBranchRaw);
  }, [currentUserBranchRaw]);

  useEffect(() => {
    if (!open) return;

    branchApi
      .getBranches({ isActive: "true" })
      .then(setActiveBranches)
      .catch(() => setActiveBranches([]));
  }, [open]);

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-white/60">
          {mode === "create" ? "Create New User." : "You are Updating User Details."}
        </div>
        
        <UserForm
          mode={mode}
          branches={activeBranches}
          initial={initial}
          onCancel={onClose}
          onSubmit={onSubmit}
          currentUserRole={currentUserRole}
          currentUserBranchId={currentUserBranchId}
        />
      </div>
    </Modal>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBranch(branch: unknown): string | null {
  if (!branch) return null;
  if (typeof branch === "string") return branch;

  if (isRecord(branch)) {
    const id = branch["_id"];
    if (typeof id === "string") return id;
  }

  return null;
}
