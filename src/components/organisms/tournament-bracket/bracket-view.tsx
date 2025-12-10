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

    // 試合をラウンドIDごとにマップ
    const matchLookup = useMemo(() => {
        const map = new Map<string, MatchGroup>(); // key: roundId-sortOrder
        matchGroups.forEach(m => {
            map.set(`${m.roundId}-${m.sortOrder}`, m);
        });
        return map;
    }, [matchGroups]);

    const rounds = tournament.rounds;
    const neededRounds = Math.ceil(Math.log2(Math.max(teams.length, 2)));
    const totalRounds = Math.max(rounds.length, neededRounds);
    const roundOffset = totalRounds - rounds.length;

    // 仮想的なツリー構造を生成
    const virtualStructure = useMemo(() => {
        const structure = Array.from({ length: totalRounds }).map((_, rIndex) => {
            const matchCount = Math.pow(2, totalRounds - 1 - rIndex);
            const realRoundIndex = rIndex - roundOffset;
            const roundData = realRoundIndex >= 0 ? rounds[realRoundIndex] : undefined;
            const roundId = roundData?.roundId;

            const slots = Array.from({ length: matchCount }).map((_, i) => {
                const sortOrder = i; // 0-based
                const match = roundId ? matchLookup.get(`${roundId}-${sortOrder}`) : undefined;
                const key = match?.matchGroupId || `virtual-${rIndex}-${sortOrder}`;

                return {
                    roundId,
                    roundIndex: rIndex,
                    sortOrder,
                    match,
                    key
                };
            });
            return { round: roundData, slots };
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
                const setX = rIndex * LEVEL_WIDTH + NODE_WIDTH + 40;
                const slotSpan = Math.pow(2, rIndex + 1);
                const centerSlot = index * slotSpan + slotSpan / 2;
                const y = centerSlot * ITEM_HEIGHT;

                map.set(slot.key, { x: setX, y });
            });
        });
        return map;
    }, [virtualStructure]);

    // チーム検索（シード対応）
    const traceTeamForLeaf = (leafIndex: number): Team | undefined => {
        let rIndex = 0;
        let mIndex = Math.floor(leafIndex / 2);
        let side: "teamA" | "teamB" = leafIndex % 2 === 0 ? "teamA" : "teamB";

        while (rIndex < totalRounds) {
            const realRoundIndex = rIndex - roundOffset;
            const roundData = realRoundIndex >= 0 ? rounds[realRoundIndex] : undefined;

            if (!roundData) return undefined;

            const sortOrder = mIndex;
            const match = matchLookup.get(`${roundData.roundId}-${sortOrder}`);

            if (match) {
                const teamId = side === "teamA" ? match.teamAId : match.teamBId;
                if (teamId) return teamsMap.get(teamId);
                return undefined;
            }

            if (side === "teamB") return undefined;

            const nextMIndex = Math.floor(mIndex / 2);
            const nextSide = mIndex % 2 === 0 ? "teamA" : "teamB";

            rIndex++;
            mIndex = nextMIndex;
            side = nextSide;
        }
        return undefined;
    };

    const totalHeight = (firstRoundSlotCount * 2) * ITEM_HEIGHT;
    const totalWidth = totalRounds * LEVEL_WIDTH + NODE_WIDTH + 100;

    // ヘルパー関数: 試合の結果に基づいて線のスタイルを決定
    const getStrokeStyle = (match: MatchGroup | undefined) => {
        const isCompleted = match?.isCompleted;
        const strokeColor = isCompleted ? "#0F172A" : "#CBD5E1";
        const strokeWidth = isCompleted ? "3" : "2";
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
                                    const { strokeColor, strokeWidth } = getStrokeStyle(slot.match);
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

                            const child1 = level.slots[parentIndex * 2];
                            const child2 = level.slots[parentIndex * 2 + 1];
                            
                            const child1Pos = child1 ? posMap.get(child1.key) : null;
                            const child2Pos = child2 ? posMap.get(child2.key) : null;

                            // 垂直線は、親試合が完了しているかどうかで線の色を決定する
                            // 勝者が確定した場合、次のラウンドへ進む線は黒くする
                            const { strokeColor, strokeWidth } = getStrokeStyle(parentSlot.match);

                            const lines = [];

                            // Draw vertical line covering the span of the two children
                            if (child1Pos && child2Pos) {
                                lines.push(
                                    <path
                                        key={`conn-v-span-${parentSlot.key}`}
                                        d={`M ${bracketX} ${child1Pos.y} V ${child2Pos.y}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                );
                            } else if (child1Pos) {
                                // For the first round where the bottom team might be missing (Bye)
                                lines.push(
                                    <path
                                        key={`conn-v-span-${parentSlot.key}`}
                                        d={`M ${bracketX} ${child1Pos.y} V ${nextPos.y}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                );
                            }

                            return lines;
                        });
                    })}
                    
                    {/* Connections from merge point to next match node (Horizontal line) */}
                    {virtualStructure.map((level, rIndex) => {
                        const nextLevel = virtualStructure[rIndex + 1];
                        if (!nextLevel) return null;

                        return nextLevel.slots.flatMap((parentSlot) => {
                            const nextPos = posMap.get(parentSlot.key);
                            if (!nextPos) return [];

                            const bracketX = nextPos.x - 60;
                            const { strokeColor, strokeWidth } = getStrokeStyle(parentSlot.match);
                            
                            // Horizontal line from merge point to parent match node
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


                    {/* Final Winner Line */}
                    {(() => {
                        const finalLevel = virtualStructure[virtualStructure.length - 1];
                        const finalSlot = finalLevel?.slots[0];
                        if (finalSlot) {
                            const pos = posMap.get(finalSlot.key);
                            if (pos) {
                                const { strokeColor, strokeWidth } = getStrokeStyle(finalSlot.match);
                                return (
                                    <path
                                        d={`M ${pos.x} ${pos.y} H ${pos.x + 60}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                );
                            }
                        }
                    })()}
                </svg>

                {/* Teams (Left Column) - Render all leaf slots */}
                <div className="absolute left-0 top-0 flex flex-col gap-0">
                    {virtualStructure[0]?.slots.map((slot, index) => {
                        const leafIndexA = index * 2;
                        const leafIndexB = index * 2 + 1;

                        const teamA = traceTeamForLeaf(leafIndexA) || teams[leafIndexA];
                        const teamB = traceTeamForLeaf(leafIndexB) || teams[leafIndexB];

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

                        const bracketX = matchPos.x - 0;

                        // チームが勝った場合にのみ黒線で描画
                        const styleA = isWinnerA ? { stroke: "#0F172A", strokeWidth: "3" } : { stroke: "#CBD5E1", strokeWidth: "2" };
                        const styleB = isWinnerB ? { stroke: "#0F172A", strokeWidth: "3" } : { stroke: "#CBD5E1", strokeWidth: "2" };

                        return (
                            <React.Fragment key={`team-lines-${slot.key}`}>
                                <path
                                    d={`M ${NODE_WIDTH} ${slotY_A + ITEM_HEIGHT / 2} H ${bracketX} V ${matchPos.y} H ${matchPos.x}`}
                                    fill="none"
                                    {...styleA}
                                />
                                <path
                                    d={`M ${NODE_WIDTH} ${slotY_B + ITEM_HEIGHT / 2} H ${bracketX} V ${matchPos.y} H ${matchPos.x}`}
                                    fill="none"
                                    {...styleB}
                                />
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