import Badge from "../../../components/ui/Badge";
import type { QueueStatus } from "../types";

type Props = {
  status?: QueueStatus | null;
  className?: string;
};

export default function QueueStatusBadge({ status, className }: Props) {
  const s = status ?? "CLOSED";

  let variant: "default" | "success" | "warning" | "danger" = "default";

  switch (s) {
    case "OPEN":
      variant = "success";
      break;
    case "CLOSED":
      variant = "danger";
      break;
    default:
      variant = "default";
  }

  return (
    <Badge variant={variant} className={className}>
      {s}
    </Badge>
  );
}
