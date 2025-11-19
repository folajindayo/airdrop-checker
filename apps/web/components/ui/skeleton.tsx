"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

const variantClasses = {
  text: "rounded",
  rect: "rounded-md",
  circle: "rounded-full",
};

const animationClasses = {
  pulse: "animate-pulse",
  wave: "animate-shimmer",
  none: "",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rect",
  width,
  height,
  animation = "pulse",
}) => {
  const style: React.CSSProperties = {};

  if (width) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }

  if (height) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={cn(
        "bg-gray-200",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? "60%" : "100%"}
          height={16}
        />
      ))}
    </div>
  );
};
