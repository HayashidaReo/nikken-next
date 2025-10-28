"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LoadingButton({
  isLoading,
  children,
  type = "button",
  variant = "default",
  size = "default",
  disabled = false,
  onClick,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Button>
  );
}
