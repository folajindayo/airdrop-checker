/**
 * Error Boundary Component
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex items-center justify-center min-h-screen p-4">
          <View className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <Text className="text-xl font-bold text-red-800 mb-2">
              Something went wrong
            </Text>
            <Text className="text-red-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try again
            </button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

