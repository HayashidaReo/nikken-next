import React from "react";

import { cn } from "@/lib/utils/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  trailingIcon?: React.ReactNode;
  onTrailingIconClick?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, trailingIcon, onTrailingIconClick, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            trailingIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {trailingIcon && (
          <button
            type="button"
            onClick={onTrailingIconClick}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none pointer-events-auto"
            tabIndex={-1}
          >
            {trailingIcon}
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
