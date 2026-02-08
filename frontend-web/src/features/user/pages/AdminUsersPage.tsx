import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  createUser,
  deleteUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from "../../../store/slices/user.slice";
import { fetchBranches } from "../../../store/slices/branch.slice";
import type { CreateUserInput, UpdateUserInput, UserListItem } from "../types";
import UserTable, { type UserRow } from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Select from "../../../components/ui/Select";

type RoleFilter = "ALL" | "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";
type BranchFilter = "ALL" | string;

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.user);
  const branches = useAppSelector((s) => s.branch.items);
  const currentUserId = useAppSelector((s) => s.auth.user?._id ?? null);
  const currentUserRole = useAppSelector((s) => s.auth.user?.role ?? null);

  const canFilterByBranch = currentUserRole !== "MANAGER";

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selected, setSelected] = useState<UserListItem | null>(null);

  const [params, setParams] = useSearchParams();

  const roleParam = params.get("role");
  const roleFilter: RoleFilter = useMemo(() => {
    const roleFromUrl = (roleParam as RoleFilter | null) ?? "ALL";
    const valid: RoleFilter[] = ["ALL", "ADMIN", "MANAGER", "STAFF", "CUSTOMER"];
    return valid.includes(roleFromUrl) ? roleFromUrl : "ALL";
  }, [roleParam]);

  const branchParam = params.get("branchId");
  const branchFilter: BranchFilter = useMemo(() => {
    return branchParam ? branchParam : "ALL";
  }, [branchParam]);

  const lockBranchFilter = roleFilter === "CUSTOMER";

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchBranches());
  }, [dispatch]);

  const setRole = (role: RoleFilter) => {
    const next = new URLSearchParams(params);

    if (role === "ALL") next.delete("role");
    else next.set("role", role);

    setParams(next, { replace: true });
  };

  const setBranch = (branchId: BranchFilter) => {
    const next = new URLSearchParams(params);

    if (branchId === "ALL") next.delete("branchId");
    else next.set("branchId", branchId);

    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (!lockBranchFilter) return;

    const next = new URLSearchParams(params);
    next.delete("branchId");

    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [lockBranchFilter, params, setParams]);

  const branchOptions = useMemo(() => {
    return [
      { label: "All branches", value: "ALL" },
      ...branches.map((b) => ({
        label: `${b.name} (${b.code})`,
        value: b._id,
      })),
    ];
  }, [branches]);

  const filteredItems = useMemo(() => {
    let list = items;

    const effectiveBranchFilter: BranchFilter =
      currentUserRole === "MANAGER" || roleFilter === "CUSTOMER"
        ? "ALL"
        : branchFilter;

    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (effectiveBranchFilter !== "ALL") {
      list = list.filter((u) => {
        if (!u.branch) return false;

        if (typeof u.branch === "string") return u.branch === effectiveBranchFilter;

        if (typeof u.branch === "object" && u.branch !== null) {
          return u.branch._id === effectiveBranchFilter;
        }

        return false;
      });
    }

    return list;
  }, [items, roleFilter, branchFilter, currentUserRole]);

  const rows: UserRow[] = useMemo(() => {
    return filteredItems.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      telephone: u.telephone,
      role: u.role,
      isActive: u.isActive,
      branch:
        u.branch && typeof u.branch === "object"
          ? `${u.branch.name} (${u.branch.code})`
          : u.branch ?? "-",
    }));
  }, [filteredItems]);

  const activeCount = useMemo(() => items.filter((u) => u.isActive).length, [items]);

  function openEdit(userId: string) {
    const user = items.find((x) => x.id === userId) ?? null;
    setSelected(user);
    setEditOpen(true);
  }

  function openReset(userId: string) {
    const user = items.find((x) => x.id === userId) ?? null;
    setSelected(user);
    setResetOpen(true);
  }

  async function handleCreate(payload: CreateUserInput | UpdateUserInput) {
    await dispatch(createUser(payload as CreateUserInput));
    setCreateOpen(false);
    dispatch(fetchUsers());
  }

  async function handleEdit(payload: CreateUserInput | UpdateUserInput) {
    if (!selected) return;
    await dispatch(updateUser({ userId: selected.id, updates: payload as UpdateUserInput }));
    setEditOpen(false);
    setSelected(null);
    dispatch(fetchUsers());
  }

  async function handleResetPassword(password: string) {
    if (!selected) return;
    await dispatch(resetUserPassword({ userId: selected.id, password }));
    setResetOpen(false);
    setSelected(null);
  }

  async function handleDeleteUser(userId: string) {
    await dispatch(deleteUser({ userId }));
    dispatch(fetchUsers());
  }

  return (
    <div className="space-y-6 text-white/90">
      <PageHeader
        title="Users"
        subtitle={
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)}>+ Add User</Button>

            <button
              className={[
                "px-3 py-2 rounded-lg transition",
                "bg-gray-900/40 backdrop-blur-md",
                "border border-white/10 text-white/80",
                "hover:bg-white/10",
              ].join(" ")}
              onClick={() => dispatch(fetchUsers())}
              type="button"
            >
              Refresh
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <RoleFilterBtn label="All" active={roleFilter === "ALL"} onClick={() => setRole("ALL")} />

          {currentUserRole !== "MANAGER" && (
            <>
              <RoleFilterBtn
                label="Admins"
                active={roleFilter === "ADMIN"}
                onClick={() => setRole("ADMIN")}
              />
              <RoleFilterBtn
                label="Managers"
                active={roleFilter === "MANAGER"}
                onClick={() => setRole("MANAGER")}
              />
            </>
          )}

          <RoleFilterBtn label="Staff" active={roleFilter === "STAFF"} onClick={() => setRole("STAFF")} />
          <RoleFilterBtn
            label="Customers"
            active={roleFilter === "CUSTOMER"}
            onClick={() => setRole("CUSTOMER")}
          />
        </div>

        {canFilterByBranch ? (
          <div className="min-w-[260px]">
            <div
              className={lockBranchFilter ? "opacity-50 pointer-events-none select-none" : ""}
              title={lockBranchFilter ? "Customers don't belong to a branch" : ""}
            >
              <Select
                label="Branch"
                value={lockBranchFilter ? "ALL" : branchFilter}
                options={branchOptions}
                onChange={(v) => setBranch(v as BranchFilter)}
                placeholder="All branches"
              />
            </div>

            {lockBranchFilter ? (
              <p className="mt-1 text-xs text-white/50">
                Customers are not assigned to a branch.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {loading && <p className="text-white/70">Loading users...</p>}
      {error && <p className="text-red-300">{error}</p>}

      {!loading && !error && (
        <UserTable
          rows={rows}
          onEdit={openEdit}
          onResetPassword={openReset}
          onToggleActive={(userId, nextActive) =>
            dispatch(updateUserStatus({ userId, isActive: nextActive }))
          }
          onDelete={handleDeleteUser}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}

      <UserFormModal
        open={createOpen}
        mode="create"
        title="Create User"
        branches={branches}
        initial={null}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <UserFormModal
        open={editOpen}
        mode="edit"
        title="Edit User"
        branches={branches}
        initial={selected}
        onClose={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        onSubmit={handleEdit}
      />

      <ResetPasswordModal
        open={resetOpen}
        userName={selected?.name}
        onClose={() => {
          setResetOpen(false);
          setSelected(null);
        }}
        onSubmit={handleResetPassword}
      />
    </div>
  );
}

function RoleFilterBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm border transition",
        active
          ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-200"
          : "bg-gray-900/40 backdrop-blur-md border-white/10 text-white/70 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
