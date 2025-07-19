import React, { useEffect, useState } from "react";

// ErrorBoundary component for catching errors
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log error here
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-100 text-red-800 rounded-lg">
          <h2 className="font-bold text-lg mb-2">TestPage Error</h2>
          <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TestPage() {
  const [TestSuite, setTestSuite] = useState<React.FC | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import the test suite to avoid breaking the page if there are errors
    import("./TestPageFull")
      .then(mod => setTestSuite(() => mod.default))
      .catch(err => setLoadError(String(err)));
  }, []);

  if (loadError) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-6 bg-red-100 text-red-800 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Failed to load test suite</h2>
          <pre className="whitespace-pre-wrap">{loadError}</pre>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {TestSuite ? <TestSuite /> : (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">🧪 Supabase Backend Test Suite</h1>
          <p className="text-gray-600">Loading test suite...</p>
        </div>
      )}
    </ErrorBoundary>
  );
} 