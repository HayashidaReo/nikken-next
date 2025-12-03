"use client";

import React from "react";
import { useResponsiveFont } from "@/hooks/useResponsiveFont";
import { cn } from "@/lib/utils/utils";

interface AdjustVerticalTextProps extends React.HTMLAttributes<HTMLDivElement> {
    baseFontSize: number;
    minFontSize: number;
    maxHeight: number;
    textContent: string;
}

export function AdjustVerticalText({
    baseFontSize,
    minFontSize,
    maxHeight,
    textContent,
    className,
    style,
    ...props
}: AdjustVerticalTextProps) {
    const { fontSizeRem, elementRef } = useResponsiveFont({
        baseFontSize,
        minFontSize,
        maxSize: maxHeight,
        textContent,
        direction: "vertical",
    });

    return (
        <div
            ref={elementRef}
            style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                whiteSpace: "nowrap",
                lineHeight: "1",
                letterSpacing: "-0.02em",
                fontSize: `${fontSizeRem}rem`,
                maxHeight: `${maxHeight}px`,
                overflow: "hidden",
                transform: "translateX(-3%)", // 微調整: 少し左に寄せる
                ...style,
            }}
            className={cn("", className)}
            {...props}
        >
            {textContent}
        </div>
    );
}
