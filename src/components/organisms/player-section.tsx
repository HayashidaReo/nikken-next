import * as React from "react";
import { ScoreDisplay } from "@/components/molecules/score-display";
import { PenaltyCards } from "@/components/molecules/penalty-cards";
import {
  getPlayerVariantStyles,
  getPlayerDisplayName,
  getPlayerPositionClass,
  type PlayerVariant,
} from "@/lib/utils/player-utils";
import { type PlayerData, type HansokuLevel } from "@/types/common";

interface PlayerSectionProps {
  player: PlayerData;
  variant: PlayerVariant;
  className?: string;
}

export function PlayerSection({
  player,
  variant,
  className = "",
}: PlayerSectionProps) {
  const styles = getPlayerVariantStyles(variant);
  const playerName = getPlayerDisplayName(variant, player.displayName);
  const scorePositionClass = getPlayerPositionClass(variant);

  return (
    <div
      className={`flex-1 ${styles.background} relative px-16 py-8 ${styles.text} ${className}`}
    >
      {/* 左側：チーム名と選手名 */}
      <div className="flex items-center h-full">
        <div className="flex-1">
          <div className="text-2xl font-medium mb-2 opacity-90">
            {player.teamName || "チーム名未設定"}
          </div>
          <div className="text-8xl font-black leading-none">{playerName}</div>
        </div>
      </div>

      {/* 右側：スコアと反則カード */}
      <div className={`${scorePositionClass} flex items-center gap-8`}>
        <ScoreDisplay score={player.score} />
        <PenaltyCards
          hansokuCount={player.hansoku as HansokuLevel}
          variant={variant === "white" ? "flipped" : "normal"}
        />
      </div>
    </div>
  );
}
