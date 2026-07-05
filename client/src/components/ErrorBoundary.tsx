import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-red-500 p-8 font-mono">
          <h1 className="text-2xl font-bold mb-4">React App Crashed</h1>
          <p className="mb-4 text-white">An unhandled error occurred in the component tree.</p>
          <div className="bg-slate-800 p-4 rounded-lg overflow-auto">
            <h2 className="text-lg font-bold text-red-400 mb-2">{this.state.error && this.state.error.toString()}</h2>
            <pre className="text-sm text-slate-300">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
