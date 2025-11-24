import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`px-4 py-2 rounded ${variant === "primary" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"} ${className}`}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
