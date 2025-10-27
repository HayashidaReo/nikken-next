import * as React from "react";
import { cn } from "@/lib/utils";
import { PenaltyBackground } from "@/components/atoms";

interface PenaltyCardsProps {
    hansokuCount: number;
    className?: string;
    variant?: "normal" | "flipped";
}

export function PenaltyCards({ hansokuCount, className = "", variant = "normal" }: PenaltyCardsProps) {
    // 反則の状態に応じたカードの種類と枚数を決定
    const getCards = (count: number) => {
        switch (count) {
            case 0: // 無し
                return [];
            case 1: // 黄
                return [{ type: "yellow" }];
            case 2: // 赤
                return [{ type: "red" }];
            case 3: // 赤+黄
                return [{ type: "red" }, { type: "yellow" }];
            case 4: // 赤+赤
                return [{ type: "red" }, { type: "red" }];
            default:
                return [];
        }
    };

    const cards = getCards(hansokuCount);

    return (
        <PenaltyBackground
            className={`w-66 h-40 flex items-center justify-center ${className}`}
            variant={variant}
        >
            <div className="flex justify-center items-center gap-4 h-full translate-x-3">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-16 h-24 rounded-md border-2 border-white shadow-lg",
                            card.type === "yellow" ? "bg-yellow-400" : "bg-red-600"
                        )}
                    />
                ))}
            </div>
        </PenaltyBackground>
    );
}