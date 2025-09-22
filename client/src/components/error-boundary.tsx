
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error }: { error?: Error }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h2>
    <p className="text-gray-600 mb-4">
      Ocorreu um erro inesperado. Por favor, recarregue a página.
    </p>
    {error && (
      <details className="text-left bg-gray-100 p-4 rounded">
        <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
        <pre className="mt-2 text-sm overflow-auto">{error.message}</pre>
      </details>
    )}
  </div>
);

export default ErrorBoundary;
