"use client";

import React, { ReactNode } from "react";

interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  change?: number;
  trend?: "up" | "down" | "neutral";
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

/**
 * StatsGrid Component
 * Grid layout for displaying statistics
 */
export default function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            {stat.icon && <div className="text-gray-400">{stat.icon}</div>}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>

            {stat.change !== undefined && stat.trend && (
              <span
                className={`text-sm font-medium ${getTrendColor(stat.trend)}`}
              >
                {stat.trend === "up" && "↑"}
                {stat.trend === "down" && "↓"}
                {stat.trend === "neutral" && "→"}
                {" "}
                {Math.abs(stat.change)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

