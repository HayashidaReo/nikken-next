"use client";

import { cn } from "@/lib/utils/utils";

interface PenaltyBackgroundProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  variant?: "normal" | "flipped";
}

export function PenaltyBackground({
  children,
  className,
  backgroundColor = "bg-black",
  variant = "normal",
}: PenaltyBackgroundProps) {
  // 通常版と上下反転版のclip-path
  const clipPath =
    variant === "flipped"
      ? "polygon(0% 0%, 15% 100%, 100% 100%, 100% 0%, 15% 0%)"
      : "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)";

  return (
    <div className={cn("relative", className)}>
      {/* 左側が斜めカットされた平行四辺形の背景 */}
      <div
        className={cn("absolute inset-0", backgroundColor)}
        style={{
          clipPath: clipPath,
        }}
      />

      {/* コンテンツ */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
