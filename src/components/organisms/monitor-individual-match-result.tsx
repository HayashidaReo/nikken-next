"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/utils";
import { AdjustHorizontalText } from "@/components/atoms/adjust-horizontal-text";

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

    const isWinnerA = winner === "playerA";
    const isWinnerB = winner === "playerB";
    const isDraw = winner === "draw";

    const getOpacity = (isWinner: boolean) => {
        if (!isCompleted) return "opacity-40";
        if (isDraw) return "opacity-100";
        if (isWinner) return "opacity-100 font-bold";
        return "opacity-50";
    };

    const opacityA = getOpacity(isWinnerA);
    const opacityB = getOpacity(isWinnerB);

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
                <div className={cn("flex-1 relative flex flex-col items-center", opacityA)}>
                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                        <AdjustHorizontalText
                            baseFontSize={6}
                            minFontSize={2}
                            maxWidth={500}
                            textContent={playerA.teamName}
                            className="text-muted-foreground font-medium leading-tight"
                        />
                        <AdjustHorizontalText
                            baseFontSize={16}
                            minFontSize={4}
                            maxWidth={500}
                            textContent={playerA.displayName}
                            className="font-bold leading-none"
                        />
                        {isWinnerA && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                <WinnerStamp />
                            </div>
                        )}
                    </div>
                </div>

                {/* VS */}
                <div className="flex-shrink-0">
                    <div className="text-8xl font-black text-muted-foreground/10 italic">
                        VS
                    </div>
                </div>

                {/* 選手B */}
                <div className={cn("flex-1 relative flex flex-col items-center", opacityB)}>
                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                        <AdjustHorizontalText
                            baseFontSize={6}
                            minFontSize={2}
                            maxWidth={500}
                            textContent={playerB.teamName}
                            className="text-muted-foreground font-medium leading-tight"
                        />
                        <AdjustHorizontalText
                            baseFontSize={16}
                            minFontSize={4}
                            maxWidth={500}
                            textContent={playerB.displayName}
                            className="font-bold leading-none"
                        />
                        {isWinnerB && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                <WinnerStamp />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function WinnerStamp() {
    return (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            <circle cx="100" cy="100" r="80" stroke="#DC2626" strokeWidth="12" />
        </svg>
    );
}
