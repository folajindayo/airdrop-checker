"use client";

import React from "react";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "yellow" | "red";
  showLabel?: boolean;
  className?: string;
}

/**
 * Progress Component
 * Progress bar with customizable appearance
 */
export default function Progress({
  value,
  max = 100,
  size = "md",
  color = "blue",
  showLabel = false,
  className = "",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    red: "bg-red-600",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}

      <div className={`w-full rounded-full bg-gray-200 ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/**
 * CircularProgress Component
 * Circular progress indicator
 */
export function CircularProgress({
  value,
  max = 100,
  size = 64,
  color = "blue",
  showLabel = true,
}: Omit<ProgressProps, "size"> & { size?: number }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    blue: "stroke-blue-600",
    green: "stroke-green-600",
    yellow: "stroke-yellow-600",
    red: "stroke-red-600",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${colorClasses[color]}`}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-gray-900">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

