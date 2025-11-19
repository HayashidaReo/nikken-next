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
 * @param options.maxWidth - テキストの最大横幅（px、デフォルト: 600）
 * @returns fontSizeRem - 計算されたフォントサイズ（rem）
 */
export function useResponsiveFont({
    baseFontSize,
    minFontSize,
    maxWidth = 100,
}: UseResponsiveFontOptions) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [fontSizeRem, setFontSizeRem] = useState(baseFontSize);
    const stateRef = useRef({ currentFontSize: baseFontSize, calculationScheduled: false });

    useEffect(() => {
        const el = elementRef.current;
        if (!el) return;

        const minSize = minFontSize ?? baseFontSize * 0.6;

        // フォントサイズを計算する関数
        const calculateFontSize = () => {
            const scrollWidth = el.scrollWidth;
            console.log(`[calculateFontSize] scrollWidth: ${scrollWidth}, maxWidth: ${maxWidth}`);

            let newFontSize = baseFontSize;

            if (scrollWidth > maxWidth) {
                // テキストがはみ出している場合、フォントサイズを縮小
                // 計算：最大幅に収まるまでスケール
                const scaleFactor = maxWidth / scrollWidth;
                newFontSize = Math.max(minSize, baseFontSize * scaleFactor);
                console.log(`[calculateFontSize] Text overflows, scaling down to ${newFontSize}rem`);
            } else {
                console.log(`[calculateFontSize] Text fits, keeping base size ${baseFontSize}rem`);
            }

            // 状態を更新
            if (Math.abs(newFontSize - stateRef.current.currentFontSize) > 0.01) {
                console.log(`[calculateFontSize] Updating font size from ${stateRef.current.currentFontSize}rem to ${newFontSize}rem`);
                stateRef.current.currentFontSize = newFontSize;
                stateRef.current.calculationScheduled = false;
                setFontSizeRem(newFontSize);
            } else {
                stateRef.current.calculationScheduled = false;
            }
        };

        const timeoutId = setTimeout(calculateFontSize, 50);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [baseFontSize, minFontSize, maxWidth]);

    return { fontSizeRem, elementRef };
}