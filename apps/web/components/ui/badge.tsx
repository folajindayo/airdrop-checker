"use client";

import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Badge Component
 * Small status indicator with color variants
 */
export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Badge with dot indicator
 */
export function BadgeWithDot({
  children,
  variant = "default",
  size = "md",
}: BadgeProps) {
  const dotColors = {
    default: "bg-gray-400",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <Badge variant={variant} size={size}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      {children}
    </Badge>
  );
}
