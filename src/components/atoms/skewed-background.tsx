"use client";

import * as React from "react";
import { cn } from "@/lib/utils/utils";

interface SkewedBackgroundProps {
    children: React.ReactNode;
    className?: string;
    backgroundColor?: string;
}

export function SkewedBackground({
    children,
    className,
    backgroundColor = "bg-gray-900"

}: SkewedBackgroundProps) {
    return (
        <div className={cn("relative", className)}>
            {/* 斜めカットされた背景 */}
            <div
                className={cn(
                    "absolute inset-0",
                    backgroundColor
                )}
                style={{
                    clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 50%)"
                }}
            />

            {/* コンテンツ */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}