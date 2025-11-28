import React from "react";

import { cn } from "@/lib/utils/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  trailingIcon?: React.ReactNode;
  onTrailingIconClick?: () => void;
  /**
   * アクセシビリティ用: trailing icon のボタンに渡すラベル。
   * 例: パスワード表示トグルであれば "パスワードを表示" / "パスワードを隠す" を渡す
   */
  trailingIconLabel?: string;
  leadingIcon?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, trailingIcon, onTrailingIconClick, trailingIconLabel, ...props }, ref) => {
    return (
      <div className="relative">
        {props.leadingIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {props.leadingIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            props.leadingIcon && "pl-10",
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
            // accessibility: provide an explicit aria-label when available;
            // if not provided, hide from assistive tech to avoid noisy unlabeled controls
            {...(trailingIconLabel ? { "aria-label": trailingIconLabel } : { "aria-hidden": true })}
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
