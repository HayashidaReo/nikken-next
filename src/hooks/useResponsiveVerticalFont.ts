"use client";

import { useEffect, useRef, useState } from "react";

interface UseResponsiveVerticalFontOptions {
    baseFontSize: number; // rem単位
    minFontSize?: number; // rem単位
    maxHeight?: number; // px単位
    textContent?: string | null; // 監視対象のテキスト内容
}

/**
 * テキストが指定された最大高さを超えないように、
 * フォントサイズを自動調整するカスタムフック（縦書き用）
 *
 * @param options.baseFontSize - ベースのフォントサイズ（rem）
 * @param options.minFontSize - 最小フォントサイズ（rem、デフォルト: baseFontSize * 0.6）
 * @param options.maxHeight - テキストの最大高さ（px）
 * @param options.textContent - テキスト内容（変更検知用）
 * @returns fontSizeRem - 計算されたフォントサイズ（rem）
 */
export function useResponsiveVerticalFont({
    baseFontSize,
    minFontSize,
    maxHeight = 100,
    textContent,
}: UseResponsiveVerticalFontOptions) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [fontSizeRem, setFontSizeRem] = useState(baseFontSize);
    const currentFontRef = useRef(baseFontSize);

    useEffect(() => {
        const el = elementRef.current;
        if (!el) return;

        const minSize = minFontSize ?? baseFontSize * 0.6;

        const adjustFontSize = () => {
            // 1. 一旦DOMのスタイルを直接ベースサイズに変更して計測
            el.style.fontSize = `${baseFontSize}rem`;

            const scrollHeight = el.scrollHeight;
            let newFontSize = baseFontSize;

            if (scrollHeight > maxHeight) {
                // テキストがはみ出している場合、フォントサイズを縮小
                const scaleFactor = maxHeight / scrollHeight;
                newFontSize = Math.max(minSize, baseFontSize * scaleFactor);
            }

            // 2. 計算結果をStateに反映
            if (Math.abs(newFontSize - currentFontRef.current) > 0.01) {
                currentFontRef.current = newFontSize;
                setFontSizeRem(newFontSize);
            }

            // 3. 念のため、DOMスタイルも計算結果に合わせておく
            el.style.fontSize = `${newFontSize}rem`;
        };

        // テキスト変更直後と、少し遅延させたタイミングの両方で実行
        adjustFontSize();

        const timeoutId = setTimeout(adjustFontSize, 50);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [baseFontSize, minFontSize, maxHeight, textContent]);

    return { fontSizeRem, elementRef };
}
