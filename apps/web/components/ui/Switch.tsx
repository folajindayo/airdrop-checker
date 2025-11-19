"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, size = "md", className = "", ...props }, ref) => {
    const sizeClasses = {
      sm: {
        track: "h-5 w-9",
        thumb: "h-4 w-4",
        translate: "translate-x-4",
      },
      md: {
        track: "h-6 w-11",
        thumb: "h-5 w-5",
        translate: "translate-x-5",
      },
      lg: {
        track: "h-7 w-14",
        thumb: "h-6 w-6",
        translate: "translate-x-7",
      },
    };

    const classes = sizeClasses[size];

    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
        
        <div
          className={`
            relative ${classes.track} rounded-full bg-gray-300 transition-colors
            peer-checked:bg-blue-600
            peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
            peer-disabled:cursor-not-allowed peer-disabled:opacity-50
            ${className}
          `}
        >
          <div
            className={`
              absolute left-0.5 top-0.5 ${classes.thumb} rounded-full bg-white transition-transform
              peer-checked:${classes.translate}
            `}
          />
        </div>

        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";

