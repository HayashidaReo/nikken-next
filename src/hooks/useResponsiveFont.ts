"use client";

import { useEffect, useRef, useState } from "react";

interface UseResponsiveFontOptions {
    baseFontSize: number; // rem単位
    minFontSize?: number; // rem単位
    maxWidth?: number; // px単位
}

/**
 * テキストが指定された最大横幅を超えないように、
 * フォントサイズを自動調整するカスタムフック
 *
 * @param options.baseFontSize - ベースのフォントサイズ（rem）
 * @param options.minFontSize - 最小フォントサイズ（rem、デフォルト: baseFontSize * 0.6）
 * @param options.maxWidth - テキストの最大横幅（px）
 * @returns fontSizeRem - 計算されたフォントサイズ（rem）
 */
export function useResponsiveFont({
    baseFontSize,
    minFontSize,
    maxWidth = 100,
}: UseResponsiveFontOptions) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [fontSizeRem, setFontSizeRem] = useState(baseFontSize);
    const currentFontRef = useRef(baseFontSize);

    useEffect(() => {
        const el = elementRef.current;
        if (!el) return;

        const minSize = minFontSize ?? baseFontSize * 0.6;

        // フォントサイズを計算する関数
        const calculateFontSize = () => {
            const scrollWidth = el.scrollWidth;
            let newFontSize = baseFontSize;

            if (scrollWidth > maxWidth) {
                // テキストがはみ出している場合、フォントサイズを縮小
                // 計算：最大幅に収まるまでスケール
                const scaleFactor = maxWidth / scrollWidth;
                newFontSize = Math.max(minSize, baseFontSize * scaleFactor);
            }

            // 状態を更新（差があれば setState）
            if (Math.abs(newFontSize - currentFontRef.current) > 0.01) {
                currentFontRef.current = newFontSize;
                setFontSizeRem(newFontSize);
            }
        };

        const timeoutId = setTimeout(calculateFontSize, 50);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [baseFontSize, minFontSize, maxWidth]);

    return { fontSizeRem, elementRef };
}