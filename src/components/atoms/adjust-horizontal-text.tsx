"use client";

import React from "react";
import { useResponsiveFont } from "@/hooks/useResponsiveFont";
import { cn } from "@/lib/utils/utils";

interface AdjustHorizontalTextProps extends React.HTMLAttributes<HTMLDivElement> {
    baseFontSize: number;
    minFontSize: number;
    maxWidth: number;
    textContent: string;
}

export function AdjustHorizontalText({
    baseFontSize,
    minFontSize,
    maxWidth,
    textContent,
    className,
    style,
    ...props
}: AdjustHorizontalTextProps) {
    const { fontSizeRem, elementRef } = useResponsiveFont({
        baseFontSize,
        minFontSize,
        maxSize: maxWidth,
        textContent,
        direction: "horizontal",
    });

    return (
        <div
            ref={elementRef}
            style={{
                fontSize: `${fontSizeRem}rem`,
                maxWidth: `${maxWidth}px`,
                ...style,
            }}
            className={cn("whitespace-nowrap", className)}
            {...props}
        >
            {textContent}
        </div>
    );
}
