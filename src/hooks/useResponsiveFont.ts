"use client";

import { useEffect, useRef, useState } from "react";

interface UseResponsiveFontOptions {
    baseFontSize: number; // rem単位
    minFontSize?: number; // rem単位
    maxSize?: number; // px単位 (width or height)
    textContent?: string | null; // 監視対象のテキスト内容
    direction?: "horizontal" | "vertical"; // 方向
}

/**
 * テキストが指定された最大サイズを超えないように、
 * フォントサイズを自動調整するカスタムフック
 *
 * @param options.baseFontSize - ベースのフォントサイズ（rem）
 * @param options.minFontSize - 最小フォントサイズ（rem、デフォルト: baseFontSize * 0.6）
 * @param options.maxSize - テキストの最大サイズ（px）。横書きならwidth、縦書きならheight
 * @param options.textContent - テキスト内容（変更検知用）
 * @param options.direction - 方向（"horizontal" | "vertical"）。デフォルトは "horizontal"
 * @returns fontSizeRem - 計算されたフォントサイズ（rem）
 */
export function useResponsiveFont({
    baseFontSize,
    minFontSize,
    maxSize = 100,
    textContent,
    direction = "horizontal",
}: UseResponsiveFontOptions) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [fontSizeRem, setFontSizeRem] = useState(baseFontSize);
    const currentFontRef = useRef(baseFontSize);

    // useLayoutEffectを使用して、画面描画前にDOM操作と計測を行うことでちらつきを防ぐ
    // ただし、SSR環境（Next.js）では警告が出るため、useEffectを使用するケースもあるが、
    // クライアントサイドでの調整が主なのでuseLayoutEffectが適切。
    // 安全のため、typeof windowチェックを入れるか、useEffectで代用する。
    // ここではシンプルにuseEffectを使いつつ、DOM直接操作で計測する。

    useEffect(() => {
        const el = elementRef.current;
        if (!el) return;

        const minSize = minFontSize ?? baseFontSize * 0.6;

        const adjustFontSize = () => {
            // --------------------------------------------------------------------------
            // ⚠️ DOM直接操作の正当性について
            // --------------------------------------------------------------------------
            // ここでは `el.style.fontSize` を直接書き換えて計測を行っています。
            // 通常、ReactではDOMの直接操作は避けるべきですが、以下の理由によりこの実装を採用しています：
            //
            // 1. **正確な計測の必要性**:
            //    テキストが縮小された状態（例: 0.5rem）から、内容が変更されて短くなった場合、
            //    そのままのフォントサイズで計測すると `scrollWidth` が小さくなり、
            //    「本来のベースサイズ（例: 1rem）で収まるかどうか」が正確に判定できません。
            //    そのため、計測前に必ず「ベースサイズ」に戻す必要があります。
            //
            // 2. **ちらつき（FOUC）の防止**:
            //    もし `setFontSizeRem(baseFontSize)` でStateを更新してリセットすると、
            //    Reactのレンダリングが走り、一瞬ベースサイズで描画された後に、
            //    次の計算結果で再描画されるため、画面のちらつき（Flash）が発生します。
            //    これを防ぐため、Reactのレンダリングサイクルを介さず、同期的にDOMのスタイルを
            //    一時的に変更して計測し、最終的な計算結果のみをStateに反映させています。
            //
            // 3. **整合性の確保**:
            //    State更新（`setFontSizeRem`）が行われると、Reactは次回のレンダリングで
            //    `style={{ fontSize: ... }}` を適用し、この直接操作による変更を上書きします。
            //    そのため、最終的なDOMの状態はReactの管理下に戻り、整合性は保たれます。
            // --------------------------------------------------------------------------

            // 1. 一旦DOMのスタイルを直接ベースサイズに変更して計測
            el.style.fontSize = `${baseFontSize}rem`;

            const currentSize = direction === "horizontal" ? el.scrollWidth : el.scrollHeight;
            let newFontSize = baseFontSize;

            if (currentSize > maxSize) {
                // テキストがはみ出している場合、フォントサイズを縮小
                const scaleFactor = maxSize / currentSize;
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
    }, [baseFontSize, minFontSize, maxSize, textContent, direction]);

    return { fontSizeRem, elementRef };
}