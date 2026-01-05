import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold " +
  "transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-r from-cyan-500 to-blue-500 " +
    "hover:from-cyan-400 hover:to-blue-400 " +
    "focus:ring-cyan-500/40 " +
    "disabled:opacity-50",

  secondary:
    "text-gray-100 bg-gray-900/40 border border-gray-700/60 backdrop-blur-md " +
    "hover:bg-white/5 focus:ring-gray-500/30 " +
    "disabled:opacity-50",

  danger:
    "text-white bg-red-600/90 hover:bg-red-600 " +
    "focus:ring-red-500/40 " +
    "disabled:opacity-50",

  ghost:
    "text-gray-300 bg-transparent " +
    "hover:bg-white/5 hover:text-white " +
    "focus:ring-gray-500/30 " +
    "disabled:text-gray-500",
};

export default function Button({
  className = "",
  variant = "primary",
  loading,
  disabled,
  children,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[base, variants[variant], className].join(" ")}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
