import type { HTMLAttributes } from "react";

type Variant = "default" | "success" | "warning" | "danger";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  default:
    "text-gray-200 border-gray-700/60 bg-gray-900/40",

  success:
    "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",

  warning:
    "text-yellow-300 border-yellow-500/40 bg-yellow-500/10",

  danger:
    "text-red-300 border-red-500/40 bg-red-500/10",
};

export default function Badge({
  variant = "default",
  className = "",
  ...rest
}: Props) {
  return (
    <span
      {...rest}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
        "backdrop-blur-md shadow-sm",
        variants[variant],
        className,
      ].join(" ")}
    />
  );
}
