"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PenaltyBackgroundProps {
    children: React.ReactNode;
    className?: string;
    backgroundColor?: string;
}

export function PenaltyBackground({
    children,
    className,
    backgroundColor = "bg-black"
}: PenaltyBackgroundProps) {
    return (
        <div className={cn("relative", className)}>
            {/* 左側が斜めカットされた平行四辺形の背景 */}
            <div
                className={cn(
                    "absolute inset-0",
                    backgroundColor
                )}
                style={{
                    clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)"
                }}
            />

            {/* コンテンツ */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}