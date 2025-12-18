type Props = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.35)",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ marginBottom: 0 }}>{message}</p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button type="button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
