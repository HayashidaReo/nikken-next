"use client";

import { cn } from "@/lib/utils/utils";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

export interface MatchScoreDisplayProps {
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

export function MatchScoreDisplay({
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
}: MatchScoreDisplayProps) {
    const srText = isCompleted
        ? `${playerADisplayName ?? "A"} ${playerAScore}点 対 ${playerBDisplayName ?? "B"} ${playerBScore}点`
        : `${playerADisplayName ?? "A"} と ${playerBDisplayName ?? "B"} の試合は未試合です。`;

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="flex items-center justify-center gap-1 py-1">
                <div className={cn("text-3xl font-bold", playerAColor)}>{playerAScore}</div>
                <div className="text-xl text-gray-400">-</div>
                <div className={cn("text-3xl font-bold", playerBColor)}>{playerBScore}</div>
            </div>

            <div className="flex items-center justify-center gap-1 mt-1 h-5">
                <div className="flex items-center justify-center min-w-[40px]">
                    <PenaltyDisplay hansokuCount={playerAHansoku as HansokuLevel} ariaLabel={`${playerADisplayName ?? "A"}の反則`} />
                </div>
                <div className="text-gray-400 text-xs">|</div>
                <div className="flex items-center justify-center min-w-[40px]">
                    <PenaltyDisplay hansokuCount={playerBHansoku as HansokuLevel} ariaLabel={`${playerBDisplayName ?? "B"}の反則`} />
                </div>
            </div>

            <span className="sr-only">{srText}</span>
        </div>
    );
}
