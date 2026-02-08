import Badge from "../../../components/ui/Badge";
import { ROLES } from "../../../types/enums";
import { Pencil, KeyRound, Trash2 ,Ban, } from "lucide-react";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Table from "../../../components/ui/Table";
import { useState } from "react";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  telephone: string;
  role: ROLES;
  isActive: boolean;
  branch: string;
};

type Props = {
  rows: UserRow[];
  onToggleActive: (userId: string, nextActive: boolean) => void;
  onEdit: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onDelete: (userId: string) => void; 
  currentUserId: string | null;
  currentUserRole: ROLES | null;
};

export default function UserTable({
  rows,
  onToggleActive,
  onEdit,
  onResetPassword,
  onDelete,
  currentUserId,
  currentUserRole,
}: Props) {
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string;
    nextActive: boolean;
  }>({
    open: false,
    userId: null,
    userName: "",
    nextActive: false,
  });

  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string;
  }>({
    open: false,
    userId: null,
    userName: "",
  });

  const handleToggleClick = (
    userId: string,
    userName: string,
    currentActive: boolean
  ) => {
    const nextActive = !currentActive;

    if (currentActive) {
      setConfirmDialog({
        open: true,
        userId,
        userName,
        nextActive,
      });
    } else {
      onToggleActive(userId, nextActive);
    }
  };

  const handleConfirmToggle = () => {
    if (confirmDialog.userId) {
      onToggleActive(confirmDialog.userId, confirmDialog.nextActive);
      setConfirmDialog({
        open: false,
        userId: null,
        userName: "",
        nextActive: false,
        
      });
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      userId: null,
      userName: "",
      nextActive: false,
    });
  };

  
  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteDialog({ open: true, userId, userName });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.userId) return;
    onDelete(deleteDialog.userId);
    setDeleteDialog({ open: false, userId: null, userName: "" });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, userId: null, userName: "" });
  };

  const roleVariant = (
    role: ROLES
  ): "danger" | "warning" | "success" | "default" => {
    switch (role) {
      case ROLES.ADMIN:
        return "danger";
      case ROLES.MANAGER:
        return "warning";
      case ROLES.STAFF:
        return "success";
      case ROLES.CUSTOMER:
      default:
        return "default";
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as const,
    },
    {
      header: "Email",
      accessor: "email" as const,
    },
    {
      header: "Phone",
      accessor: "telephone" as const,
    },
    {
      header: "Role",
      cell: (row: UserRow) => <Badge variant={roleVariant(row.role)}>{row.role}</Badge>,
    },
    {
      header: "Branch",
      accessor: "branch" as const,
    },
    {
      header: "Status",
      cell: (row: UserRow) => (
        <span
          className={[
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
            row.isActive
              ? "bg-emerald-500/15 text-emerald-100 border-emerald-500/25"
              : "bg-red-500/15 text-red-100 border-red-500/25",
          ].join(" ")}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row: UserRow) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => onEdit(row.id)}
            type="button"
            className="px-3 py-1.5 text-sm"
          >
            <Pencil size={14} />
            Edit
          </Button>

          <Button
            variant="secondary"
            onClick={() => onResetPassword(row.id)}
            type="button"
            className="px-3 py-1.5 text-sm"
          >
            <KeyRound size={14} />
            Reset
          </Button>

          <Button
            variant={row.isActive ? "danger" : "secondary"}
            onClick={() => handleToggleClick(row.id, row.name, row.isActive)}
            type="button"
            className="px-3 py-1.5 text-sm"
          >
            <Ban size={14} />
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>

          
          {row.id !== currentUserId && (
    
            (currentUserRole === ROLES.ADMIN &&
              row.role !== ROLES.ADMIN) ||

    
            (currentUserRole === ROLES.MANAGER &&
              (row.role === ROLES.STAFF || row.role === ROLES.CUSTOMER))
            ) && (
              <Button
                variant="danger"
                onClick={() => handleDeleteClick(row.id, row.name)}
                type="button"
                className="px-3 py-1.5 text-sm"
              >
                <Trash2 size={14} />
                  Delete
                </Button>
          )}
          
        </div>
      ),
      className: "min-w-[300px]",
    },
  ];

  return (
    <>
      <Table<UserRow>
        columns={columns}
        data={rows}
        keyField="id"
        emptyText="No users found"
        caption="User Management"
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${confirmDialog.userName}? This will prevent them from accessing the system.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        onConfirm={handleConfirmToggle}
        onClose={handleCloseDialog}
      />

      
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteDialog.userName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="default"
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteDialog}
      />
    </>
  );
}
