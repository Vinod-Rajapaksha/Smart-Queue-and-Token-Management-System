import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import type { TokenDto, TokenStatus } from "../types";
import TokenStatusPill from "./TokenStatusPill";

type Props = {
  items: TokenDto[];
  loading?: boolean;
  onSetStatus: (id: string, status: TokenStatus) => void;
};

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

export default function TokenTable({ items, loading, onSetStatus }: Props) {
  return (
    <Table<TokenDto>
      keyField="_id"
      data={items}
      columns={[
        {
          header: "Token",
          cell: (t) => <div className="font-semibold">#{t.tokenNumber}</div>,
        },
        {
          header: "Status",
          cell: (t) => <TokenStatusPill status={t.status} />,
        },
        {
          header: "Created",
          cell: (t) => <span className="text-gray-400">{fmtDate(t.createdAt)}</span>,
        },
        {
          header: "Timeline",
          cell: (t) => (
            <div className="space-y-1 text-xs text-gray-400">
              <div>Called: {fmtDate(t.calledAt)}</div>
              <div>Served: {fmtDate(t.servedAt)}</div>
              <div>Done: {fmtDate(t.completedAt)}</div>
            </div>
          ),
        },
        {
          header: "Actions",
          cell: (t) => (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onSetStatus(t._id, "WAITING")}
                disabled={loading || t.status !== "SKIPPED"}
              >
                WAITING
              </Button>
            </div>
          ),
        },
      ]}
      emptyText="No tokens found for selected filters."
    />
  );
}
