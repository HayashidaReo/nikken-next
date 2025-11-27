"use client";

import { useEffect, useRef, useState } from "react";

interface UseResponsiveFontOptions {
    baseFontSize: number; // rem単位
    minFontSize?: number; // rem単位
    maxWidth?: number; // px単位
    textContent?: string | null; // 監視対象のテキスト内容
}

/**
 * テキストが指定された最大横幅を超えないように、
 * フォントサイズを自動調整するカスタムフック
 *
 * @param options.baseFontSize - ベースのフォントサイズ（rem）
 * @param options.minFontSize - 最小フォントサイズ（rem、デフォルト: baseFontSize * 0.6）
 * @param options.maxWidth - テキストの最大横幅（px）
 * @param options.textContent - テキスト内容（変更検知用）
 * @returns fontSizeRem - 計算されたフォントサイズ（rem）
 */
export function useResponsiveFont({
    baseFontSize,
    minFontSize,
    maxWidth = 100,
    textContent,
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
            // 1. 一旦DOMのスタイルを直接ベースサイズに変更して計測
            // これにより、Reactのステート更新を待たずに「本来の幅」を取得できる
            el.style.fontSize = `${baseFontSize}rem`;

            const scrollWidth = el.scrollWidth;
            let newFontSize = baseFontSize;

            if (scrollWidth > maxWidth) {
                // テキストがはみ出している場合、フォントサイズを縮小
                const scaleFactor = maxWidth / scrollWidth;
                newFontSize = Math.max(minSize, baseFontSize * scaleFactor);
            }

            // 2. 計算結果をStateに反映（これにより次回のレンダリングでstyle propが更新される）
            if (Math.abs(newFontSize - currentFontRef.current) > 0.01) {
                currentFontRef.current = newFontSize;
                setFontSizeRem(newFontSize);
            }

            // 3. 念のため、DOMスタイルも計算結果に合わせておく（State反映までのちらつき防止）
            // ただし、State更新が走るとReactがstyle属性を上書きするので、整合性は保たれる
            el.style.fontSize = `${newFontSize}rem`;
        };

        // テキスト変更直後と、少し遅延させたタイミングの両方で実行
        // （フォント読み込みやレイアウト確定のタイミングズレを考慮）
        adjustFontSize();

        const timeoutId = setTimeout(adjustFontSize, 50);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [baseFontSize, minFontSize, maxWidth, textContent]);

    return { fontSizeRem, elementRef };
}