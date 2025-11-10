"use client";

import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface ScoreCellProps {
    playerAScore: number;
    playerBScore: number;
    playerAColor?: string;
    playerBColor?: string;
    playerADisplayName?: string;
    playerBDisplayName?: string;
    playerAHansoku?: HansokuLevel;
    playerBHansoku?: HansokuLevel;
    isCompleted?: boolean;
    className?: string;
}

export function ScoreCell({
    playerAScore,
    playerBScore,
    playerAColor,
    playerBColor,
    playerADisplayName,
    playerBDisplayName,
    playerAHansoku,
    playerBHansoku,
    isCompleted = false,
    className,
}: ScoreCellProps) {
    const srText = isCompleted
        ? `${playerADisplayName ?? "A"} ${playerAScore}点 対 ${playerBDisplayName ?? "B"} ${playerBScore}点`
        : `${playerADisplayName ?? "A"} と ${playerBDisplayName ?? "B"} の試合は未試合です。`;

    return (
        <TableCell className={cn("py-1 px-3 text-center", className)}>
            <div className="flex items-center justify-center gap-1 py-1">
                <div className={cn("text-xl", playerAColor)}>{playerAScore}</div>
                <div className="text-xl">-</div>
                <div className={cn("text-xl", playerBColor)}>{playerBScore}</div>
            </div>

            <div className="flex items-center justify-center gap-1 mt-1 h-5">
                <div className="flex items-center justify-center min-w-[40px]">
                    <PenaltyDisplay hansokuCount={playerAHansoku as HansokuLevel} ariaLabel={`${playerADisplayName ?? "A"}の反則`} />
                </div>
                <div className="text-gray-400">|</div>
                <div className="flex items-center justify-center min-w-[40px]">
                    <PenaltyDisplay hansokuCount={playerBHansoku as HansokuLevel} ariaLabel={`${playerBDisplayName ?? "B"}の反則`} />
                </div>
            </div>

            <span className="sr-only">{srText}</span>
        </TableCell>
    );
}

export default ScoreCell;
