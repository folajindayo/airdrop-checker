"use client";

import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

/**
 * Card Component
 * Reusable card container with optional header and footer
 */
export default function Card({
  children,
  title,
  subtitle,
  footer,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const hoverClass = hover ? "transition-shadow hover:shadow-lg" : "";

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${hoverClass} ${className}`}
    >
      {(title || subtitle) && (
        <div className={`border-b border-gray-200 ${paddingClasses[padding]}`}>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>{children}</div>
      
      {footer && (
        <div className={`border-t border-gray-200 ${paddingClasses[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Card variants for common patterns
 */
export function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
}) {
  return (
    <Card padding="md" hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && <p className="mt-1 text-sm text-green-600">{change}</p>}
        </div>
        {icon && <div className="text-4xl text-gray-400">{icon}</div>}
      </div>
    </Card>
  );
}
