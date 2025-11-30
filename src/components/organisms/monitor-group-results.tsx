"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/utils";
import type { MonitorData } from "@/types/monitor.schema";
import { getTeamMatchRoundLabelById } from "@/lib/constants";
import { VerticalText } from "@/components/atoms/vertical-text";

interface MonitorGroupResultsProps {
    groupMatches: NonNullable<MonitorData["groupMatches"]>;
    currentMatchId: string | null;
    className?: string;
}

export function MonitorGroupResults({
    groupMatches,
    currentMatchId,
    className,
}: MonitorGroupResultsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const reversedMatches = [...groupMatches].reverse();
    const teamAName = groupMatches[0]?.playerA.teamName || "";
    const teamBName = groupMatches[0]?.playerB.teamName || "";

    const totalColumns = reversedMatches.length + 1;

    // grid-rows-[4fr_2fr_4fr] に変更
    const gridLayoutClass = "grid grid-rows-[4fr_2fr_4fr]";

    return (
        <div
            ref={containerRef}
            className={cn(
                // 親コンテナでの items-center は維持（全体を画面垂直中央にするため）
                "grid items-center p-12 min-h-[800px] bg-transparent w-full",
                className
            )}
            style={{
                gridTemplateColumns: `repeat(${totalColumns}, 1fr)`,
            }}
        >
            {reversedMatches.map((match) => {
                const isCompleted = match.isCompleted;
                const isWinnerA = match.winner === "playerA";
                const isWinnerB = match.winner === "playerB";
                const isDraw = match.winner === "draw";
                const isCurrentMatch = match.matchId === currentMatchId;

                const getOpacity = (isWinner: boolean) => {
                    if (!isCompleted) return "opacity-40 grayscale";
                    if (isDraw) return "opacity-50 scale-95";
                    if (isWinner) return "opacity-100 font-bold";
                    return "opacity-50 scale-95";
                };

                const opacityA = getOpacity(isWinnerA);
                const opacityB = getOpacity(isWinnerB);

                return (
                    <div
                        key={match.matchId}
                        className={cn(
                            "relative transition-all duration-500",
                            isCurrentMatch && "scale-105"
                        )}
                    >
                        <div
                            data-match-id={match.matchId}
                            className={cn(
                                gridLayoutClass,
                                "relative z-10 w-full",
                                isCurrentMatch && [
                                    "shadow-[0_0_40px_rgba(255,255,255,0.4)]",
                                    "bg-white/5",
                                    "rounded-lg",
                                ]
                            )}
                        >
                            {/* --- 4/10: 選手A (上) --- */}
                            <div className={cn("flex flex-col items-center justify-end pb-4 w-full h-full relative", opacityA)}>
                                {isWinnerA && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                        <WinnerStamp />
                                    </div>
                                )}
                                <VerticalText
                                    text={match.playerA.displayName}
                                    variant="player"
                                    baseFontSize={10}
                                    maxHeight={400}
                                />
                            </div>

                            {/* --- 2/10: ラウンドラベル (中央) --- */}
                            <div className="flex items-center justify-center w-full h-full relative">
                                <div className="absolute inset-0 flex items-center justify-center -z-10">
                                    <div className="w-px h-full bg-border/30" />
                                </div>

                                <div className="bg-background/80 px-3 py-4 rounded-sm border border-border/40 shadow-sm backdrop-blur-sm">
                                    <VerticalText
                                        text={match.roundId ? getTeamMatchRoundLabelById(match.roundId) : ""}
                                        variant="round"
                                        baseFontSize={3}
                                        maxHeight={120}
                                    />
                                </div>
                            </div>

                            {/* --- 4/10: 選手B (下) --- */}
                            <div className={cn("flex flex-col items-center justify-start pt-4 w-full h-full relative", opacityB)}>
                                {isWinnerB && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                        <WinnerStamp />
                                    </div>
                                )}
                                <VerticalText
                                    text={match.playerB.displayName}
                                    variant="player"
                                    baseFontSize={10}
                                    maxHeight={350}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* --- チーム名エリア (一番右) --- */}
            <div className={cn(gridLayoutClass, "w-full")}>
                {/* 4/10: チームA */}
                <div className="flex items-center justify-center h-full border-l-4 border-primary/20">
                    <VerticalText
                        text={teamAName}
                        variant="team"
                        baseFontSize={12}
                        maxHeight={380}
                        className="font-bold tracking-widest"
                    />
                </div>

                {/* 2/10: スペース */}
                <div className="flex items-center justify-center h-full text-muted-foreground/50 text-xl font-serif italic">

                </div>

                {/* 4/10: チームB */}
                <div className="flex items-center justify-center h-full border-l-4 border-primary/20">
                    <VerticalText
                        text={teamBName}
                        variant="team"
                        baseFontSize={12}
                        maxHeight={380}
                        className="font-bold tracking-widest"
                    />
                </div>
            </div>
        </div>
    );
}

function WinnerStamp() {
    return (
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            <circle cx="50" cy="50" r="40" stroke="#DC2626" strokeWidth="6" />
        </svg>
    );
}