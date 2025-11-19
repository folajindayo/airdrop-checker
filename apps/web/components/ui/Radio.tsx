"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

/**
 * Radio Component
 * Styled radio input with label
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="radio"
            className={`h-4 w-4 border-gray-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          />
          {label && <span className="text-sm text-gray-900">{label}</span>}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Radio.displayName = "Radio";

export default Radio;

