"use client";

import React from "react";
import { useResponsiveVerticalFont } from "@/hooks/useResponsiveVerticalFont";
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
    const { fontSizeRem, elementRef } = useResponsiveVerticalFont({
        baseFontSize,
        minFontSize,
        maxHeight,
        textContent,
    });

    return (
        <div
            ref={elementRef}
            style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                whiteSpace: "nowrap",
                lineHeight: "1.2",
                fontSize: `${fontSizeRem}rem`,
                maxHeight: `${maxHeight}px`,
                overflow: "hidden",
                ...style,
            }}
            className={cn("", className)}
            {...props}
        >
            {textContent}
        </div>
    );
}
