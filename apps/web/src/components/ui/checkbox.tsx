"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-4 w-4 rounded border-gray-300 text-blue-600
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              disabled:cursor-not-allowed disabled:opacity-50
              ${error ? "border-red-300" : ""}
              ${className}
            `}
            {...props}
          />
          
          {label && (
            <span className="text-sm text-gray-700">{label}</span>
          )}
        </label>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
