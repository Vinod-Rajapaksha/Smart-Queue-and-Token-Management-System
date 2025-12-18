import { Component, type ReactNode } from "react";

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
          <div style={{ padding: 16 }}>
            <h3>Something went wrong.</h3>
            <p style={{ marginBottom: 0 }}>Please refresh the page.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
