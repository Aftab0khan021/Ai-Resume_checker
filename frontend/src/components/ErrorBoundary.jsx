// src/components/ErrorBoundary.jsx
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

/**
 * ErrorBoundary - catches render errors and shows a fallback UI
 * Usage: wrap the app (or critical sections) with <ErrorBoundary>{...}</ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // you can send error & errorInfo to a logging endpoint here
    console.error("Uncaught error in component tree:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    // reset state to try again (re-renders children)
    this.setState((s) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      resetKey: s.resetKey + 1,
    }));
  };

  render() {
    if (!this.state.hasError) {
      // include resetKey in wrapper to force child remount on retry
      return <div key={this.state.resetKey}>{this.props.children}</div>;
    }

    // Fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-700">
                The app encountered an unexpected error. You can retry or check the
                console for details. If the error persists, paste the console output
                here and I will fix it.
              </p>

              <div className="bg-slate-50 p-3 rounded text-xs font-mono text-red-700 overflow-auto max-h-48">
                <strong>Error:</strong>
                <div>{String(this.state.error?.message || this.state.error)}</div>
                {this.state.errorInfo?.componentStack && (
                  <>
                    <hr className="my-2" />
                    <div className="whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="default">
                  Retry
                </Button>
                <Button
                  onClick={() => {
                    // copy error to clipboard for easy paste
                    const text =
                      (this.state.error?.message || "") +
                      "\n\n" +
                      (this.state.errorInfo?.componentStack || "");
                    try {
                      navigator.clipboard.writeText(text);
                      // small visual feedback using native alert in case toast isn't available
                      alert("Error details copied to clipboard.");
                    } catch {
                      alert("Could not copy automatically. Check the console.");
                    }
                  }}
                  variant="outline"
                >
                  Copy Error
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default ErrorBoundary;
