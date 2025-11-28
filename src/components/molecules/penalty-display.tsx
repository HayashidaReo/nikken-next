"use client";

import { getPenaltyCards } from "@/lib/utils/penalty-utils";
import { cn } from "@/lib/utils/utils";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface PenaltyDisplayProps {
    hansokuCount: HansokuLevel;
    variant?: "compact" | "medium" | "normal";
    className?: string;
    ariaLabel?: string;
}

/**
 * 反則レベルに基づいて色付きカードを表示するコンポーネント
 * 
 * @param hansokuCount - 反則レベル (0-4)
 * @param variant - 'compact': 小さいカード（テーブル用）、'normal': 通常サイズ（モニター用）
 * @param className - 追加のカスタムクラス
 */
export function PenaltyDisplay({
    hansokuCount,
    variant = "compact",
    className = "",
    ariaLabel,
}: PenaltyDisplayProps) {
    const cards = getPenaltyCards(hansokuCount);

    // カードのサイズ定義
    const cardSizeClasses: Record<NonNullable<PenaltyDisplayProps['variant']>, string> = {
        compact: "w-3 h-4",
        medium: "w-4 h-6",
        normal: "w-16 h-24",
    };

    if (cards.length === 0) {
        // カードがない場合は固定高さのコンテナで中央揃えし、ハイフンを少し下にずらす
        return (
            <div className={cn("h-6 flex items-center justify-center", className)}>
                {/* 補助テキスト: スクリーンリーダー向けに反則情報を提供 */}
                <span className="sr-only">{ariaLabel ?? "反則なし"}</span>
                {/* 可視的なハイフンはテストで検出されるように aria-hidden を外す */}
                <span className="text-gray-400 translate-y-0.5">-</span>
            </div>
        );
    }

    return (
        <div className={cn("flex gap-1 items-center justify-center", className)}>
            {/* 補助テキスト: スクリーンリーダー向けに反則情報を提供 */}
            <span className="sr-only">{ariaLabel ?? `${hansokuCount} 反則`}</span>
            {cards.map((card, i) => (
                <div
                    key={i}
                    aria-hidden="true"
                    className={cn(
                        "rounded-sm border border-white shadow-sm",
                        cardSizeClasses[variant],
                        card.type === "yellow" ? "bg-yellow-400" : "bg-red-600"
                    )}
                />
            ))}
        </div>
    );
}
