import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel wrapper */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 shadow-2xl">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

          {/* Soft glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_50%)]" />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-4 border-b border-gray-700/50 px-6 py-4">
            <div className="text-base font-semibold text-white">
              {title ?? "Modal"}
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700/60 bg-gray-900/40 text-gray-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Close"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 text-gray-100">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
