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
import { AdjustHorizontalText } from "@/components/atoms/adjust-horizontal-text";
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

  return (
    <div
      className={`flex-1 ${styles.background} relative px-16 py-8 ${styles.text} ${className}`}
    >
      {/* 左側：チーム名と選手名 */}
      <div className="flex items-center h-full">
        <div className="flex-1">
          {/* 選手A (赤): チーム名 -> 選手名 -> 段位 */}
          {variant === "red" && (
            <>
              {/* チーム名は最大横幅を超過するとフォント自動縮小 */}
              <AdjustHorizontalText
                baseFontSize={RESPONSIVE_FONT_CONSTANTS.TEAM.BASE_FONT_SIZE}
                minFontSize={RESPONSIVE_FONT_CONSTANTS.TEAM.MIN_FONT_SIZE}
                maxWidth={RESPONSIVE_FONT_CONSTANTS.TEAM.MAX_WIDTH}
                textContent={player.teamName || "チーム名未設定"}
                style={{
                  height: `${RESPONSIVE_FONT_CONSTANTS.TEAM.HEIGHT}px`,
                }}
                className="font-bold mb-2 opacity-90 py-4 flex items-center"
              />
              {/* 選手名は最大横幅を超過するとフォント自動縮小 */}
              <AdjustHorizontalText
                baseFontSize={RESPONSIVE_FONT_CONSTANTS.PLAYER.BASE_FONT_SIZE}
                minFontSize={RESPONSIVE_FONT_CONSTANTS.PLAYER.MIN_FONT_SIZE}
                maxWidth={RESPONSIVE_FONT_CONSTANTS.PLAYER.MAX_WIDTH}
                textContent={playerName}
                style={{
                  height: `${RESPONSIVE_FONT_CONSTANTS.PLAYER.HEIGHT}px`,
                }}
                className="font-black leading-none"
              />
              {player.grade && (
                <div className="mt-2">
                  <AdjustHorizontalText
                    textContent={player.grade}
                    baseFontSize={5}
                    minFontSize={1}
                    maxWidth={200}
                    className="font-bold text-white bg-red-500 px-4 py-0 rounded w-fit"
                  />
                </div>
              )}
            </>
          )}

          {/* 選手B (白): 段位 -> チーム名 -> 選手名 */}
          {variant === "white" && (
            <>
              {player.grade && (
                <div className="mb-2">
                  <AdjustHorizontalText
                    textContent={player.grade}
                    baseFontSize={5}
                    minFontSize={1}
                    maxWidth={200}
                    className="font-bold text-gray-700 bg-gray-200 px-4 py-0 rounded w-fit"
                  />
                </div>
              )}
              {/* チーム名は最大横幅を超過するとフォント自動縮小 */}
              <AdjustHorizontalText
                baseFontSize={RESPONSIVE_FONT_CONSTANTS.TEAM.BASE_FONT_SIZE}
                minFontSize={RESPONSIVE_FONT_CONSTANTS.TEAM.MIN_FONT_SIZE}
                maxWidth={RESPONSIVE_FONT_CONSTANTS.TEAM.MAX_WIDTH}
                textContent={player.teamName || "チーム名未設定"}
                style={{
                  height: `${RESPONSIVE_FONT_CONSTANTS.TEAM.HEIGHT}px`,
                }}
                className="font-bold mb-2 opacity-90 py-4 flex items-center"
              />
              {/* 選手名は最大横幅を超過するとフォント自動縮小 */}
              <AdjustHorizontalText
                baseFontSize={RESPONSIVE_FONT_CONSTANTS.PLAYER.BASE_FONT_SIZE}
                minFontSize={RESPONSIVE_FONT_CONSTANTS.PLAYER.MIN_FONT_SIZE}
                maxWidth={RESPONSIVE_FONT_CONSTANTS.PLAYER.MAX_WIDTH}
                textContent={playerName}
                style={{
                  height: `${RESPONSIVE_FONT_CONSTANTS.PLAYER.HEIGHT}px`,
                }}
                className="font-black leading-none"
              />
            </>
          )}
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
