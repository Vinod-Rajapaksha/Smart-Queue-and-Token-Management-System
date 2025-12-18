type Props = {
  label?: string;
};

export default function Loading({ label = "Loading..." }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ padding: 12, textAlign: "center" }}
    >
      {label}
    </div>
  );
}
