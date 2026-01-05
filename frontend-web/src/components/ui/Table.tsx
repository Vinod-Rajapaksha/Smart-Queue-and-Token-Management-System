import type { ReactNode } from "react";

type Column<T> = {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyText?: string;
  caption?: string;
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyText = "No data",
  caption,
}: Props<T>) {
  if (!data.length) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%)]" />
        <div className="relative flex flex-col items-center justify-center gap-2 text-center">
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
          <p className="mt-3 text-sm text-gray-300">{emptyText}</p>
          <p className="text-xs text-gray-500">Try adjusting filters or search.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 shadow-2xl">
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_50%)]" />

      <div className="relative overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          {caption ? (
            <caption className="px-6 py-4 text-left text-xs text-gray-400">
              {caption}
            </caption>
          ) : null}

          <thead className="sticky top-0 z-10 bg-gray-950/40 backdrop-blur-xl">
            <tr>
              {columns.map((c, idx) => (
                <th
                  key={idx}
                  className={[
                    "px-6 py-4 font-semibold text-gray-200",
                    "border-b border-gray-700/50",
                    "whitespace-nowrap",
                    c.className ?? "",
                  ].join(" ")}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700/40">
            {data.map((row, rowIdx) => (
              <tr
                key={String(row[keyField])}
                className={[
                  "transition-colors",
                  rowIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                  "hover:bg-cyan-500/10",
                ].join(" ")}
              >
                {columns.map((c, idx) => (
                  <td
                    key={idx}
                    className={[
                      "px-6 py-4 text-gray-100 align-middle",
                      "whitespace-nowrap",
                      idx === 0 ? "font-medium" : "",
                    ].join(" ")}
                  >
                    {c.cell
                      ? c.cell(row)
                      : c.accessor
                      ? String(row[c.accessor] ?? "")
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="relative border-t border-gray-700/50 px-6 py-3">
        <p className="text-xs text-gray-500">
          Showing <span className="text-gray-300">{data.length}</span> record
          {data.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
