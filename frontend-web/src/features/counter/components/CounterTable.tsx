import type { ReactNode } from "react";
import { Pencil, Trash2, Ban, CheckCircle } from "lucide-react";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import type { CounterDto } from "../types";

type Props = {
  items: CounterDto[];
  onEdit: (c: CounterDto) => void;
  onDelete: (c: CounterDto) => void;
  onToggleActive: (c: CounterDto) => void | Promise<void>;
};

export default function CounterTable({
  items,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const columns: { header: string; cell: (row: CounterDto) => ReactNode; className?: string }[] =
    [
      {
        header: "Counter",
        cell: (c) => (
          <div className="flex flex-col">
            <span className="font-medium text-white">{c.name}</span>
            <span className="text-xs text-gray-400">
              {c.code ? `Code: ${c.code}` : "No code"}
            </span>
          </div>
        ),
      },
      {
        header: "Branch",
        className: "w-[220px]",
        cell: (c) => (
          <div className="flex flex-col">
            <span className="font-medium text-white">{c.branch?.name ?? "-"}</span>
            <span className="text-xs text-gray-400">{c.branch?.code ?? "-"}</span>
          </div>
        ),
      },
      {
        header: "Services",
        cell: (c) => (
          <div className="flex flex-wrap gap-2">
            {(c.services ?? []).length ? (
              c.services.slice(0, 3).map((s) => (
                <Badge key={s} variant="default">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-400">—</span>
            )}
            {(c.services ?? []).length > 3 && (
              <span className="text-xs text-gray-400">
                +{(c.services ?? []).length - 3} more
              </span>
            )}
          </div>
        ),
      },
      {
        header: "Status",
        className: "w-[140px]",
        cell: (c) =>
          c.isActive ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="danger">Inactive</Badge>
          ),
      },
      {
        header: "Actions",
        className: "w-[220px] text-center",
        cell: (c) => (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            <Button
              variant="secondary"
              onClick={() => onEdit(c)}
              className="px-3"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>

            {c.isActive ? (
              <Button
                variant="danger"
                onClick={() => void onToggleActive(c)}
                className="px-3"
                title="Deactivate"
              >
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Deactivate</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => void onToggleActive(c)}
                className="px-5"
                title="Activate"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Activate</span>
              </Button>
            )}

            <Button
              variant="danger"
              onClick={() => onDelete(c)}
              className="px-3"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        ),
      },
    ];

  return (
    <Table
      caption="Manage counters and their status"
      columns={columns}
      data={items}
      keyField="_id"
      emptyText="No counters yet. Create your first counter to get started."
    />
  );
}
