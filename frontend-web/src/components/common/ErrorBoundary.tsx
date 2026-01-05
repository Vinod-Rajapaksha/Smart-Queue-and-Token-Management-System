import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-8 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-700" />
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-400">
                  Please refresh the page or try again later.
                </p>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
