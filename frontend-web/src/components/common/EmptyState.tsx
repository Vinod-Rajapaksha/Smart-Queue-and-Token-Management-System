import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type Props = {
  title?: string;
  message?: string;
  action?: ReactNode;
};

export default function EmptyState({
  title = "Nothing here yet",
  message = "No data available.",
  action,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-10 text-center shadow-2xl">
      {/* Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />

      <div className="relative flex flex-col items-center gap-3">
        <div className="rounded-xl border border-gray-700/60 bg-gray-900/40 p-3">
          <Inbox className="h-6 w-6 text-cyan-400" />
        </div>

        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{message}</p>

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
