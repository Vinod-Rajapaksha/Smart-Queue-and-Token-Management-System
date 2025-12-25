import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LogOut } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const danger = variant === "danger";

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay */}
      <div
        className=" absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal wrapper */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className=" w-full max-w-md rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={[
                "mt-0.5 rounded-xl p-2",
                danger ? "bg-red-500/10 text-red-400": "bg-cyan-500/10 text-cyan-400",
              ].join(" ")}
            >
              {danger ? (
                <LogOut className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <p className="mt-1 text-sm text-gray-300">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800/70 text-gray-200 transition cursor-pointer"
              type="button"
            >
              {cancelText}
            </button>

            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={[
                "px-4 py-2 rounded-xl font-medium transition cursor-pointer",
                danger ? "border border-red-500/30 bg-red-500/15 hover:bg-red-500/25 text-red-200" : "border border-cyan-500/30 bg-cyan-500/15 hover:bg-cyan-500/25 text-white",
              ].join(" ")}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
