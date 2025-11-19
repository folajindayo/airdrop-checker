"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "secondary" | "white";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

const colorClasses = {
  primary: "border-blue-600 border-t-transparent",
  secondary: "border-gray-600 border-t-transparent",
  white: "border-white border-t-transparent",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  color = "primary",
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

