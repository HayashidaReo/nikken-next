import {
  getPenaltyCards,
  getCardStyles,
  type HansokuLevel,
} from "@/lib/utils/penalty-utils";
import { PenaltyBackground } from "@/components/atoms";
import { PENALTY_CONSTANTS } from "@/lib/constants";

interface PenaltyCardsProps {
  hansokuCount: HansokuLevel;
  className?: string;
  variant?: "normal" | "flipped";
}

export function PenaltyCards({
  hansokuCount,
  className = "",
  variant = "normal",
}: PenaltyCardsProps) {
  const cards = getPenaltyCards(hansokuCount);

  // 反則カードが2枚ある場合は、間隔を広くし、配置を少しずらして見やすくする
  const gapClass = cards.length === 2 ? "gap-8" : "gap-4";
  const translateClass = cards.length === 2 ? "translate-x-6" : "translate-x-3";

  return (
    <PenaltyBackground
      className={`${PENALTY_CONSTANTS.BACKGROUND_SIZE.width} ${PENALTY_CONSTANTS.BACKGROUND_SIZE.height} flex items-center justify-center ${className}`}
      variant={variant}
    >
      <div className={`flex justify-center items-center ${gapClass} h-full ${translateClass}`}>
        {cards.map((card, i) => (
          <div key={i} className={getCardStyles(card.type)} />
        ))}
      </div>
    </PenaltyBackground>
  );
}
