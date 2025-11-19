import { ScoreDisplay } from "@/components/molecules/score-display";
import { PenaltyCards } from "@/components/molecules/penalty-cards";
import {
  getPlayerVariantStyles,
  getPlayerDisplayName,
  getPlayerPositionClass,
  type PlayerVariant,
} from "@/lib/utils/player-utils";
import { type MatchPlayer } from "@/types/match.schema";
import { type HansokuLevel } from "@/lib/utils/penalty-utils";
import { useResponsiveFont } from "@/hooks/useResponsiveFont";
import { PLAYER_FONT_CONSTANTS } from "@/lib/constants";

interface PlayerSectionProps {
  player: MatchPlayer;
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

  // 選手名のフォントサイズを自動調整（最大横幅 700px まで）
  const { fontSizeRem, elementRef } = useResponsiveFont({
    baseFontSize: PLAYER_FONT_CONSTANTS.RESPONSIVE_FONT.BASE_FONT_SIZE,
    minFontSize: PLAYER_FONT_CONSTANTS.RESPONSIVE_FONT.MIN_FONT_SIZE,
    maxWidth: PLAYER_FONT_CONSTANTS.RESPONSIVE_FONT.MAX_WIDTH,
  });

  return (
    <div
      className={`flex-1 ${styles.background} relative px-16 py-8 ${styles.text} ${className}`}
    >
      {/* 左側：チーム名と選手名 */}
      <div className="flex items-center h-full">
        <div className="flex-1">
          <div className="text-7xl font-medium mb-2 opacity-90 py-4">
            {player.teamName || "チーム名未設定"}
          </div>
          {/* 選手名は最大横幅を超過するとフォント自動縮小 */}
          <div
            ref={elementRef}
            style={{
              fontSize: `${fontSizeRem}rem`,
              maxWidth: `${PLAYER_FONT_CONSTANTS.RESPONSIVE_FONT.MAX_WIDTH}px`,
              height: "250px",
            }}
            className="font-black leading-none whitespace-nowrap"
          >
            {playerName}
          </div>
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
