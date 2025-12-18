type Props = {
  title?: string;
  message?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title = "Nothing here yet",
  message = "No data available.",
  action,
}: Props) {
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ marginTop: 8, marginBottom: 0 }}>{message}</p>
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}
