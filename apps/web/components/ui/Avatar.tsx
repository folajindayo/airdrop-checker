"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-lg",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      const initials = alt
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return initials;
    }
    return "?";
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-200",
        sizeClasses[size],
        className
      )}
    >
      {showFallback ? (
        <span className="font-medium text-gray-600">{getFallbackText()}</span>
      ) : (
        <Image
          src={src!}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

