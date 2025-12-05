import { UI_CONSTANTS } from "@/lib/constants";

interface ScoreDisplayProps {
  score: number;
  className?: string;
}

export function ScoreDisplay({ score, className = "" }: ScoreDisplayProps) {
  return (
    <div className={`${UI_CONSTANTS.SCORE_WIDTH} text-right ${className}`}>
      <div
        className={`${UI_CONSTANTS.SCORE_FONT_SIZE} font-bold leading-none`}
      >
        {score}
      </div>
    </div>
  );
}
