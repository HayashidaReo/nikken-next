import { useResponsiveFont } from "@/hooks/useResponsiveFont";
import { RESPONSIVE_FONT_CONSTANTS } from "@/lib/constants";

interface TournamentInfoProps {
  tournamentName: string;
  courtName: string;
  round: string;
  className?: string;
}

export function TournamentInfo({
  tournamentName,
  courtName,
  round,
  className = "",
}: TournamentInfoProps) {
  const combined = `${tournamentName} ${courtName} ${round}`.trim();

  const { fontSizeRem, elementRef } = useResponsiveFont({
    baseFontSize: RESPONSIVE_FONT_CONSTANTS.INFO.BASE_FONT_SIZE, // （rem 単位の目安）
    minFontSize: RESPONSIVE_FONT_CONSTANTS.INFO.MIN_FONT_SIZE, // 最小フォントサイズ（rem 単位）
    maxWidth: RESPONSIVE_FONT_CONSTANTS.INFO.MAX_WIDTH, // 最大横幅（px）
  });

  return (
    <div className={`flex items-center text-white ${className}`}>
      <div
        ref={elementRef}
        style={{ fontSize: `${fontSizeRem}rem`, maxWidth: `${RESPONSIVE_FONT_CONSTANTS.INFO.MAX_WIDTH}px` }}
        className="font-bold leading-tight whitespace-nowrap"
      >
        {combined}
      </div>
    </div>
  );
}
