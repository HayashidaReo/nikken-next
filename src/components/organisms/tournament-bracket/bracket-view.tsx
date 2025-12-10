"use client";

import React, { useMemo } from "react";
import { MatchGroup } from "@/types/match.schema";
import { Tournament } from "@/types/tournament.schema";
import { Team } from "@/types/team.schema";
import { cn } from "@/lib/utils";
import { User, Trophy } from "lucide-react";

interface BracketViewProps {
    tournament: Tournament;
    matchGroups: MatchGroup[];
    teams: Team[];
}

// レイアウト定数
const ITEM_HEIGHT = 80; // 各チーム/ノードのベース高さ
const LEVEL_WIDTH = 200; // 各ラウンド間の幅
const NODE_WIDTH = 180; // チームカードの幅
const MATCH_LABEL_SIZE = 30; // W1等のラベルサイズ

export const BracketView: React.FC<BracketViewProps> = ({ tournament, matchGroups, teams }) => {
    // チームIDからチーム情報を取得するマップ
    const teamsMap = useMemo(() => {
        return new Map(teams.map(t => [t.teamId, t]));
    }, [teams]);

    // 試合をsortOrder（全体連番）ごとにマップ
    const matchLookup = useMemo(() => {
        const map = new Map<number, MatchGroup>(); // key: sortOrder
        matchGroups.forEach(m => {
            map.set(m.sortOrder, m);
        });
        return map;
    }, [matchGroups]);

    const rounds = tournament.rounds;
    const neededRounds = Math.ceil(Math.log2(Math.max(teams.length, 2)));
    const totalRounds = Math.max(rounds.length, neededRounds);
    const roundOffset = totalRounds - rounds.length;

    // 仮想的なツリー構造を生成
    // 各ラウンドの必要スロット数 = 2^(totalRounds - 1 - rIndex)
    // sortOrderはトーナメント全体での連番（0始まり）とする
    const virtualStructure = useMemo(() => {
        let matchCounter = 0;

        const structure = Array.from({ length: totalRounds }).map((_, rIndex) => {
            const matchCount = Math.pow(2, totalRounds - 1 - rIndex);

            const realRoundIndex = rIndex - roundOffset;
            const roundData = realRoundIndex >= 0 ? rounds[realRoundIndex] : undefined;
            const roundId = roundData?.roundId;

            // 各スロット（試合）のデータを生成
            const slots = Array.from({ length: matchCount }).map((_, i) => {
                const currentSortOrder = matchCounter + i;
                // sortOrderで一致する試合データを使用
                const match = matchLookup.get(currentSortOrder);

                const key = match?.matchGroupId || `virtual-${rIndex}-${currentSortOrder}`;

                return {
                    key,
                    roundIndex: rIndex,
                    sortOrder: currentSortOrder, // 全体連番をセット
                    match,
                    nextMatchId: undefined as string | undefined // 後で設定
                };
            });

            matchCounter += matchCount; // カウンタを進める

            return {
                roundIndex: rIndex,
                slots,
                roundId
            };
        });

        return structure;
    }, [rounds, totalRounds, matchLookup, roundOffset]);

    const firstRoundSlotCount = virtualStructure[0]?.slots.length || 0;

    // Y座標計算用マップ
    const posMap = useMemo(() => {
        const map = new Map<string, { x: number, y: number }>();

        virtualStructure.forEach((level) => {
            level.slots.forEach((slot, index) => {
                const rIndex = level.slots[0].roundIndex;
                const setX = rIndex * LEVEL_WIDTH + NODE_WIDTH + 120;
                const slotSpan = Math.pow(2, rIndex + 1);
                const centerSlot = index * slotSpan + slotSpan / 2;
                const y = centerSlot * ITEM_HEIGHT;

                map.set(slot.key, { x: setX, y });
            });
        });
        return map;
    }, [virtualStructure]);

    // 特定のリーフ位置にあるチームを追跡する（Bye考慮）
    const traceTeam = (leafIndex: number): Team | undefined => {
        let rIndex = 0;
        let mIndex = Math.floor(leafIndex / 2);
        let side: "teamA" | "teamB" = leafIndex % 2 === 0 ? "teamA" : "teamB";

        while (rIndex < totalRounds) {
            const currentLevel = virtualStructure[rIndex];
            if (!currentLevel) return undefined;

            const slot = currentLevel.slots[mIndex];

            if (slot && slot.match) {
                const teamId = side === "teamA" ? slot.match.teamAId : slot.match.teamBId;
                if (teamId) return teamsMap.get(teamId);
                return undefined;
            }

            // マッチがない場合、次のラウンドへ進む
            side = mIndex % 2 === 0 ? "teamA" : "teamB";
            mIndex = Math.floor(mIndex / 2);
            rIndex++;
        }
        return undefined;
    };

    const totalHeight = (firstRoundSlotCount * 2) * ITEM_HEIGHT;
    const totalWidth = totalRounds * LEVEL_WIDTH + NODE_WIDTH + 100;

    // ヘルパー関数: 試合の結果に基づいて線のスタイルを決定
    // parentMatch: 次のラウンドの試合（合流先）
    // currentSide: 親試合における自分のサイド（"teamA" or "teamB"）
    const getPathStyle = (match: MatchGroup | undefined, parentMatch: MatchGroup | undefined, currentSide: "teamA" | "teamB") => {
        let isWinnerPath = false;

        if (parentMatch?.isCompleted && parentMatch.winnerTeam) {
            // 親試合が完了している場合、親の勝者と自分のサイドが一致すれば黒
            // つまり、自分が勝って親試合に進み、そこでさらに勝った（または親試合の勝者が自分側から来た）場合
            if (parentMatch.winnerTeam === currentSide) {
                isWinnerPath = true;
            }
        } else {
            // 親試合が未完了の場合、自分が完了していれば黒（ここまで勝ち上がっている）
            if (match?.isCompleted && match.winnerTeam) {
                isWinnerPath = true;
            }
        }

        const strokeColor = isWinnerPath ? "#0F172A" : "#CBD5E1";
        const strokeWidth = isWinnerPath ? "3" : "2";
        return { strokeColor, strokeWidth };
    };

    return (
        <div className="w-full overflow-auto bg-white min-h-screen p-8">
            <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">

                    {/* Connections between matches - horizontal lines to vertical bar */}
                    {virtualStructure.map((level, rIndex) => {
                        const nextLevel = virtualStructure[rIndex + 1];
                        if (!nextLevel) return null;

                        return level.slots.map((slot, sIndex) => {
                            const currentPos = posMap.get(slot.key);

                            const parentIndex = Math.floor(sIndex / 2);
                            const parentSlot = nextLevel.slots[parentIndex];

                            if (currentPos && parentSlot) {
                                const nextPos = posMap.get(parentSlot.key);
                                if (nextPos) {
                                    const side = sIndex % 2 === 0 ? "teamA" : "teamB";
                                    const { strokeColor, strokeWidth } = getPathStyle(slot.match, parentSlot.match, side);

                                    const bracketX = nextPos.x - 60;

                                    // Horizontal line to vertical bar
                                    return (
                                        <path
                                            key={`conn-h-${slot.key}`}
                                            d={`M ${currentPos.x} ${currentPos.y} H ${bracketX}`}
                                            fill="none"
                                            stroke={strokeColor}
                                            strokeWidth={strokeWidth}
                                        />
                                    );
                                }
                            }
                            return null;
                        });
                    })}

                    {/* Vertical line on the vertical bar (Merge point) */}
                    {virtualStructure.map((level, rIndex) => {
                        const nextLevel = virtualStructure[rIndex + 1];
                        if (!nextLevel) return null;

                        return nextLevel.slots.flatMap((parentSlot, parentIndex) => {
                            const nextPos = posMap.get(parentSlot.key);
                            if (!nextPos) return [];

                            const bracketX = nextPos.x - 60;

                            const child1Slot = level.slots[parentIndex * 2];
                            const child2Slot = level.slots[parentIndex * 2 + 1];

                            const child1Pos = child1Slot ? posMap.get(child1Slot.key) : null;
                            const child2Pos = child2Slot ? posMap.get(child2Slot.key) : null;

                            const lines = [];

                            // Vertical line for Child 1 (Team A side of parent)
                            if (child1Pos) {
                                const { strokeColor, strokeWidth } = getPathStyle(child1Slot?.match, parentSlot.match, "teamA");
                                lines.push(
                                    <path
                                        key={`conn-v-child1-${parentSlot.key}`}
                                        d={`M ${bracketX} ${child1Pos.y} V ${nextPos.y}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                );
                            }

                            // Vertical line for Child 2 (Team B side of parent)
                            if (child2Pos) {
                                const { strokeColor, strokeWidth } = getPathStyle(child2Slot?.match, parentSlot.match, "teamB");
                                lines.push(
                                    <path
                                        key={`conn-v-child2-${parentSlot.key}`}
                                        d={`M ${bracketX} ${child2Pos.y} V ${nextPos.y}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                );
                            }

                            return lines;
                        });
                    })}

                    {/* Connections from merge point to next match node (Horizontal line) - Split into two */}
                    {virtualStructure.map((level, rIndex) => {
                        const nextLevel = virtualStructure[rIndex + 1];
                        if (!nextLevel) return null;

                        return nextLevel.slots.flatMap((parentSlot, parentIndex) => {
                            const nextPos = posMap.get(parentSlot.key);
                            if (!nextPos) return [];

                            const child1Slot = level.slots[parentIndex * 2];
                            const child2Slot = level.slots[parentIndex * 2 + 1];

                            const bracketX = nextPos.x - 60;
                            const lines = [];

                            // Horizontal line part 1 (from Child 1 / Team A side) - Draw slightly offset or same pos?
                            // Drawing same line twice with different colors relies on z-order.
                            // To make them visible if one is black and one gray, we might need to be careful.
                            // However, logically, they merge into ONE path to the node.
                            // But usually in bracket, they merge at the vertical bar.
                            // User wants "path from merge point to next merge point" to be black ONLY if won.
                            // So this horizontal segment from Vertical Bar to Node is actually represented by the Winner's path.
                            // If Team A won, this segment should be black. If Team B won, it should be black.
                            // If neither won (or parent not valid), checking individual wins?

                            // Let's use the parent match's completed status to determine the single line color.
                            // If parent match is completed, it means ONE of them won and advanced FROM here.
                            // So if ANY child advanced to this node, it should be black?
                            // Or closer to "If parent match is completed, winner advanced through here -> black".
                            // If parent match is NOT completed, but children are waiting -> black?

                            // Let's defer to: If either child caused a black path in Step 2, this Step 3 should be black.

                            const { strokeColor: c1Color } = getPathStyle(child1Slot?.match, parentSlot.match, "teamA");
                            const { strokeColor: c2Color } = getPathStyle(child2Slot?.match, parentSlot.match, "teamB");

                            const isBlack = c1Color === "#0F172A" || c2Color === "#0F172A";
                            const strokeColor = isBlack ? "#0F172A" : "#CBD5E1";
                            const strokeWidth = isBlack ? "3" : "2";

                            return (
                                <path
                                    key={`merge-to-node-${parentSlot.key}`}
                                    d={`M ${bracketX} ${nextPos.y} H ${nextPos.x}`}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth={strokeWidth}
                                />
                            );
                        });
                    })}
                </svg>

                {/* Match Nodes (SortOrder Labels) */}
                {virtualStructure.map((level, rIndex) => {
                    return level.slots.map((slot, sIndex) => {
                        const pos = posMap.get(slot.key);
                        if (!pos) return null;

                        const isFinished = slot.match?.isCompleted;

                        return (
                            <div
                                key={`node-${slot.key}`}
                                className={cn(
                                    "absolute flex items-center justify-center text-xs font-bold text-white rounded-sm cursor-pointer hover:scale-110 transition-transform shadow-sm",
                                    isFinished ? "bg-slate-800" : "bg-slate-400"
                                )}
                                style={{
                                    left: pos.x - MATCH_LABEL_SIZE / 2,
                                    top: pos.y,
                                    width: MATCH_LABEL_SIZE,
                                    height: MATCH_LABEL_SIZE,
                                    transform: `translateY(${MATCH_LABEL_SIZE / 2}px)`
                                }}
                            >
                                {slot.sortOrder}
                            </div>
                        );
                    });
                })}

                {/* Final Winner Line */}
                {(() => {
                    const finalLevel = virtualStructure[virtualStructure.length - 1];
                    const finalSlot = finalLevel?.slots[0];
                    if (finalSlot) {
                        const pos = posMap.get(finalSlot.key);
                        if (pos) {
                            // Final winner path: check if final match has winner
                            const { strokeColor, strokeWidth } = getPathStyle(finalSlot.match, undefined, "teamA");
                            return (
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                                    <path
                                        d={`M ${pos.x} ${pos.y} H ${pos.x + 60}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                </svg>
                            );
                        }
                    }
                })()}

                {/* Teams (Left Column) - Render all leaf slots */}
                <div className="absolute left-0 top-0 flex flex-col gap-0">
                    {virtualStructure[0]?.slots.map((slot, index) => {
                        const leafIndexA = index * 2;
                        const leafIndexB = index * 2 + 1;

                        const teamA = traceTeam(leafIndexA);
                        const teamB = traceTeam(leafIndexB);

                        const slotY_A = leafIndexA * ITEM_HEIGHT;
                        const slotY_B = leafIndexB * ITEM_HEIGHT;

                        const isWinnerA = slot.match?.winnerTeam === "teamA";
                        const isWinnerB = slot.match?.winnerTeam === "teamB";

                        return (
                            <React.Fragment key={`teams-wrapper-${slot.key}`}>
                                {/* Team A Slot */}
                                <div style={{ position: 'absolute', top: slotY_A, left: 0, height: ITEM_HEIGHT }} className="flex items-center">
                                    <TeamCard team={teamA} isWinner={isWinnerA} />
                                </div>

                                {/* Team B Slot */}
                                <div style={{ position: 'absolute', top: slotY_B, left: 0, height: ITEM_HEIGHT }} className="flex items-center">
                                    <TeamCard team={teamB} isWinner={isWinnerB} />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Team connection lines - drawn in main SVG */}
                <svg className="absolute left-0 top-0 w-full h-full pointer-events-none z-10">
                    {virtualStructure[0]?.slots.map((slot, index) => {
                        const matchPos = posMap.get(slot.key);
                        if (!matchPos) return null;

                        const leafIndexA = index * 2;
                        const leafIndexB = index * 2 + 1;

                        const slotY_A = leafIndexA * ITEM_HEIGHT;
                        const slotY_B = leafIndexB * ITEM_HEIGHT;

                        const isWinnerA = slot.match?.winnerTeam === "teamA";
                        const isWinnerB = slot.match?.winnerTeam === "teamB";

                        const bracketX = matchPos.x - 60;

                        // チームが勝った場合にのみ黒線で描画
                        const styleA = isWinnerA ? { stroke: "#0F172A", strokeWidth: "3" } : { stroke: "#CBD5E1", strokeWidth: "2" };
                        const styleB = isWinnerB ? { stroke: "#0F172A", strokeWidth: "3" } : { stroke: "#CBD5E1", strokeWidth: "2" };

                        const pathA = (
                            <path
                                key={`team-line-a-${slot.key}`}
                                d={`M ${NODE_WIDTH} ${slotY_A + ITEM_HEIGHT / 2} H ${bracketX} V ${matchPos.y} H ${matchPos.x}`}
                                fill="none"
                                {...styleA}
                            />
                        );

                        const pathB = (
                            <path
                                key={`team-line-b-${slot.key}`}
                                d={`M ${NODE_WIDTH} ${slotY_B + ITEM_HEIGHT / 2} H ${bracketX} V ${matchPos.y} H ${matchPos.x}`}
                                fill="none"
                                {...styleB}
                            />
                        );

                        // 勝者の線を後に描画（前面に表示）
                        return (
                            <React.Fragment key={`team-lines-${slot.key}`}>
                                {!isWinnerA && pathA}
                                {!isWinnerB && pathB}
                                {isWinnerA && pathA}
                                {isWinnerB && pathB}
                            </React.Fragment>
                        );
                    })}
                </svg>

                {/* Trophy */}
                {(() => {
                    const finalLevel = virtualStructure[virtualStructure.length - 1];
                    const finalSlot = finalLevel?.slots[0];
                    if (finalSlot) {
                        const pos = posMap.get(finalSlot.key);
                        // show trophy if final match has winner
                        if (pos && finalSlot.match?.winnerTeam) {
                            return (
                                <div
                                    className="absolute text-yellow-500"
                                    style={{
                                        left: pos.x + 60,
                                        top: pos.y + MATCH_LABEL_SIZE / 2 - 16,
                                    }}
                                >
                                    <Trophy size={32} />
                                </div>
                            );
                        }
                    }
                })()}
            </div>
        </div>
    );
};

const TeamCard = ({ team, isWinner }: { team: Team | undefined, isWinner: boolean }) => {
    return (
        <div className={cn(
            "w-[180px] h-[50px] border rounded-md flex items-center px-3 gap-2 bg-white transition-all",
            isWinner ? "border-slate-800 shadow-sm" : "border-slate-300 text-slate-500"
        )}>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <User size={14} className="text-slate-400" />
            </div>
            <span className={cn("text-sm truncate font-medium", isWinner ? "text-slate-900" : "")}>
                {team?.teamName || "TBD"}
            </span>
        </div>
    );
};