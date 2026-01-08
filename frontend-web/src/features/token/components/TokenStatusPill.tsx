import Badge from "../../../components/ui/Badge";
import type { TokenStatus } from "../types";

type Props = { status: TokenStatus };

function variantFor(status: TokenStatus) {
  switch (status) {
    case "WAITING":
      return "default";
    case "CALLING":
      return "default";
    case "SERVING":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "SKIPPED":
      return "default";
    default:
      return "default";
  }
}

export default function TokenStatusPill({ status }: Props) {
  return <Badge variant={variantFor(status)}>{status}</Badge>;
}
