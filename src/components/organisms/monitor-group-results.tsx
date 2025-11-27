"use client";

import { useEffect, useRef } from "react";
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

    // 現在の試合が見えるようにスクロール
    useEffect(() => {
        if (containerRef.current && currentMatchId) {
            const currentElement = containerRef.current.querySelector(
                `[data-match-id="${currentMatchId}"]`
            );
            if (currentElement) {
                currentElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    }, [currentMatchId]);

    // 順序を逆にする（右から左へ表示）
    const reversedMatches = [...groupMatches].reverse();

    // チーム名を取得（全試合で同じはずなので最初の試合から）
    const teamAName = groupMatches[0]?.playerA.teamName || "";
    const teamBName = groupMatches[0]?.playerB.teamName || "";

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex gap-16 overflow-x-auto p-12 min-h-[800px] items-center justify-center bg-transparent",
                className
            )}
        >
            {reversedMatches.map((match) => {
                const isCompleted = match.isCompleted;
                const isWinnerA = match.winner === "playerA";
                const isWinnerB = match.winner === "playerB";
                const isDraw = match.winner === "draw";

                // 不透明度の計算
                const getOpacity = (isWinner: boolean) => {
                    if (!isCompleted) return "opacity-30"; // 未試合
                    if (isDraw) return "opacity-100"; // 引き分け
                    if (isWinner) return "opacity-100"; // 勝者
                    return "opacity-40"; // 敗者
                };

                const opacityA = getOpacity(isWinnerA);
                const opacityB = getOpacity(isWinnerB);

                return (
                    <div
                        key={match.matchId}
                        data-match-id={match.matchId}
                        className="flex-shrink-0 flex flex-col h-[700px] w-[200px] items-center justify-between py-8"
                    >
                        {/* 選手A (上) */}
                        <div className={cn("flex items-center gap-4 flex-1 justify-end relative", opacityA)}>
                            {/* 勝者マーク (赤丸) */}
                            {isWinnerA && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="50" cy="50" r="40" stroke="#DC2626" strokeWidth="8" />
                                    </svg>
                                </div>
                            )}

                            {/* 選手名 (縦書き) */}
                            <VerticalText text={match.playerA.displayName} variant="player" />

                            {/* ラウンドラベル */}
                            <VerticalText
                                text={match.roundId ? getTeamMatchRoundLabelById(match.roundId) : ""}
                                variant="round"
                            />
                        </div>

                        {/* 区切り */}
                        <div className="h-16 w-[1px] bg-gray-700 my-4" />

                        {/* 選手B (下) */}
                        <div className={cn("flex items-center gap-4 flex-1 justify-start relative", opacityB)}>
                            {/* 選手名 (縦書き) */}
                            <VerticalText text={match.playerB.displayName} variant="player" />

                            {/* ラウンドラベル */}
                            <VerticalText
                                text={match.roundId ? getTeamMatchRoundLabelById(match.roundId) : ""}
                                variant="round"
                            />

                            {/* 勝者マーク (赤丸) */}
                            {isWinnerB && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
                                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="50" cy="50" r="40" stroke="#DC2626" strokeWidth="8" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* チーム名を一番右に縦に表示 */}
            <div className="flex-shrink-0 flex flex-col gap-8 items-center justify-center h-[700px]">
                <div className="flex items-center justify-center">
                    <VerticalText text={teamAName} variant="team" />
                </div>
                <div className="flex items-center justify-center">
                    <VerticalText text={teamBName} variant="team" />
                </div>
            </div>
        </div>
    );
}
