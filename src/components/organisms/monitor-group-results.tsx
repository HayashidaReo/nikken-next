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
    className,
}: MonitorGroupResultsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const reversedMatches = [...groupMatches].reverse();
    const teamAName = groupMatches[0]?.playerA.teamName || "";
    const teamBName = groupMatches[0]?.playerB.teamName || "";

    // ★変更点1: grid-rows-3 で高さを強制的に3等分します
    // これにより、上・中・下がそれぞれ親要素の高さの 33.3% ずつを占有します。
    const gridLayoutClass = "grid grid-rows-3 h-[700px] w-[200px]";

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex gap-0 overflow-x-auto p-12 min-h-[800px] items-center bg-transparent",
                className
            )}
        >
            {reversedMatches.map((match) => {
                const isCompleted = match.isCompleted;
                const isWinnerA = match.winner === "playerA";
                const isWinnerB = match.winner === "playerB";
                const isDraw = match.winner === "draw";

                const getOpacity = (isWinner: boolean) => {
                    if (!isCompleted) return "opacity-40 grayscale";
                    if (isDraw) return "opacity-100";
                    if (isWinner) return "opacity-100 font-bold";
                    return "opacity-50 scale-95";
                };

                const opacityA = getOpacity(isWinnerA);
                const opacityB = getOpacity(isWinnerB);

                return (
                    <div key={match.matchId} className="relative flex-shrink-0 flex">
                        {/* 試合カラム */}
                        <div
                            data-match-id={match.matchId}
                            className={cn(gridLayoutClass, "relative z-10")}
                        >
                            {/* --- 1/3: 選手A (上) --- */}
                            {/* items-end で下側に寄せて、中央のラウンド名に近づけます */}
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
                                    maxHeight={400} // 1/3エリア (約230px) に収まる高さに制限
                                />
                            </div>

                            {/* --- 1/3: ラウンドラベル (中央) --- */}
                            {/* items-center justify-center で完全に真ん中に置きます */}
                            <div className="flex items-center justify-center w-full h-full relative">
                                {/* 背景の装飾線（必要であれば） */}
                                <div className="absolute inset-0 flex items-center justify-center -z-10">
                                    <div className="w-px h-full bg-border/30" />
                                </div>

                                <div className="bg-background/80 px-3 py-4 rounded-sm border border-border/40 shadow-sm backdrop-blur-sm">
                                    <VerticalText
                                        text={match.roundId ? getTeamMatchRoundLabelById(match.roundId) : ""}
                                        variant="round"
                                        baseFontSize={4}
                                        maxHeight={120}
                                    />
                                </div>
                            </div>

                            {/* --- 1/3: 選手B (下) --- */}
                            {/* items-start で上側に寄せて、中央のラウンド名に近づけます */}
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
                                    maxHeight={400}
                                />
                            </div>
                        </div>

                    </div>
                );
            })}

            {/* --- チーム名エリア (一番右) --- */}
            {/* ここも同じく3等分グリッドを適用して高さを完全に合わせます */}
            <div className={cn(gridLayoutClass, "ml-8 min-w-[100px]")}>
                {/* 1/3: チームA */}
                <div className="flex items-center justify-center h-full border-l-4 border-primary/20">
                    <VerticalText
                        text={teamAName}
                        variant="team"
                        baseFontSize={12}
                        maxHeight={400}
                        className="font-bold tracking-widest"
                    />
                </div>

                {/* 1/3: VS表記 */}
                <div className="flex items-center justify-center h-full text-muted-foreground/50 text-xl font-serif italic">
                </div>

                {/* 1/3: チームB */}
                <div className="flex items-center justify-center h-full border-l-4 border-primary/20">
                    <VerticalText
                        text={teamBName}
                        variant="team"
                        baseFontSize={12}
                        maxHeight={400}
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