"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/utils";
import { Plus, Trash2 } from "lucide-react";

interface AddButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface RemoveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function AddButton({
  onClick,
  children,
  disabled = false,
  className,
}: AddButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      <Plus className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
}

export function RemoveButton({
  onClick,
  disabled = false,
  className,
  size = "sm",
}: RemoveButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn("text-red-500 hover:text-red-700 h-8", className)}
    >
      <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
    </Button>
  );
}
