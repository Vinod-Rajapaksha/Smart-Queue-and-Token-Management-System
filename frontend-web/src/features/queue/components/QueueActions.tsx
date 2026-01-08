import Button from "../../../components/ui/Button";
import type { TokenDto } from "../types";

type Props = {
  branchId: string;
  counterId: string;

  queueOpen: boolean;

  lastToken: TokenDto | null;

  loading?: boolean;

  onOpenQueue: () => void;
  onCloseQueue: () => void;
  onCallNext: () => void;

  onServing: (tokenId: string) => void;
  onSkipped: (tokenId: string) => void;
  onCancelled: (tokenId: string) => void;
  onCompleted: (tokenId: string) => void;
};

export default function QueueActions({
  branchId,
  counterId,
  queueOpen,
  lastToken,
  loading = false,

  onOpenQueue,
  onCloseQueue,
  onCallNext,

  onServing,
  onSkipped,
  onCancelled,
  onCompleted,
}: Props) {
  const canOperate = Boolean(branchId && counterId);
  const tokenId = lastToken?._id ?? "";

  const tokenStatus = lastToken?.status;

  const canServing = Boolean(tokenId) && tokenStatus === "CALLING";
  const canSkipped = Boolean(tokenId) && tokenStatus === "CALLING";
  const canCancelled =
    Boolean(tokenId) && (tokenStatus === "CALLING" || tokenStatus === "SKIPPED");
  const canCompleted = Boolean(tokenId) && tokenStatus === "SERVING";

  return (
    <div className="space-y-3">
      {/* Queue controls */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onOpenQueue} disabled={!branchId || loading}>
          Open Queue
        </Button>

        <Button
          variant="secondary"
          onClick={onCloseQueue}
          disabled={!branchId || !queueOpen || loading}
        >
          Close Queue
        </Button>

        <Button
          onClick={onCallNext}
          disabled={!canOperate || !queueOpen || loading}
        >
          Call Next
        </Button>
      </div>

      {/* Token controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => tokenId && onServing(tokenId)}
          disabled={!canServing || loading}
        >
          Serving
        </Button>

        <Button
          variant="secondary"
          onClick={() => tokenId && onSkipped(tokenId)}
          disabled={!canSkipped || loading}
        >
          Skipped
        </Button>

        <Button
          variant="secondary"
          onClick={() => tokenId && onCancelled(tokenId)}
          disabled={!canCancelled || loading}
        >
          Cancelled
        </Button>

        <Button
          onClick={() => tokenId && onCompleted(tokenId)}
          disabled={!canCompleted || loading}
        >
          Completed
        </Button>
      </div>

      {/* Helper note */}
      <div className="text-xs text-gray-500">
        Tip: Select both <span className="text-gray-300">Branch</span> and{" "}
        <span className="text-gray-300">Counter</span> to call next token.
      </div>
    </div>
  );
}
