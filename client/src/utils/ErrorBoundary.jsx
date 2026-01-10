/**
 * Error Boundary Component
 * Catches React component errors and displays fallback UI
 * Prevents entire app from crashing due to component errors
 */

import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error Boundary Caught', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Report to analytics or error tracking service
    if (window.reportError) {
      window.reportError(error, errorInfo);
    }
  }

  // Reset error state to try rendering children again
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            {/* Error Icon */}
            <div className="text-6xl mb-4">⚠️</div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {/* Development Error Details */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-gray-100 rounded p-4 mb-6 max-h-40 overflow-auto">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap wrap-break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap wrap-break-words">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">

              {/* Try Again Button */}
              <button
                onClick={this.handleReset}
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>

              {/* Go Home Button */}
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="cursor-pointer flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Error Count Warning */}
            {this.state.errorCount > 3 && (
              <p className="text-sm text-orange-600 mt-4">
                Multiple errors detected. Please clear your browser cache or contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * USAGE EXAMPLE:
 * 
 * import ErrorBoundary from './components/ErrorBoundary';
 * 
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * OR wrap specific routes:
 * 
 * <ErrorBoundary>
 *   <Route path="/checkout" element={<Checkout />} />
 * </ErrorBoundary>
 */
