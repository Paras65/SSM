import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  tabName: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TabErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; swap for a real error reporter in prod
    if (import.meta.env.DEV) {
      console.error(`[TabErrorBoundary] "${this.props.tabName}" crashed:`, error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-8">
          <AlertTriangle className="w-12 h-12 text-orange-500" />
          <div>
            <h2 className="text-lg font-bold text-stone-800 mb-1">
              "{this.props.tabName}" अनुभाग में त्रुटि
            </h2>
            <p className="text-sm text-stone-500 max-w-sm">
              इस अनुभाग को लोड करते समय एक अप्रत्याशित त्रुटि हुई। शेष डैशबोर्ड सामान्य रूप से कार्य कर रहा है।
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 text-left text-xs bg-red-50 border border-red-200 rounded-lg p-3 max-w-lg overflow-auto text-red-700">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            पुनः प्रयास करें (Retry)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

