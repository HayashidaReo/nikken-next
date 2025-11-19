import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "@/components/atoms/spinner-for-button";

import { cn } from "@/lib/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transform transition-transform duration-150 transition-colors data-[no-hover=false]:hover:shadow-sm data-[no-hover=false]:hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:data-[no-hover=false]:hover:translate-y-0 motion-reduce:data-[no-hover=false]:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white data-[no-hover=false]:hover:bg-blue-600",
        destructive: "bg-red-500 text-white data-[no-hover=false]:hover:bg-red-600",
        outline:
          "border border-gray-300 bg-white data-[no-hover=false]:hover:bg-gray-50 text-gray-900",
        secondary: "bg-gray-100 text-gray-900 data-[no-hover=false]:hover:bg-gray-200",
        ghost: "data-[no-hover=false]:hover:bg-gray-100 text-gray-900",
        link: "text-blue-500 underline-offset-4 data-[no-hover=false]:hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** ローディング状態（オプション） */
  isLoading?: boolean;
  /** ローディング時に表示するテキスト（省略時は children を上書きしない） */
  loadingText?: string;
  /** ホバーエフェクトを無効化する（デフォルト false） */
  disableHover?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading, loadingText, children, disabled, disableHover, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // disabled は isLoading が true のとき強制的に true にする
    const finalDisabled = disabled || !!isLoading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={finalDisabled}
        data-no-hover={disableHover ? "true" : "false"}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-flex items-center">
            <Spinner size="sm" color="white" />
          </span>
        )}
        {isLoading && loadingText ? loadingText : children}
        {isLoading && !loadingText && (
          <span className="sr-only">読み込み中</span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
