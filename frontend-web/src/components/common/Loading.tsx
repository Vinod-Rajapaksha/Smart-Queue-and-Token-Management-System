import { Loader2 } from "lucide-react";

type Props = {
  label?: string;
};

export default function Loading({ label = "Loading..." }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 rounded-xl border border-gray-700/50 bg-gray-900/40 px-4 py-3 text-sm text-gray-300"
    >
      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
      <span>{label}</span>
    </div>
  );
}
