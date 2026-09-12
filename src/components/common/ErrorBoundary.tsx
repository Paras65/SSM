import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans antialiased text-stone-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-700 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mb-2 font-serif">
              क्षमा करें! तकनीकी त्रुटि उत्पन्न हुई
            </h1>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              सॉफ्टवेयर में अप्रत्याशित समस्या आई है। आपका डेटा सुरक्षित है। कृपया पृष्ठ को पुनः लोड करें अथवा मुख्य पृष्ठ पर जाएं।
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-stone-100 rounded-lg text-left text-xs text-stone-700 font-mono overflow-x-auto max-h-32 border border-stone-200">
                <span className="font-bold text-red-600">Error: </span>
                {this.state.error.message || 'Unknown error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                पृष्ठ पुनः लोड करें (Reload)
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm border border-stone-300 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                मुख्य पृष्ठ (Home)
              </button>
            </div>

            <p className="mt-6 text-[11px] text-stone-400">
              सरस्वती शिशु मंदिर डिजिटल प्रबंधन प्रणाली • सहायता हेतु support@init65.co.in
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

