import { Eye, Pencil, Ban, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import type { Branch } from "../types";

type Props = {
  items: Branch[];
  onView: (id: string) => void;
  onEdit: (branch: Branch) => void;
  onDeactivate: (branch: Branch) => void;
  onActivate: (branch: Branch) => void | Promise<void>;
};

export default function BranchTable({
  items,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
}: Props) {
  return (
    <Table
      caption="Manage branches and their status"
      columns={[
        {
          header: "Name",
          cell: (row: Branch) => (
            <div className="flex flex-col">
              <span className="font-medium text-white">{row.name}</span>
              <span className="text-xs text-gray-400">{row.city ?? "-"}</span>
            </div>
          ),
        },
        { header: "Code", accessor: "code", className: "w-[140px]" },
        { header: "City", accessor: "city", className: "w-[160px]" },
        {
          header: "Status",
          className: "w-[140px]",
          cell: (row: Branch) =>
            row.isActive ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="danger">Inactive</Badge>
            ),
        },
        {
          header: "Actions",
          className: "w-[180px] text-right",
          cell: (row: Branch) => (
            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
              <Button
                variant="ghost"
                onClick={() => onView(row._id)}
                className="px-3"
                title="View"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => onEdit(row)}
                className="px-3"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              {row.isActive ? (
                <Button
                  variant="danger"
                  onClick={() => onDeactivate(row)}
                  className="px-3"
                  title="Deactivate"
                >
                  <Ban className="h-4 w-4" />
                  <span className="hidden sm:inline">Deactivate</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => void onActivate(row)}
                  className="px-5"
                  title="Activate"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Activate</span>
                </Button>
              )}

            </div>
          ),
        },
      ]}
      data={items}
      keyField="_id"
      emptyText="No branches yet. Create your first branch to get started."
    />
  );
}
