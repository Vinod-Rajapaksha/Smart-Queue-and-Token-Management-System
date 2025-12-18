type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, right }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {subtitle ? (
          <p style={{ marginTop: 6, marginBottom: 0 }}>{subtitle}</p>
        ) : null}
      </div>

      {right ? <div>{right}</div> : null}
    </div>
  );
}
