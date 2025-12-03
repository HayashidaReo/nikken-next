"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/utils";
import type { MonitorData } from "@/types/monitor.schema";
import { getTeamMatchRoundLabelById, WINNER_TYPES } from "@/lib/constants";
import { AdjustVerticalText } from "@/components/atoms/adjust-vertical-text";
import { DrawTriangle } from "@/components/atoms/draw-triangle";
import { getMonitorPlayerOpacity } from "@/lib/utils/monitor";

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
                "grid items-center p-4 min-h-[800px] bg-white w-full",
                className
            )}
            style={{
                gridTemplateColumns: `repeat(${totalColumns}, 1fr)`,
            }}
        >
            {reversedMatches.map((match) => {
                const isCompleted = match.isCompleted;
                const isWinnerA = match.winner === WINNER_TYPES.PLAYER_A;
                const isWinnerB = match.winner === WINNER_TYPES.PLAYER_B;
                const isDraw = match.winner === WINNER_TYPES.DRAW;
                // 現在の試合かつ、試合が完了している場合のみ強調表示（初期表示などで未実施の試合が強調されるのを防ぐ）(今は使っていない)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const isCurrentMatch = match.matchId === currentMatchId && match.isCompleted;

                const opacityA = getMonitorPlayerOpacity(isCompleted, isWinnerA, isDraw);
                const opacityB = getMonitorPlayerOpacity(isCompleted, isWinnerB, isDraw);

                return (
                    <div
                        key={match.matchId}
                        className={cn(
                            "relative transition-all duration-500"
                        )}
                    >
                        <div
                            data-match-id={match.matchId}
                            className={cn(
                                gridLayoutClass,
                                "relative z-10 w-full",
                            )}
                        >
                            {/* --- 4/10: 選手A (上) --- */}
                            <div className={cn("flex flex-col items-center justify-end pb-2 w-full h-full relative", opacityA, isWinnerA && "border-8 border-red-600 rounded-xl w-[85%] mx-auto")}>
                                <AdjustVerticalText
                                    textContent={match.playerA.displayName}
                                    baseFontSize={12}
                                    minFontSize={2.5}
                                    maxHeight={390}
                                    className="font-bold text-black tracking-widest"
                                />
                            </div>

                            {/* --- 2/10: ラウンドラベル (中央) --- */}
                            <div className="flex items-center justify-center w-full h-full relative">
                                <div className="absolute inset-0 flex items-center justify-center -z-10">
                                    <div className="w-px h-full bg-border/30" />
                                </div>

                                <div className="bg-background/80 px-4 py-4 rounded-sm border border-gray-500 shadow-sm backdrop-blur-sm min-w-[4rem] text-center">
                                    <AdjustVerticalText
                                        textContent={match.roundId ? getTeamMatchRoundLabelById(match.roundId) : ""}
                                        baseFontSize={3}
                                        minFontSize={1}
                                        maxHeight={120}
                                        className="font-medium text-gray-700 tracking-widest"
                                    />
                                </div>
                                {isDraw && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                        <DrawTriangle size={120} />
                                    </div>
                                )}
                            </div>

                            {/* --- 4/10: 選手B (下) --- */}
                            <div className={cn("flex flex-col items-center justify-start pt-2 w-full h-full relative", opacityB, isWinnerB && "border-8 border-red-600 rounded-xl w-[85%] mx-auto")}>
                                <AdjustVerticalText
                                    textContent={match.playerB.displayName}
                                    baseFontSize={12}
                                    minFontSize={2.5}
                                    maxHeight={390}
                                    className="font-bold text-black tracking-widest"
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
                    <AdjustVerticalText
                        textContent={teamAName}
                        baseFontSize={8}
                        minFontSize={3}
                        maxHeight={400}
                        className="font-bold text-black tracking-widest"
                    />
                </div>

                {/* 2/10: スペース */}
                <div className="flex items-center justify-center h-full text-muted-foreground/50 text-xl font-serif italic">

                </div>

                {/* 4/10: チームB */}
                <div className="flex items-center justify-center h-full border-l-4 border-primary/20">
                    <AdjustVerticalText
                        textContent={teamBName}
                        baseFontSize={8}
                        minFontSize={3}
                        maxHeight={400}
                        className="font-bold text-black tracking-widest"
                    />
                </div>
            </div>
        </div>
    );
}