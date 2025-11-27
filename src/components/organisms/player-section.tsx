import { ScoreDisplay } from "@/components/molecules/score-display";
import { PenaltyCards } from "@/components/molecules/penalty-cards";
import {
  getPlayerVariantStyles,
  getPlayerDisplayName,
  getPlayerPositionClass,
  type PlayerVariant,
} from "@/lib/utils/player-utils";
import type { MonitorPlayer } from "@/types/monitor.schema";
import { type HansokuLevel } from "@/lib/utils/penalty-utils";
import { useResponsiveFont } from "@/hooks/useResponsiveFont";
import { RESPONSIVE_FONT_CONSTANTS } from "@/lib/constants";

interface PlayerSectionProps {
  player: MonitorPlayer;
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

  // 選手名のフォントサイズを自動調整
  const { fontSizeRem: playerFontSize, elementRef: playerRef } = useResponsiveFont({
    baseFontSize: RESPONSIVE_FONT_CONSTANTS.PLAYER.BASE_FONT_SIZE,
    minFontSize: RESPONSIVE_FONT_CONSTANTS.PLAYER.MIN_FONT_SIZE,
    maxWidth: RESPONSIVE_FONT_CONSTANTS.PLAYER.MAX_WIDTH,
  });

  // チーム名のフォントサイズを自動調整
  const { fontSizeRem: teamFontSize, elementRef: teamRef } = useResponsiveFont({
    baseFontSize: RESPONSIVE_FONT_CONSTANTS.TEAM.BASE_FONT_SIZE,
    minFontSize: RESPONSIVE_FONT_CONSTANTS.TEAM.MIN_FONT_SIZE,
    maxWidth: RESPONSIVE_FONT_CONSTANTS.TEAM.MAX_WIDTH,
  });

  return (
    <div
      className={`flex-1 ${styles.background} relative px-16 py-8 ${styles.text} ${className}`}
    >
      {/* 左側：チーム名と選手名 */}
      <div className="flex items-center h-full">
        <div className="flex-1">
          {/* チーム名は最大横幅を超過するとフォント自動縮小 */}
          <div
            ref={teamRef}
            style={{
              fontSize: `${teamFontSize}rem`,
              maxWidth: `${RESPONSIVE_FONT_CONSTANTS.TEAM.MAX_WIDTH}px`,
              height: `${RESPONSIVE_FONT_CONSTANTS.TEAM.HEIGHT}px`,
            }}
            className="font-bold mb-2 opacity-90 py-4 whitespace-nowrap flex items-center"
          >
            {player.teamName || "チーム名未設定"}
          </div>
          {/* 選手名は最大横幅を超過するとフォント自動縮小 */}
          <div
            ref={playerRef}
            style={{
              fontSize: `${playerFontSize}rem`,
              maxWidth: `${RESPONSIVE_FONT_CONSTANTS.PLAYER.MAX_WIDTH}px`,
              height: `${RESPONSIVE_FONT_CONSTANTS.PLAYER.HEIGHT}px`,
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
