import type { ReactNode } from "react";
import QueueStatusBadge from "./QueueStatusBadge";
import type { QueueDto } from "../types";

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

function branchLabel(branch: QueueDto["branch"]) {
  if (!branch) return "-";
  return typeof branch === "string" ? branch : `${branch.name}${branch.code ? ` (${branch.code})` : ""}`;
}

type Props = {
  queue: QueueDto | null;
  title?: string;
  right?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function QueueCard({
  queue,
  title = "Active Queue",
  right,
  footer,
  className = "",
}: Props) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-transparent p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">{title}</div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold text-gray-200">
              {queue ? branchLabel(queue.branch) : "No queue found for today"}
            </div>

            <QueueStatusBadge status={queue?.status ?? "CLOSED"} />
          </div>
        </div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Current Token</div>
          <div className="mt-1 text-sm font-medium text-gray-200">
            {queue?.currentToken ?? "-"}
          </div>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Last Called</div>
          <div className="mt-1 text-sm font-medium text-gray-200">
            {fmtDate(queue?.lastCalledAt ?? null)}
          </div>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Opened At</div>
          <div className="mt-1 text-sm font-medium text-gray-200">
            {fmtDate(queue?.openedAt ?? null)}
          </div>
        </div>
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
