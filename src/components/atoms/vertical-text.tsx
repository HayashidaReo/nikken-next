"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/utils";

interface VerticalTextProps {
    text: string;
    variant?: "player" | "team" | "round";
    maxHeight?: number; // px単位
    baseFontSize?: number; // rem単位、カスタムフォントサイズ
    debug?: boolean; // デバッグ用背景色表示
    className?: string;
}

export function VerticalText({
    text,
    variant = "player",
    maxHeight,
    baseFontSize: customBaseFontSize,
    debug = false,
    className
}: VerticalTextProps) {
    const variantStyles = {
        player: { base: "text-7xl font-bold text-white tracking-widest", baseFontSize: 6, minFontSize: 2.5 },
        team: { base: "text-8xl font-bold text-white tracking-widest", baseFontSize: 6, minFontSize: 3 },
        round: { base: "text-3xl font-medium text-gray-300 tracking-widest", baseFontSize: 2.5, minFontSize: 1 },
    };

    const style = variantStyles[variant];
    // カスタムbaseFontSizeが指定されていればそれを使用、なければvariantのデフォルトを使用
    const actualBaseFontSize = customBaseFontSize ?? style.baseFontSize;

    const elementRef = useRef<HTMLDivElement>(null);
    const [fontSizeRem, setFontSizeRem] = useState(actualBaseFontSize);
    const currentFontRef = useRef(actualBaseFontSize);

    useLayoutEffect(() => {
        if (!maxHeight) return;

        const el = elementRef.current;
        if (!el) return;

        const calculateFontSize = () => {
            const scrollHeight = el.scrollHeight;
            let newFontSize = actualBaseFontSize;

            if (scrollHeight > maxHeight) {
                // テキストがはみ出している場合、フォントサイズを縮小
                const scaleFactor = maxHeight / scrollHeight;
                newFontSize = Math.max(style.minFontSize, actualBaseFontSize * scaleFactor);
            }

            // 状態を更新（差があれば setState）
            if (Math.abs(newFontSize - currentFontRef.current) > 0.01) {
                currentFontRef.current = newFontSize;
                setFontSizeRem(newFontSize);
            }
        };

        calculateFontSize();
    }, [maxHeight, actualBaseFontSize, style.minFontSize, text]);

    return (
        <div
            ref={elementRef}
            style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                whiteSpace: "nowrap",
                lineHeight: "1.2", // フォントサイズに対して適切な行間を確保
                ...(maxHeight && {
                    fontSize: `${fontSizeRem}rem`,
                    maxHeight: `${maxHeight}px`,
                }),
                ...(debug && { backgroundColor: "rgba(255, 0, 0, 0.2)" }),
            }}
            className={cn(style.base, className)}
        >
            {text}
        </div>
    );
}
