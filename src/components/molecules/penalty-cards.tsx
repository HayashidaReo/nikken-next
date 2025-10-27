import * as React from "react";
import { getPenaltyCards, getCardStyles } from "@/lib/utils/penalty-utils";
import { type HansokuLevel } from "@/types/common";
import { PenaltyBackground } from "@/components/atoms";

interface PenaltyCardsProps {
    hansokuCount: HansokuLevel;
    className?: string;
    variant?: "normal" | "flipped";
}

export function PenaltyCards({ hansokuCount, className = "", variant = "normal" }: PenaltyCardsProps) {
    const cards = getPenaltyCards(hansokuCount);

    return (
        <PenaltyBackground
            className={`w-66 h-40 flex items-center justify-center ${className}`}
            variant={variant}
        >
            <div className="flex justify-center items-center gap-4 h-full translate-x-3">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={getCardStyles(card.type)}
                    />
                ))}
            </div>
        </PenaltyBackground>
    );
}