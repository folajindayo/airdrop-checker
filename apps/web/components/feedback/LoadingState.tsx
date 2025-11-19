"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * LoadingState Component
 * Full-page or section loading indicator
 */
export default function LoadingState({
  message = "Loading...",
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">{message}</span>
      </div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

/**
 * LoadingDots Component
 * Animated loading dots
 */
export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "0ms" }} />
      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "150ms" }} />
      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

