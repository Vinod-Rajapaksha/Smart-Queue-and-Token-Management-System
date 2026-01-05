import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export default function Input({
  label,
  error,
  hint,
  className = "",
  id,
  ...rest
}: Props) {
  const inputId = id ?? rest.name ?? undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
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

        <input
          id={inputId}
          {...rest}
          className={[
            "relative w-full rounded-xl px-4 py-2.5 text-sm text-white",
            "bg-gray-900/40 backdrop-blur-md",
            "border outline-none transition-all",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
              : "border-gray-700/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30",
            "placeholder:text-gray-500",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          ].join(" ")}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
