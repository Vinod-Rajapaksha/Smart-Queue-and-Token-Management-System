import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ToastContext,
  type ShowToastInput,
  type ToastContextValue,
  type ToastVariant,
} from "./toast";

type Toast = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

const MAX_TOASTS = 4;
const DEFAULT_DURATION = 3500;
const HOVER_RESUME_DURATION = 1400;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer]
  );

  const clear = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const setTimer = useCallback(
    (id: string, durationMs: number) => {
      clearTimer(id);
      const timerId = window.setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, timerId);
    },
    [clearTimer, dismiss]
  );

  const toast = useCallback(
    (input: ShowToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next: Toast = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant ?? "info",
        durationMs: input.durationMs ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [next, ...prev].slice(0, MAX_TOASTS));
      setTimer(id, next.durationMs);
    },
    [setTimer]
  );

  const api = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message, title) => toast({ message, title, variant: "success" }),
      error: (message, title) => toast({ message, title, variant: "error" }),
      info: (message, title) => toast({ message, title, variant: "info" }),
      warning: (message, title) => toast({ message, title, variant: "warning" }),
      dismiss,
      clear,
    }),
    [toast, dismiss, clear]
  );

  useEffect(() => clear, [clear]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport
        toasts={toasts}
        onDismiss={dismiss}
        onPause={(id) => clearTimer(id)}
        onResume={(id) => setTimer(id, HOVER_RESUME_DURATION)}
      />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  if (typeof document === "undefined") return null;

  const node = (
    <div className="fixed right-4 top-4 z-[9999] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          onMouseEnter={() => onPause(t.id)}
          onMouseLeave={() => onResume(t.id)}
          className={[
            "group relative overflow-hidden rounded-xl border bg-white shadow-lg",
            "transition-all duration-200 motion-reduce:transition-none",
            "animate-in fade-in slide-in-from-top-2",
            variantBorder(t.variant),
          ].join(" ")}
        >
          <div
            className={[
              "absolute left-0 top-0 h-full w-1.5",
              variantBar(t.variant),
            ].join(" ")}
          />

          <div className="flex items-start gap-3 p-4 pl-5">
            <div className="min-w-0 flex-1">
              {t.title ? (
                <div className="text-sm font-semibold text-slate-900">
                  {t.title}
                </div>
              ) : null}
              <div className="text-sm text-slate-700">{t.message}</div>
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(t.id)}
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return createPortal(node, document.body);
}

function variantBar(v: ToastVariant) {
  switch (v) {
    case "success":
      return "bg-emerald-500";
    case "error":
      return "bg-rose-500";
    case "warning":
      return "bg-amber-500";
    default:
      return "bg-blue-500";
  }
}

function variantBorder(v: ToastVariant) {
  switch (v) {
    case "success":
      return "border-emerald-100";
    case "error":
      return "border-rose-100";
    case "warning":
      return "border-amber-100";
    default:
      return "border-blue-100";
  }
}
