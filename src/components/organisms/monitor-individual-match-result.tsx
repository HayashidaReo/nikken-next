"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/utils";
import { MonitorPlayerResult } from "@/components/molecules/monitor-player-result";
import { WINNER_TYPES } from "@/lib/constants";

interface MonitorIndividualMatchResultProps {
    playerA: {
        displayName: string;
        teamName: string;
        score: number;
    };
    playerB: {
        displayName: string;
        teamName: string;
        score: number;
    };
    roundName: string;
    winner: "playerA" | "playerB" | "draw" | "none" | null;
    isCompleted: boolean;
    className?: string;
}

export function MonitorIndividualMatchResult({
    playerA,
    playerB,
    roundName,
    winner,
    isCompleted,
    className,
}: MonitorIndividualMatchResultProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const isWinnerA = winner === WINNER_TYPES.PLAYER_A;
    const isWinnerB = winner === WINNER_TYPES.PLAYER_B;
    const isDraw = winner === WINNER_TYPES.DRAW;

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex flex-col items-center justify-center p-12 min-h-[600px] bg-transparent w-full",
                className
            )}
        >
            {/* ラウンド名 */}
            <div className="mb-12">
                <div className="bg-background/80 px-8 py-4 rounded-lg border-2 border-primary/40 shadow-lg backdrop-blur-sm">
                    <span className="text-8xl font-bold text-primary">{roundName}</span>
                </div>
            </div>

            {/* 試合結果 */}
            <div className="flex items-center gap-16 w-full max-w-6xl">
                {/* 選手A */}
                <MonitorPlayerResult
                    displayName={playerA.displayName}
                    teamName={playerA.teamName}
                    isWinner={isWinnerA}
                    isDraw={isDraw}
                    isCompleted={isCompleted}
                />

                {/* VS */}
                <div className="flex-shrink-0">
                    <div className="text-8xl font-black text-muted-foreground/10 italic">
                        VS
                    </div>
                </div>

                {/* 選手B */}
                <MonitorPlayerResult
                    displayName={playerB.displayName}
                    teamName={playerB.teamName}
                    isWinner={isWinnerB}
                    isDraw={isDraw}
                    isCompleted={isCompleted}
                />
            </div>
        </div>
    );
}
