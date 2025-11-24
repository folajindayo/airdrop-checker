/**
 * Component Error Boundary
 * 
 * Error boundary wrapper for individual components with fallback UI
 */

'use client';

import React from 'react';

export interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  State
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;
    
    console.error(
      `Error in component ${componentName || 'Unknown'}:`,
      error,
      errorInfo
    );
    
    onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Component Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {this.props.componentName || 'This component'} failed to render.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {this.state.error.message}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ComponentErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

