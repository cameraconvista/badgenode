// [STEP2-DEBUG] ErrorBoundary.tsx
import React from 'react';

type Props = { children: React.ReactNode; name?: string };
type State = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Log diagnostico chiaro
    console.error('[STEP2-DEBUG][ErrorBoundary]', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, border: '1px solid #f00', borderRadius: 8 }}>
          <strong>⚠️ [STEP2-DEBUG] {this.props.name ?? 'Component'} crash</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
