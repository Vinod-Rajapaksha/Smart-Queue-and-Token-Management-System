import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export default function Select({
  label,
  error,
  hint,
  className = "",
  id,
  children,
  ...rest
}: Props) {
  const selectId = id ?? rest.name ?? undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* subtle glow */}
        <div
          className={[
            "pointer-events-none absolute inset-0 rounded-xl blur-md opacity-30",
            error
              ? "bg-red-500/30"
              : "bg-gradient-to-r from-cyan-500/30 to-blue-500/30",
          ].join(" ")}
        />

        <select
          id={selectId}
          {...rest}
          className={[
            "relative w-full appearance-none rounded-xl px-4 py-2.5 text-sm text-white",
            "bg-gray-900/40 backdrop-blur-md",
            "border outline-none transition-all",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
              : "border-gray-700/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "pr-10",
            className,
          ].join(" ")}
        >
          {children}
        </select>

        {/* dropdown icon */}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
