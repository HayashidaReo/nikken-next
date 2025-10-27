"use client";

import { cn } from "@/lib/utils";

/**
 * 共通のコンテナレイアウト設定
 */
interface ContainerLayoutOptions {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  centered?: boolean;
  spacing?: "tight" | "normal" | "loose";
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  full: "w-full",
} as const;

const spacingMap = {
  tight: "space-y-3",
  normal: "space-y-6",
  loose: "space-y-8",
} as const;

/**
 * 共通のコンテナレイアウトスタイルを生成
 */
export function useContainerLayout({
  maxWidth = "4xl",
  centered = true,
  spacing = "normal",
  className,
}: ContainerLayoutOptions = {}) {
  const containerClassName = cn(
    maxWidthMap[maxWidth],
    centered && "mx-auto",
    spacingMap[spacing],
    "w-full",
    className
  );

  return {
    containerClassName,
    maxWidth,
    centered,
    spacing,
  };
}