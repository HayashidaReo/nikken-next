"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkewedBackgroundProps {
    children: React.ReactNode;
    className?: string;
    backgroundColor?: string;
}

export function SkewedBackground({
    children,
    className,
    backgroundColor = "bg-black"
}: SkewedBackgroundProps) {
    return (
        <div className={cn("relative", className)}>
            {/* 斜めカットされた背景 */}
            <div
                className={cn(
                    "bg-gray-900 absolute inset-0"
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